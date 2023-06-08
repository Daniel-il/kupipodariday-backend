import { ForbiddenException, Injectable, Req } from '@nestjs/common';
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

  async update(id: number, updateWishDto: UpdateWishDto, user: User) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: true,
      },
    });

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Нельзя изменять чужие желания');
    }

    if (wish.raised > 0) {
      throw new ForbiddenException(
        'Нельзя менять стоимость желания, на которое уже скинулись',
      );
    }
  }

  findTopOne() {
    return this.wishRepository.find({
      order: { copied: 'DESC' },
      relations: {
        owner: true,
        offers: true,
      },
      take: 1,
    });
  }

  findLastOne() {
    return this.wishRepository.find({
      order: { createdAt: 'DESC' },
      relations: {
        owner: true,
        offers: true,
      },
      take: 1,
    });
  }
  findUserWishes(user: User) {
    return this.wishRepository.findOne({
      where: { owner: { id: user.id } },
    });
  }
  async remove(id: number, user: User) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        offers: true,
      },
    });
    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Нельзя удалять чужие желания');
    }
    return this.wishRepository.delete({ id });
  }

  async copy(wish: Wish, user: User) {
    if (user.id === wish.owner.id) {
      throw new ForbiddenException('Нельзя копировать свой подарок');
    }

    const existingCopy = await this.wishRepository.findOne({
      where: { name: wish.name, owner: { id: user.id } },
    });

    if (existingCopy) {
      throw new ForbiddenException('Копия уже существует');
    }

    const copiedWish = this.wishRepository.create({
      name: wish.name,
      image: wish.image,
      link: wish.link,
      price: wish.price,
      description: wish.description,
      owner: user,
    });

    await this.wishRepository.update(wish.id, { copied: wish.copied + 1 });

    return {
      name: copiedWish.name,
      image: copiedWish.image,
      link: copiedWish.link,
      price: copiedWish.price,
      description: copiedWish.description,
    };
  }
}
