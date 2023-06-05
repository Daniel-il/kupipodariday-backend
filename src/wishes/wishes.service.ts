import { Injectable, Req } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, user: User) {
    return this.wishRepository.save({ ...createWishDto, owner: user });
  }

  findAll() {
    return this.wishRepository.find({
      relations: {
        owner: true,
        offers: true,
      },
    });
  }

  findOne(id: number) {
    return this.wishRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: true,
      },
    });
  }

  update(id: number, updateWishDto: UpdateWishDto) {
    this.wishRepository.update(id, updateWishDto);
  }

  findTopOne() {
    return this.wishRepository.find({
      take: 1,
      order: { copied: 'DESC' },
      relations: {
        owner: true,
        offers: true,
      },
    });
  }

  findLastOne() {
    return this.wishRepository.find({
      take: 1,
      order: { createdAt: 'DESC' },
    });
  }
  remove(id: number) {
    return this.wishRepository.delete({ id });
  }
}
