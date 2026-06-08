import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, filter, forkJoin, of } from 'rxjs';

import { ClientsService } from '../../../clients/services/clients.service';
import { Project } from '../../../projects/models/project.model';
import { ProjectService } from '../../../projects/services/project.service';
import { Task } from '../../../tasks/models/task.model';
import { TasksService } from '../../../tasks/services/tasks.service';
import { UsersService } from '../../../users/services/users.service';

interface DashboardKpi {
  label: string;
  value: number;
  detail: string;
  icon: string;
  type?: 'default' | 'pending';
}

interface TaskStatusBar {
  label: string;
  value: number;
  percentage: number;
}

interface ClientProjectStat {
  clientId: number | null;
  clientName: string;
  totalProjects: number;
  activeProjects: number;
  finishedProjects: number;
  percentage: number;
}

interface ProjectTaskStat {
  projectId: number | null;
  projectName: string;
  totalTasks: number;
  pendingTasks: number;
  finishedTasks: number;
  percentage: number;
}

interface UpcomingProject {
  projectId: number | null;
  projectName: string;
  endDate: Date;
  endDateLabel: string;
  daysRemaining: number;
  status: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  loadingDashboard = true;
  dashboardError = '';

  currentDateLabel = this.formatDate(new Date());

  totalClients = 0;
  totalProjects = 0;
  totalTasks = 0;
  totalUsers = 0;

  kpiCards: DashboardKpi[] = [];
  taskStatusBars: TaskStatusBar[] = [];
  clientProjectStats: ClientProjectStat[] = [];
  projectTaskStats: ProjectTaskStat[] = [];
  upcomingProjects: UpcomingProject[] = [];
  overdueProjects: UpcomingProject[] = [];

  constructor(
    private readonly clientsService: ClientsService,
    private readonly projectService: ProjectService,
    private readonly tasksService: TasksService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly usersService: UsersService,
  ) { }

