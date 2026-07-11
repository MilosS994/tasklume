import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './dto/create-task.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  create(createTaskDto: CreateTaskDto, userId: string) {
    const newTask = new Task(
      randomUUID(),
      userId,
      createTaskDto.title,
      createTaskDto.description,

      createTaskDto.priority || ('medium' as any),
      TaskStatus.TODO,
      new Date(),
      new Date(),
    );

    this.tasks.push(newTask);
    return newTask;
  }

  findAll(): Task[] {
    return this.tasks;
  }

  findAllByUserId(userId: string): Task[] {
    return this.tasks.filter((task) => task.userId === userId);
  }

  findOne(id: string) {
    const task = this.tasks.find((task) => task.id === id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);

    if (updateTaskDto.description) {
      task.description = updateTaskDto.description;
    }

    if (updateTaskDto.title) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.priority) {
      task.priority = updateTaskDto.priority;
    }

    if (updateTaskDto.status) {
      task.status = updateTaskDto.status;
    }

    task.updatedAt = new Date();

    return task;
  }

  remove(id: string) {
    const task = this.findOne(id);

    this.tasks = this.tasks.filter((t) => t.id !== task.id);

    return { message: 'Task deleted successfully' };
  }
}
