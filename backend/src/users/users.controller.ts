import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SelfOrAdminGuard } from './self-or-admin.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { RoleGuard } from './roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from './roles.decorator';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return user;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  findOneByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, SelfOrAdminGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SelfOrAdminGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
