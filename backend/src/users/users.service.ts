import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor() {
    const defaultPasswordHash = bcrypt.hashSync('Admin12345', 10);

    this.users.push(
      new User(
        randomUUID(),
        'admin@taskflow.local',
        'admin',
        defaultPasswordHash,
        'Glavni Admin',
        'admin',
        new Date(),
        new Date(),
      ),
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = this.users.find(
      (user) => user.email === createUserDto.email,
    );
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const newUser = new User(
      randomUUID(),
      createUserDto.email,
      createUserDto.username,
      hashedPassword,
      '',
      'user',
      new Date(),
      new Date(),
    );

    this.users.push(newUser);

    return newUser;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    const user = this.users.find((user) => id === user.id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = this.findOne(id);

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    user.updatedAt = new Date();

    return user;
  }

  remove(id: string) {
    const userIndex = this.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    this.users.splice(userIndex, 1);

    return { message: 'User deleted successfully.' };
  }
}
