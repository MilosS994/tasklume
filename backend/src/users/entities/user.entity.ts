export class User {
  constructor(
    id: string,
    email: string,
    username: string,
    passwordHash: string,
    fullName: string,
    role: 'user' | 'admin',
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.passwordHash = passwordHash;
    this.fullName = fullName;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
