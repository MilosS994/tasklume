export class Task {
  readonly id: string;
  readonly userId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    userId: string,
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high',
    status: 'todo' | 'in_progress' | 'done',
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
