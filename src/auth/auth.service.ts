import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };

    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUserData(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    const matched = await compare(password, user.password);

    if (user && matched) {
      const { password, ...result } = user;
      return result;
    }
    throw new HttpException('Неправильный логин или пароль', 401);
  }

  signin(user: User): { access_token: string } {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: 'super-strong-secret',
        expiresIn: '7d',
      }),
    };
  }
}