  ngOnInit(): void {
    this.loadDashboard();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => this.isDashboardRoute(event.urlAfterRedirects)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.loadDashboard();
      });
  }

  private loadDashboard(): void {
    this.loadingDashboard = true;
    this.dashboardError = '';
    this.cdr.detectChanges();

    forkJoin({
      clientsResponse: this.clientsService.getClientesPaginados({
        page: 1,
        limit: 1000,
      }).pipe(
        catchError(() => {
          this.dashboardError = 'No se pudieron cargar algunos indicadores del dashboard.';
          return of(this.emptyPaginatedResponse<any>());
        }),
      ),

      projects: this.projectService.getAll({ limit: 1000 }).pipe(
        catchError(() => {
          this.dashboardError = 'No se pudieron cargar algunos indicadores del dashboard.';
          return of([] as Project[]);
        }),
      ),

      tasksResponse: this.tasksService.getTareasPaginadas({
        page: 1,
        limit: 1000,
      }).pipe(
        catchError(() => {
          this.dashboardError = 'No se pudieron cargar algunos indicadores del dashboard.';
          return of(this.emptyPaginatedResponse<Task>());
        }),
      ),
      
      usersResponse: this.usersService.getUsuariosPaginados({ page: 1, limit: 1000 }).pipe(
        catchError(() => of(this.emptyPaginatedResponse<any>()))
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ clientsResponse, projects, tasksResponse, usersResponse }) => {
          try {
            const clients = Array.isArray(clientsResponse.data)
              ? clientsResponse.data
              : [];

            const projectList = Array.isArray(projects)
              ? projects
              : [];

            const tasks = Array.isArray(tasksResponse.data)
              ? tasksResponse.data
              : [];

            this.totalClients = clientsResponse.total ?? clients.length;
            this.totalProjects = projectList.length;
            this.totalTasks = tasksResponse.total ?? tasks.length;
            this.totalUsers = usersResponse.total ?? 0;

            this.kpiCards = this.buildKpiCards();
            this.taskStatusBars = this.buildTaskStatusBars(tasks);
            this.clientProjectStats = this.buildClientProjectStats(clients, projectList);
            this.projectTaskStats = this.buildProjectTaskStats(projectList, tasks);
            this.upcomingProjects = this.buildUpcomingProjects(projectList);
            this.overdueProjects = this.buildOverdueProjects(projectList);
          } catch {
            this.dashboardError = 'Ocurrió un error al armar los datos del dashboard.';
            this.resetDashboardData();
          } finally {
            this.loadingDashboard = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.dashboardError = 'No se pudieron cargar los indicadores del dashboard.';
          this.loadingDashboard = false;
          this.cdr.detectChanges();
        },
      });
  }

  private buildKpiCards(): DashboardKpi[] {
    return [
      {
        label: 'Clientes',
        value: this.totalClients,
        detail: 'clientes registrados',
        icon: 'pi pi-address-book',
      },
      {
        label: 'Proyectos',
        value: this.totalProjects,
        detail: 'proyectos registrados',
        icon: 'pi pi-briefcase',
      },
      {
        label: 'Tareas',
        value: this.totalTasks,
        detail: 'tareas registradas',
        icon: 'pi pi-check-square',
      },
      {
        label: 'Usuarios',
        value: this.totalUsers,
        detail: 'usuarios registrados',
        icon: 'pi pi-users',
      },
    ];
  }

  private buildTaskStatusBars(tasks: Task[]): TaskStatusBar[] {
    const pending = tasks.filter((task) => this.isPendingStatus(task.estado)).length;
    const finished = tasks.filter((task) => this.isFinishedStatus(task.estado)).length;
    const deleted = tasks.filter((task) => this.isDeletedStatus(task.estado)).length;

    const maxValue = Math.max(pending, finished, deleted, 1);

    return [
      {
        label: 'Pendientes',
        value: pending,
        percentage: Math.round((pending / maxValue) * 100),
      },
      {
        label: 'Finalizadas',
        value: finished,
        percentage: Math.round((finished / maxValue) * 100),
      },
      {
        label: 'En baja',
        value: deleted,
        percentage: Math.round((deleted / maxValue) * 100),
      },
    ];
  }

  private buildUpcomingProjects(projects: Project[]): UpcomingProject[] {
    const today = this.startOfDay(new Date());

    return projects
      .map((project) => {
        const endDate = this.getProjectEndDate(project);

        if (!endDate) {
          return null;
        }

        const normalizedEndDate = this.startOfDay(endDate);
        const daysRemaining = this.getDaysBetween(today, normalizedEndDate);

        if (daysRemaining < 0) {
          return null;
        }

        return {
          projectId: this.getProjectId(project),
          projectName: this.getProjectName(project),
          endDate: normalizedEndDate,
          endDateLabel: this.formatDate(normalizedEndDate),
          daysRemaining,
          status: this.getProjectStatus(project),
        };
      })
      .filter((project): project is UpcomingProject => project !== null)
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
      .slice(0, 4);
  }

  private buildOverdueProjects(projects: Project[]): UpcomingProject[] {
    const today = this.startOfDay(new Date());

    return projects
      .map((project) => {
        const endDate = this.getProjectEndDate(project);
        const status = this.getProjectStatus(project);

        if (!endDate || this.isFinishedStatus(status) || this.isDeletedStatus(status)) {
          return null;
        }

        const normalizedEndDate = this.startOfDay(endDate);
        const daysRemaining = this.getDaysBetween(today, normalizedEndDate);

        if (daysRemaining >= 0) {
          return null;
        }

        return {
          projectId: this.getProjectId(project),
          projectName: this.getProjectName(project),
          endDate: normalizedEndDate,
          endDateLabel: this.formatDate(normalizedEndDate),
          daysRemaining: Math.abs(daysRemaining),
          status,
        };
      })
      .filter((project): project is UpcomingProject => project !== null)
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime())
      .slice(0, 6);
  }

  private buildClientProjectStats(
    clients: any[],
    projects: Project[],
  ): ClientProjectStat[] {
    const stats: ClientProjectStat[] = clients.map((client) => {
      const clientId = this.getClientId(client);
      const clientName = this.getClientName(client);

      const relatedProjects = projects.filter((project) =>
        this.projectBelongsToClient(project, clientId, clientName),
      );

      return {
        clientId,
        clientName,
        totalProjects: relatedProjects.length,
        activeProjects: relatedProjects.filter((project) =>
          this.isActiveStatus(this.getProjectStatus(project)),
        ).length,
        finishedProjects: relatedProjects.filter((project) =>
          this.isFinishedStatus(this.getProjectStatus(project)),
        ).length,
        percentage: 0,
      };
    });

    const projectsWithoutClient = projects.filter((project) => {
      const projectData = project as unknown as Record<string, any>;
      return !projectData['client'] && !projectData['clientId'];
    });

    if (projectsWithoutClient.length > 0) {
      stats.push({
        clientId: null,
        clientName: 'Sin cliente',
        totalProjects: projectsWithoutClient.length,
        activeProjects: projectsWithoutClient.filter((project) =>
          this.isActiveStatus(this.getProjectStatus(project)),
        ).length,
        finishedProjects: projectsWithoutClient.filter((project) =>
          this.isFinishedStatus(this.getProjectStatus(project)),
        ).length,
        percentage: 0,
      });
    }

    const sortedStats = stats.sort((a, b) => b.totalProjects - a.totalProjects);
    const maxProjects = Math.max(...sortedStats.map((item) => item.totalProjects), 1);

    return sortedStats.slice(0, 6).map((item) => ({
      ...item,
      percentage: Math.round((item.totalProjects / maxProjects) * 100),
    }));
  }

  private buildProjectTaskStats(
    projects: Project[],
    tasks: Task[],
  ): ProjectTaskStat[] {
    const stats: ProjectTaskStat[] = projects.map((project) => {
      const projectId = this.getProjectId(project);
      const projectName = this.getProjectName(project);

      const relatedTasks = tasks.filter((task) =>
        this.taskBelongsToProject(task, projectId, projectName),
      );

      return {
        projectId,
        projectName,
        totalTasks: relatedTasks.length,
        pendingTasks: relatedTasks.filter((task) =>
          this.isPendingStatus(task.estado),
        ).length,
        finishedTasks: relatedTasks.filter((task) =>
          this.isFinishedStatus(task.estado),
        ).length,
        percentage: 0,
      };
    });

    const sortedStats = stats.sort((a, b) => b.totalTasks - a.totalTasks);
    const maxTasks = Math.max(...sortedStats.map((item) => item.totalTasks), 1);

    return sortedStats.slice(0, 6).map((item) => ({
      ...item,
      percentage: Math.round((item.totalTasks / maxTasks) * 100),
    }));
  }

  private projectBelongsToClient(
    project: Project,
    clientId: number | null,
    clientName: string,
  ): boolean {
    const projectData = project as unknown as Record<string, any>;
    const projectClient = projectData['client'];

    const projectClientId =
      projectData['clientId'] ??
      projectClient?.id ??
      null;

    if (clientId !== null && projectClientId !== null) {
      return Number(projectClientId) === clientId;
    }

    const projectClientName =
      projectClient?.nombre ??
      projectClient?.name ??
      '';

    return this.normalizeText(projectClientName) === this.normalizeText(clientName);
  }

  private taskBelongsToProject(
    task: Task,
    projectId: number | null,
    projectName: string,
  ): boolean {
    const taskData = task as unknown as Record<string, any>;

    const taskProjectId =
      taskData['proyectoId'] ??
      taskData['projectId'] ??
      taskData['project']?.id ??
      taskData['proyecto']?.id ??
      null;

    if (projectId !== null && taskProjectId !== null) {
      return Number(taskProjectId) === projectId;
    }

    const taskProjectName =
      taskData['proyectoNombre'] ??
      taskData['project']?.name ??
      taskData['proyecto']?.name ??
      '';

    return this.normalizeText(taskProjectName) === this.normalizeText(projectName);
  }

  private getClientId(client: any): number | null {
    return client?.id ? Number(client.id) : null;
  }

  private getClientName(client: any): string {
    return client?.nombre ?? client?.name ?? 'Cliente sin nombre';
  }

  private getProjectId(project: Project): number | null {
    const projectData = project as unknown as Record<string, any>;
    return projectData['id'] ? Number(projectData['id']) : null;
  }

  private getProjectName(project: Project): string {
    const projectData = project as unknown as Record<string, any>;
    return projectData['name'] ?? projectData['nombre'] ?? 'Proyecto sin nombre';
  }

  private getProjectStatus(project: Project): string {
    const projectData = project as unknown as Record<string, any>;
    return projectData['status'] ?? projectData['estado'] ?? '';
  }

  private getProjectEndDate(project: Project): Date | null {
    const projectData = project as unknown as Record<string, any>;

    const rawDate =
      projectData['endDate'] ??
      projectData['fechaFinalizacion'] ??
      projectData['fechaFin'] ??
      null;

    if (!rawDate) {
      return null;
    }

    const date = new Date(rawDate);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  private isActiveStatus(status: string): boolean {
    const normalizedStatus = this.normalizeText(status);
    return normalizedStatus === 'activo' || normalizedStatus === 'active';
  }

  private isFinishedStatus(status: string): boolean {
    const normalizedStatus = this.normalizeText(status);
    return normalizedStatus === 'finalizado' || normalizedStatus === 'finished';
  }

  private isPendingStatus(status: string): boolean {
    const normalizedStatus = this.normalizeText(status);
    return normalizedStatus === 'pendiente' || normalizedStatus === 'pending';
  }

  private isDeletedStatus(status: string): boolean {
    const normalizedStatus = this.normalizeText(status);
    return normalizedStatus === 'baja' || normalizedStatus === 'deleted';
  }

  private normalizeText(value: string): string {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private getDaysBetween(start: Date, end: Date): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.ceil((end.getTime() - start.getTime()) / millisecondsPerDay);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  private emptyPaginatedResponse<T>(): PaginatedResponse<T> {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 1000,
      totalPages: 0,
    };
  }

  private resetDashboardData(): void {
    this.totalClients = 0;
    this.totalProjects = 0;
    this.totalTasks = 0;
    this.totalUsers = 0;

    this.kpiCards = this.buildKpiCards();
    this.taskStatusBars = [];
    this.clientProjectStats = [];
    this.projectTaskStats = [];
    this.upcomingProjects = [];
    this.overdueProjects = [];
  }

  private isDashboardRoute(url: string): boolean {
    const cleanUrl = url.split('?')[0].split('#')[0];

    return cleanUrl === '/' || cleanUrl === '/dashboard';
  }
}
