import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { WishesService } from 'src/wishes/wishes.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly wishService: WishesService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  async findCurrentUser(@Req() req) {
    const user = await this.usersService.findOne(req.user.id);
    const { password, ...result } = user;

    return result;
  }
  @Get('/me/wishes')
  getCurrentUserWishes(@Req() req) {
    return this.wishService.findUserWishes(req.user);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    return await this.wishService.findUserWishes(user);
  }

  @Get(':username')
  async findOneByUsername(@Param('username') username: string) {
    const user = await this.usersService.findByUsername(username);
    return user;
  }

  @Post('find')
  async findOneByQuery(@Body() body: { query: string }) {
    const { query } = body;

    const user = await this.usersService.findUserByQuery(query);
    const { password, ...result } = user;
    if (!user) {
      throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
    }
    return result;
  }

  @Patch('me')
  async updateCurrentUser(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    await this.usersService.update(req.user.id, updateUserDto);

    const user = await this.usersService.findOne(req.user.id);
    const { password, ...result } = user;

    return result;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
