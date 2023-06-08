import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { WishesService } from 'src/wishes/wishes.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, user: User) {
    const wishesArr: Wish[] = [];

    for (const itemId of createWishlistDto.items) {
      const selectedWish = await this.wishesService.findOne(itemId);
      if (selectedWish) {
        wishesArr.push(selectedWish);
      }
    }
    const newWishlist = {
      ...createWishlistDto,
      owner: user,
      items: wishesArr,
    };

    const createdWishlist = await this.wishlistRepository.save(newWishlist);
    return createdWishlist;
  }

  findAll() {
    return this.wishlistRepository.find({
      relations: {
        items: true,
        owner: true,
      },
    });
  }

  findOne(id: number) {
    return this.wishlistRepository.findOne({
      where: { id },
      relations: {
        items: true,
        owner: true,
      },
    });
  }

  async update(id: number, updateWishlistDto: UpdateWishlistDto, user: User) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: {
        items: true,
        owner: true,
      },
    });

    if (user.id !== wishlist.owner.id) {
      throw new ForbiddenException(
        'Нельзя редактировать чужие списки подарков',
      );
    }

    const updatedItems: Wish[] = [];
    if (updateWishlistDto.items) {
      for (const itemId of updateWishlistDto.items) {
        const selectedWish = await this.wishesService.findOne(itemId);
        if (selectedWish) {
          updatedItems.push(selectedWish);
        }
      }
    }

    wishlist.name = updateWishlistDto.name || wishlist.name;
    wishlist.description =
      updateWishlistDto.description || wishlist.description;
    wishlist.image = updateWishlistDto.image || wishlist.image;
    wishlist.items = updatedItems.length > 0 ? updatedItems : wishlist.items;
    wishlist.owner = user;

    const updatedWishlist = await this.wishlistRepository.save(wishlist);
    return updatedWishlist;
  }

  async remove(id: number, user: User) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: {
        items: true,
        owner: true,
      },
    });
    if (!wishlist) {
      throw new NotFoundException('Такого вишлиста не существует');
    }
    if (user.id !== wishlist.owner.id) {
      throw new ForbiddenException('Нельзя удалять чужие вишлисты');
    }
    await this.wishlistRepository.remove(wishlist);
    return wishlist;
  }
}
