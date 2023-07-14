import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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
    const { email, username } = updateUserDto;

    const existingEmailUser = await this.userRepository.findOne({
      where: { email, id: Not(id) },
    });
    if (existingEmailUser) {
      throw new ConflictException('Пользователь с таким email уже существует.');
    }

    const existingUsernameUser = await this.userRepository.findOne({
      where: { username, id: Not(id) },
    });
    if (existingUsernameUser) {
      throw new ConflictException(
        'Пользователь с таким никнеймом уже существует.',
      );
    }

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
