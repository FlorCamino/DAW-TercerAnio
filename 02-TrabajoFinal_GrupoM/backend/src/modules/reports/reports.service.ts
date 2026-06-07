import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { Client } from '../clients/entities/client.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getSummary() {
    const [
      projects,
      clients,
      tasks,
      users,
      activeProjectItems,
      finishedProjectItems,
      pendingTaskItems,
      finishedTaskItems,
    ] = await Promise.all([
      this.projectsRepository.find({ relations: ['client'], order: { name: 'ASC' } }),
      this.clientsRepository.find({ order: { name: 'ASC' } }),
      this.tasksRepository.find({ relations: ['project'], order: { description: 'ASC' } }),
      this.usersRepository.find({ order: { name: 'ASC' } }),
      this.projectsRepository.find({
        where: { status: ProjectStatus.ACTIVO },
        relations: ['client'],
        order: { name: 'ASC' },
      }),
      this.projectsRepository.find({
        where: { status: ProjectStatus.FINALIZADO },
        relations: ['client'],
        order: { name: 'ASC' },
      }),
      this.tasksRepository.find({
        where: { status: TaskStatus.PENDIENTE },
        relations: ['project'],
        order: { description: 'ASC' },
      }),
      this.tasksRepository.find({
        where: { status: TaskStatus.FINALIZADO },
        relations: ['project'],
        order: { description: 'ASC' },
      }),
    ]);

    return {
      totalProjects: projects.length,
      totalClients: clients.length,
      totalTasks: tasks.length,
      totalUsers: users.length,
      activeProjects: activeProjectItems.length,
      finishedProjects: finishedProjectItems.length,
      pendingTasks: pendingTaskItems.length,
      finishedTasks: finishedTaskItems.length,
      details: {
        totalProjects: projects.map((project) => this.toProjectDetail(project)),
        totalClients: clients.map((client) => this.toClientDetail(client)),
        totalTasks: tasks.map((task) => this.toTaskDetail(task)),
        totalUsers: users.map((user) => this.toUserDetail(user)),
        activeProjects: activeProjectItems.map((project) => this.toProjectDetail(project)),
        finishedProjects: finishedProjectItems.map((project) => this.toProjectDetail(project)),
        pendingTasks: pendingTaskItems.map((task) => this.toTaskDetail(task)),
        finishedTasks: finishedTaskItems.map((task) => this.toTaskDetail(task)),
      },
    };
  }

  async getProjectsByStatus() {
    const [activeItems, finishedItems, inactiveItems] = await Promise.all([
      this.projectsRepository.find({
        where: { status: ProjectStatus.ACTIVO },
        relations: ['client'],
        order: { name: 'ASC' },
      }),
      this.projectsRepository.find({
        where: { status: ProjectStatus.FINALIZADO },
        relations: ['client'],
        order: { name: 'ASC' },
      }),
      this.projectsRepository.find({
        where: { status: ProjectStatus.BAJA },
        relations: ['client'],
        order: { name: 'ASC' },
      }),
    ]);

    return {
      active: activeItems.length,
      finished: finishedItems.length,
      inactive: inactiveItems.length,
      details: {
        active: activeItems.map((project) => this.toProjectDetail(project)),
        finished: finishedItems.map((project) => this.toProjectDetail(project)),
        inactive: inactiveItems.map((project) => this.toProjectDetail(project)),
      },
    };
  }

  async getTasksByStatus(projectId?: string) {
    const parsedProjectId = Number(projectId);
    const projectFilter = Number.isInteger(parsedProjectId) && parsedProjectId > 0
      ? { projectId: parsedProjectId }
      : {};

    const [pendingItems, finishedItems, inactiveItems] = await Promise.all([
      this.tasksRepository.find({
        where: { ...projectFilter, status: TaskStatus.PENDIENTE },
        relations: ['project'],
        order: { description: 'ASC' },
      }),
      this.tasksRepository.find({
        where: { ...projectFilter, status: TaskStatus.FINALIZADO },
        relations: ['project'],
        order: { description: 'ASC' },
      }),
      this.tasksRepository.find({
        where: { ...projectFilter, status: TaskStatus.BAJA },
        relations: ['project'],
        order: { description: 'ASC' },
      }),
    ]);

    return {
      pending: pendingItems.length,
      finished: finishedItems.length,
      inactive: inactiveItems.length,
      details: {
        pending: pendingItems.map((task) => this.toTaskDetail(task)),
        finished: finishedItems.map((task) => this.toTaskDetail(task)),
        inactive: inactiveItems.map((task) => this.toTaskDetail(task)),
      },
    };
  }

  async getProjectDeadlines() {
    const today = this.startOfDay(new Date());
    const projects = await this.projectsRepository.find({
      relations: ['client'],
    });

    return projects
      .filter((project) => project.endDate)
      .map((project) => {
        const endDate = this.startOfDay(new Date(`${project.endDate}T00:00:00`));
        const differenceInDays = Math.ceil(
          (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        const isOverdue =
          differenceInDays < 0 && project.status !== ProjectStatus.FINALIZADO;
        const isNearDeadline = differenceInDays >= 0 && differenceInDays <= 15;

        return {
          id: project.id,
          name: project.name,
          client: project.client?.name ?? null,
          endDate: project.endDate,
          status: project.status,
          situation: isOverdue ? 'vencido' : 'proximo_a_vencer',
          daysToDeadline: differenceInDays,
          isOverdue,
          isNearDeadline,
        };
      })
      .filter((project) => project.isOverdue || project.isNearDeadline);
  }

  async getClientsProjectsReport() {
    const clients = await this.clientsRepository.find({
      relations: ['projects'],
    });

    return clients.map((client) => {
      const projects = client.projects ?? [];

      return {
        id: client.id,
        name: client.name,
        totalProjects: projects.length,
        activeProjects: projects.filter(
          (project) => project.status === ProjectStatus.ACTIVO,
        ).length,
        finishedProjects: projects.filter(
          (project) => project.status === ProjectStatus.FINALIZADO,
        ).length,
        projects: projects.map((project) => this.toProjectDetail(project)),
        activeProjectItems: projects
          .filter((project) => project.status === ProjectStatus.ACTIVO)
          .map((project) => this.toProjectDetail(project)),
        finishedProjectItems: projects
          .filter((project) => project.status === ProjectStatus.FINALIZADO)
          .map((project) => this.toProjectDetail(project)),
      };
    });
  }

  private startOfDay(date: Date): Date {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private toProjectDetail(project: Project) {
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      client: project.client?.name ?? null,
      endDate: project.endDate,
    };
  }

  private toClientDetail(client: Client) {
    return {
      id: client.id,
      name: client.name,
      status: client.status,
      email: client.email,
      phone: client.phone,
    };
  }

  private toTaskDetail(task: Task) {
    return {
      id: task.id,
      description: task.description,
      status: task.status,
      project: task.project?.name ?? null,
      projectId: task.projectId,
    };
  }

  private toUserDetail(user: User) {
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }
}
