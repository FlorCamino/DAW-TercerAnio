import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dtos/input/create-task.dto';
import { UpdateTaskDto } from './dtos/input/update-task.dto';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { TasksMapper, TaskListResponseDto } from './mappers/tasks.mapper';
import { TaskResponseDto } from './dtos/output/task-response.dto';
import { addAccentInsensitiveLike } from '../../common/utils/query-filters.util';

interface TaskFilters {
  estado?: string;
  descripcion?: string;
  proyectoId?: string;
  page: number;
  limit: number;
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    const project = await this.findProject(dto.proyectoId);

    const task = this.taskRepository.create({
      descripcion: dto.descripcion,
      estado: dto.estado ?? TaskStatus.PENDING,
      proyectoId: dto.proyectoId,
      project,
    });

    const saved = await this.taskRepository.save(task);
    const taskWithProject = await this.findTaskWithProject(saved.id);

    return TasksMapper.toResponse(taskWithProject);
  }

  async findAll(filters: TaskFilters): Promise<TaskListResponseDto> {
    const page =
      Number.isFinite(filters.page) && filters.page > 0 ? filters.page : 1;

    const limit =
      Number.isFinite(filters.limit) && filters.limit > 0 ? filters.limit : 10;

    const estado = filters.estado?.trim();
    const descripcion = filters.descripcion?.trim();
    const proyectoId = this.parseOptionalPositiveInt(filters.proyectoId, 'proyecto');

    if (estado && !this.isValidStatus(estado)) {
      throw new BadRequestException('El estado indicado no es valido');
    }

    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project');

    if (estado) {
      query.andWhere('task.estado = :estado', { estado });
    }

    if (descripcion) {
      addAccentInsensitiveLike(query, 'task.descripcion', 'descripcion', descripcion);
    }

    if (proyectoId) {
      query.andWhere('task.proyectoId = :proyectoId', { proyectoId });
    }

    const [tasks, total] = await query
      .orderBy('task.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return TasksMapper.toListResponse(tasks, total, page, limit);
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const task = await this.findTaskWithProject(id);

    return TasksMapper.toResponse(task);
  }

  async update(id: number, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.findTaskWithProject(id);

    const onlyChangingStatus =
      dto.estado !== undefined &&
      dto.descripcion === undefined &&
      dto.proyectoId === undefined;

    const isReactivatingDeletedTask =
      task.estado === TaskStatus.DELETED &&
      dto.estado !== undefined &&
      dto.estado !== TaskStatus.DELETED;

    if (
      task.estado === TaskStatus.DELETED &&
      !onlyChangingStatus &&
      !isReactivatingDeletedTask
    ) {
      throw new BadRequestException(
        'No se puede modificar una tarea dada de baja',
      );
    }

    if (dto.proyectoId !== undefined) {
      task.project = await this.findProject(dto.proyectoId);
      task.proyectoId = dto.proyectoId;
    }

    if (dto.descripcion !== undefined) {
      task.descripcion = dto.descripcion;
    }

    if (dto.estado !== undefined) {
      if (!this.isValidStatus(dto.estado)) {
        throw new BadRequestException('El estado indicado no es valido');
      }

      task.estado = dto.estado;
    }

    const saved = await this.taskRepository.save(task);
    const taskWithProject = await this.findTaskWithProject(saved.id);

    return TasksMapper.toResponse(taskWithProject);
  }

  async remove(id: number): Promise<TaskResponseDto> {
    const task = await this.findTaskWithProject(id);

    if (task.estado === TaskStatus.DELETED) {
      throw new BadRequestException('La tarea ya esta dada de baja');
    }

    task.estado = TaskStatus.DELETED;

    const saved = await this.taskRepository.save(task);
    const taskWithProject = await this.findTaskWithProject(saved.id);

    return TasksMapper.toResponse(taskWithProject);
  }

  private async findTaskWithProject(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con id ${id} no existe`);
    }

    return task;
  }

  private async findProject(id: number): Promise<Project> {
    const project = await this.projectRepository.findOneBy({ id });

    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no existe`);
    }

    return project;
  }

  private isValidStatus(status: string): status is TaskStatus {
    return Object.values(TaskStatus).includes(status as TaskStatus);
  }

  private parseOptionalPositiveInt(
    value: string | undefined,
    fieldName: string,
  ): number | undefined {
    if (value === undefined || value.trim() === '') {
      return undefined;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      throw new BadRequestException(
        `El ${fieldName} debe ser un numero positivo`,
      );
    }

    return parsedValue;
  }
}
