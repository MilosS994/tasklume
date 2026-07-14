import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

interface UserUpdateData {
  username?: string;
  email?: string;
  fullName?: string;
  passwordHash?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(row: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    fullName: string | null;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      row.id,
      row.email,
      row.username,
      row.passwordHash,
      row.fullName,
      row.role,
      row.createdAt,
      row.updatedAt,
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userExists) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        passwordHash: hashedPassword,
      },
    });

    return this.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({});

    return users.map((user) => this.toDomain(user));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    return user ? this.toDomain(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    const dataToUpdate: UserUpdateData = {};

    if (updateUserDto.username) {
      dataToUpdate.username = updateUserDto.username;
    }

    if (updateUserDto.email) {
      dataToUpdate.email = updateUserDto.email;
    }

    if (updateUserDto.fullName) {
      dataToUpdate.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.password) {
      dataToUpdate.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.toDomain(updatedUser);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.user.delete({ where: { id } });

    return {
      message: 'User deleted successfully',
    };
  }
}
