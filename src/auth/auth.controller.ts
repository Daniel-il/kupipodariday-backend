import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LocalGuard } from 'src/guards/local.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() newUser: CreateUserDto) {
    const existingUsernameUser = await this.usersService.findUserByQuery(
      newUser.username,
    );

    const existingEmailUser = await this.usersService.findUserByQuery(
      newUser.email,
    );

    if (existingUsernameUser || existingEmailUser) {
      throw new HttpException(
        'Пользователь с такими данными уже существует',
        HttpStatus.CONFLICT,
      );
    }

    return this.usersService.create(newUser);
  }

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() req) {
    return this.authService.signin(req.user);
  }
}
