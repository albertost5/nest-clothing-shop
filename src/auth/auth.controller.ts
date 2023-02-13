import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/index';
import { AuthGuard } from '@nestjs/passport';
import { GetUser, GetRawHeaders } from './decorators/index';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @UseGuards(AuthGuard())
  @Get('private')
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @GetRawHeaders() rawHeaders: string[],
  ) {
    console.log({ rawHeaders });
    return {
      message: 'Hello World!',
      user,
      userEmail: email,
    };
  }
}
