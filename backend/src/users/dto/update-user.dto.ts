import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  @MaxLength(75, { message: 'Full name must not exceed 75 characters' })
  readonly fullName?: string;
}

export class AdminUpdateUserDto extends PartialType(UpdateUserDto) {
  @IsOptional()
  @IsEnum(['user', 'admin'], {
    message: 'Role must be either "user" or "admin"',
  })
  readonly role?: 'user' | 'admin';
}
