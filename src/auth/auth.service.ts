import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    try {
      const user = this.userRepository.create({
        password: bcrypt.hashSync(password, +this.configService.get('ROUNDS')),
        ...userData,
      });

      await this.userRepository.save(user);

      const { id, email, fullName } = user;

      return {
        ...user,
        token: this.getJwtToken({ id }),
      };
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user || !bcrypt.compareSync(password, user.password))
      // Not knowing if its an invalid email or password.
      throw new UnauthorizedException('Not valid credentials.');

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDbErrors(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Check internal logs.');
  }
}
