import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dtos/input/create-task.dto';
import { UpdateTaskDto } from './dtos/input/update-task.dto';
import { TaskStatus } from '../../common/enums/task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateTaskDto) {
    const project = await this.projectRepository.findOneBy({
      id: dto.projectId,
    });

    if (!project) {
      throw new NotFoundException(
        `Project con id ${dto.projectId} no existe`,
      );
    }

    const task = this.taskRepository.create({
      description: dto.description,
      status: dto.status ?? TaskStatus.PENDING,
      project,
    });

    return this.taskRepository.save(task);
  }

  findAll(status?: string) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) {
      throw new NotFoundException(`Task con id ${id} no existe`);
    }

    return task;
  }

  async update(id: number, dto: UpdateTaskDto) {
    await this.findOne(id);

    await this.taskRepository.update(id, dto);

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.taskRepository.delete(id);

    return {
      success: true,
      message: `Task ${id} eliminada correctamente`,
    };
  }
}