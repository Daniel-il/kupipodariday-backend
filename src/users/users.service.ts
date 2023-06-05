import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await hash(createUserDto.password, 10);
    const newUser = { ...createUserDto, password: passwordHash };
    return this.userRepository.save(newUser);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  findUserByQuery(queryParam: string) {
    return this.userRepository.findOne({
      where: [{ email: queryParam }, { username: queryParam }],
    });
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    const passwordHash = await hash(updateUserDto.password, 10);
    const updatedUser = { ...updateUserDto, password: passwordHash };

    await this.userRepository.update(id, updatedUser);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.userRepository.delete({ id });
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: [{ username: username }],
    });
  }
}
