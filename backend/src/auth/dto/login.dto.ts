import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  readonly password!: string;
}
