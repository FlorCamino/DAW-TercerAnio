import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dtos/input/create-project.dto';
import { UpdateProjectDto } from './dtos/input/update-project.dto';
import { ProjectsMapper } from './mappers/projects.mapper';
import { ProjectResponseDto } from './dtos/output/project-response.dto';
import { ProjectListResponseDto } from './dtos/output/project-list-response.dto';
import { ProjectStatusEnum } from '../../common/enums/project-status.enum';
import { Client } from '../clients/entities/client.entity';
import { ClientStatusEnum } from '../../common/enums/client-status.enum';
import { addAccentInsensitiveLike } from '../../common/utils/query-filters.util';
import { Task } from '../tasks/entities/task.entity';
import { TaskStatusEnum } from '../../common/enums/task-status.enum';

interface ProjectFilters {
  status?: string;
  name?: string;
  clientId?: string;
  page?: string;
  limit?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) { }

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    if (dto.clientId) {
      await this.validateActiveClient(dto.clientId);
    }

    this.validateEndDate(dto.endDate);

    const project = this.projectRepository.create({
      name: dto.name,
      status: dto.status ?? ProjectStatusEnum.ACTIVO,
      clientId: dto.clientId ?? null,
      endDate: dto.endDate ?? null,
    });

    const saved = await this.projectRepository.save(project);

    return this.findOne(saved.id);
  }

  async findAll(filters: ProjectFilters = {}): Promise<ProjectListResponseDto> {
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client');

    const status = this.normalizeStatus(filters.status);
    const name = filters.name?.trim();
    const clientId = this.parseOptionalPositiveInt(filters.clientId, 'cliente');
    const page = this.parsePositiveInt(filters.page, 1);
    const limit = this.parseOptionalPositiveInt(filters.limit, 'limite');

    if (status) {
      query.andWhere('project.status = :status', { status });
    }

    if (name) {
      addAccentInsensitiveLike(query, 'project.name', 'name', name);
    }

    if (clientId) {
      query.andWhere('project.clientId = :clientId', { clientId });
    }

    query.orderBy('project.id', 'DESC');

    if (limit) {
      query.skip((page - 1) * limit).take(limit);
    }

    const [projects, total] = await query.getManyAndCount();
    const response = ProjectsMapper.toListResponse(projects);

    return {
      ...response,
      total,
      page,
      limit: limit ?? total,
      totalPages: limit ? Math.ceil(total / limit) : total > 0 ? 1 : 0,
    };
  }

  async findOne(id: number): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        client: true,
        tasks: true,
      },
      order: {
        tasks: {
          id: 'ASC',
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }

    return ProjectsMapper.toResponse(project);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        tasks: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }

    const onlyChangingStatus =
      dto.status !== undefined &&
      dto.name === undefined &&
      dto.clientId === undefined &&
      dto.endDate === undefined;

    if (project.status === ProjectStatusEnum.BAJA && !onlyChangingStatus) {
      throw new BadRequestException(
        'No se puede modificar un proyecto dado de baja',
      );
    }

    if (dto.name !== undefined) {
      project.name = dto.name;
    }

    if (dto.status !== undefined) {
      await this.validateStatusChange(project, dto.status);
      project.status = dto.status;
    }

    if (dto.endDate !== undefined) {
      this.validateEndDate(dto.endDate);
      project.endDate = dto.endDate;
    }

    if (dto.clientId !== undefined) {
      if (dto.clientId === null) {
        project.clientId = null;
        project.client = null;
      } else {
        const client = await this.validateActiveClient(dto.clientId);
        project.clientId = client.id;
        project.client = client;
      }
    }

    const saved = await this.projectRepository.save(project);

    if (saved.status === ProjectStatusEnum.BAJA) {
      await this.markProjectTasksAsInactive(saved.id);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        tasks: true,
      },
    });
    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }
    if (project.status === ProjectStatusEnum.BAJA) {
      throw new BadRequestException('El proyecto ya está dado de baja');
    }
    project.status = ProjectStatusEnum.BAJA;
    const saved = await this.projectRepository.save(project);
    await this.markProjectTasksAsInactive(saved.id);
    return this.findOne(saved.id);
  }

  private async validateStatusChange(
    project: Project,
    nextStatus: ProjectStatusEnum,
  ): Promise<void> {
    if (project.status === nextStatus) {
      return;
    }

    if (nextStatus === ProjectStatusEnum.FINALIZADO) {
      const pendingTasks = (project.tasks ?? []).filter(
        (task) => task.status !== TaskStatusEnum.FINALIZADO,
      );

      if (pendingTasks.length > 0) {
        throw new BadRequestException(
          'No se puede finalizar el proyecto porque tiene tareas pendientes o dadas de baja',
        );
      }
    }
  }

  private async markProjectTasksAsInactive(projectId: number): Promise<void> {
    await this.taskRepository.update(
      { projectId },
      { status: TaskStatusEnum.BAJA },
    );
  }

  private async validateActiveClient(clientId: number): Promise<Client> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con id ${clientId} no encontrado`);
    }

    if (client.status !== ClientStatusEnum.ACTIVO) {
      throw new BadRequestException(
        'Solo se puede asociar un cliente en estado activo',
      );
    }

    return client;
  }

  private validateEndDate(endDate?: string | null): void {
    if (!endDate) {
      return;
    }

    const selectedDate = this.parseDateOnly(endDate);
    const today = new Date();
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    if (!selectedDate || selectedDate < todayOnly) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser anterior a la fecha actual',
      );
    }
  }

  private parseDateOnly(value: string): Date | null {
    const [year, month, day] = value.split('T')[0].split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  private normalizeStatus(status?: string): ProjectStatusEnum | undefined {
    const trimmedStatus = status?.trim();

    if (!trimmedStatus) {
      return undefined;
    }

    const normalizedStatus = trimmedStatus.toLowerCase() as ProjectStatusEnum;

    if (!Object.values(ProjectStatusEnum).includes(normalizedStatus)) {
      throw new BadRequestException('Estado de proyecto inválido');
    }

    return normalizedStatus;
  }

  private parsePositiveInt(
    value: string | undefined,
    defaultValue: number,
  ): number {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      return defaultValue;
    }

    return parsedValue;
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
        `El ${fieldName} debe ser un número positivo`,
      );
    }

    return parsedValue;
  }
}
