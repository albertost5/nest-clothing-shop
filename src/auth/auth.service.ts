import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return createUserDto;
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  private handleDbErrors( error: any ): never {
    this.logger.error(error);
    if ( error.code === '23505' ) {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Check internal logs.');
  }
}
