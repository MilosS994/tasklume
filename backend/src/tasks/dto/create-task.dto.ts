import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(55, { message: 'Title must not exceed 55 characters' })
  readonly title!: string;

  @IsString()
  @MinLength(3, { message: 'Description must be at least 3 characters long' })
  @MaxLength(555, { message: 'Description must not exceed 555 characters' })
  readonly description!: string;

  @IsOptional()
  @IsEnum(TaskPriority, {
    message: 'Task priority must be low, medium or high',
  })
  readonly priority!: TaskPriority;
}
