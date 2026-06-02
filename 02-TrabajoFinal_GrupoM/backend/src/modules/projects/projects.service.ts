import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dtos/input/create-project.dto';
import { UpdateProjectDto } from './dtos/input/update-project.dto';
import { ProjectsMapper } from './mappers/projects.mapper';
import { ProjectResponseDto } from './dtos/output/project-response.dto';
import { ProjectListResponseDto } from './dtos/output/project-list-response.dto';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { Client } from '../clients/entities/client.entity';
import { ClientStatus } from '../../common/enums/client-status.enum';
import { addAccentInsensitiveLike } from '../../common/utils/query-filters.util';

interface ProjectFilters {
  estado?: string;
  nombre?: string;
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
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    if (dto.clientId) {
      await this.validateActiveClient(dto.clientId);
    }

    const project = this.projectRepository.create({
      name: dto.name,
      status: dto.status ?? ProjectStatus.ACTIVE,
      clientId: dto.clientId ?? null,
      endDate: dto.endDate ?? null,
    });
    const saved = await this.projectRepository.save(project);
    return ProjectsMapper.toResponse(saved);
  }

  async findAll(filters: ProjectFilters = {}): Promise<ProjectListResponseDto> {
    const query = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client');

    const estado = this.normalizeStatus(filters.estado);
    const nombre = filters.nombre?.trim();
    const clientId = this.parseOptionalPositiveInt(filters.clientId, 'cliente');
    const page = this.parsePositiveInt(filters.page, 1);
    const limit = this.parseOptionalPositiveInt(filters.limit, 'limite');

    if (estado) {
      query.andWhere('project.status = :estado', { estado });
    }

    if (nombre) {
      addAccentInsensitiveLike(query, 'project.name', 'nombre', nombre);
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
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }
    return ProjectsMapper.toResponse(project);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }
    const onlyChangingStatus =
      dto.status !== undefined &&
      dto.name === undefined &&
      dto.clientId === undefined &&
      dto.endDate === undefined;

    if (project.status === ProjectStatus.INACTIVE && !onlyChangingStatus) {
      throw new BadRequestException(
        'No se puede modificar un proyecto dado de baja',
      );
    }

    if (dto.clientId) {
      await this.validateActiveClient(dto.clientId);
    }

    Object.assign(project, dto);
    const saved = await this.projectRepository.save(project);
    return ProjectsMapper.toResponse(saved);
  }

  async remove(id: number): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findOne({ where: { id } });
    if (!project) {
      throw new NotFoundException(`Proyecto con id ${id} no encontrado`);
    }
    if (project.status === ProjectStatus.INACTIVE) {
      throw new BadRequestException('El proyecto ya está dado de baja');
    }
    project.status = ProjectStatus.INACTIVE;
    const saved = await this.projectRepository.save(project);
    return ProjectsMapper.toResponse(saved);
  }

  private async validateActiveClient(clientId: number): Promise<void> {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Cliente con id ${clientId} no encontrado`);
    }

    if (client.estado !== ClientStatus.ACTIVO) {
      throw new BadRequestException(
        'Solo se puede asociar un cliente en estado activo',
      );
    }
  }

  private normalizeStatus(status?: string): ProjectStatus | undefined {
    const trimmedStatus = status?.trim();

    if (!trimmedStatus) {
      return undefined;
    }

    const normalizedStatus = trimmedStatus.toLowerCase() as ProjectStatus;

    if (!Object.values(ProjectStatus).includes(normalizedStatus)) {
      throw new BadRequestException('Estado de proyecto invalido');
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
        `El ${fieldName} debe ser un numero positivo`,
      );
    }

    return parsedValue;
  }
}
