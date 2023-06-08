import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from 'src/guards/jwt.guard';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}
  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(createWishDto, req.user);
  }

  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @Get('last')
  getLastOne() {
    return this.wishesService.findLastOne();
  }

  @Get('top')
  getTopOne() {
    return this.wishesService.findTopOne();
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req,
  ) {
    this.wishesService.update(+id, updateWishDto, req.user);
    return this.wishesService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishesService.findOne(+id);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copy(@Req() req, @Param('id') id: string) {
    const wish = await this.wishesService.findOne(+id);

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    const copiedWish = await this.wishesService.copy(wish, req.user);

    return this.wishesService.create(copiedWish, req.user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    this.wishesService.remove(+id, req.user);
    return this.wishesService.findOne(+id);
  }
}
