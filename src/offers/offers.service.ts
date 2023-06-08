import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { Repository } from 'typeorm';
import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private wishesService: WishesService,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    const targetWish = await this.wishesService.findOne(createOfferDto.itemId);

    if (targetWish.owner.id === user.id) {
      throw new ForbiddenException('Нельзя скидываться на свои подарки');
    }

    if (targetWish.raised === targetWish.price) {
      throw new BadRequestException('нужная сумма уже собрана');
    }

    const newRaisedAmount =
      Number(targetWish.raised) + Number(createOfferDto.amount);
    const remainingAmount = targetWish.price - targetWish.raised;

    if (newRaisedAmount > targetWish.price) {
      throw new BadRequestException(
        `можно добавить сумму, которая равна или не превышает ${remainingAmount}`,
      );
    }

    await this.wishesService.update(
      targetWish.id,
      { raised: newRaisedAmount },
      user,
    );

    const newOffer = await this.offerRepository.create({
      user,
      ...createOfferDto,
      item: targetWish,
    });

    return this.offerRepository.save(newOffer);
  }

  findAll() {
    return this.offerRepository.find({
      relations: {
        item: true,
        user: true,
      },
    });
  }

  findOne(id: number) {
    return this.offerRepository.findOne({
      where: { id },
      relations: {
        item: true,
        user: true,
      },
    });
  }

  update(id: number, updateOfferDto: UpdateOfferDto) {
    return this.offerRepository.update(id, updateOfferDto);
  }

  remove(id: number) {
    return this.offerRepository.delete({ id });
  }
}
