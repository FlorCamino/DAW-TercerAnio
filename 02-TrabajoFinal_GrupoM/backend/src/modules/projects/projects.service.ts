import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dtos/input/create-project.dto';
import { UpdateProjectDto } from './dtos/input/update-project.dto';
import { ProjectsMapper } from './mappers/projects.mapper';
import { ProjectResponseDto } from './dtos/output/project-response.dto';
import { ProjectListResponseDto } from './dtos/output/project-list-response.dto';
import { ProjectStatus } from '../../common/enums/project-status.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectResponseDto> {
    const project = this.projectRepository.create({
      name: dto.name,
      status: dto.status ?? ProjectStatus.ACTIVE,
      clientId: dto.clientId ?? null,
    });
    const saved = await this.projectRepository.save(project);
    return ProjectsMapper.toResponse(saved);
  }

  async findAll(): Promise<ProjectListResponseDto> {
    const projects = await this.projectRepository.find({
      order: { id: 'DESC' },
    });
    return ProjectsMapper.toListResponse(projects);
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
    if (project.status === ProjectStatus.INACTIVE) {
      throw new BadRequestException('No se puede modificar un proyecto dado de baja');
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
}