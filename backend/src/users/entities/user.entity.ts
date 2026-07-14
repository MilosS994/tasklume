import { Exclude } from 'class-transformer';

export class User {
  id: string;
  email: string;
  username: string;

  @Exclude()
  passwordHash: string;

  fullName?: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    email: string,
    username: string,
    passwordHash: string,
    fullName: string | null | undefined,
    role: 'user' | 'admin',
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.passwordHash = passwordHash;
    this.fullName = fullName ?? null;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
