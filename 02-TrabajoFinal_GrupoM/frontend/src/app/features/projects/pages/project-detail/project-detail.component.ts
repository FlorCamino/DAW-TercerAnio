import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProjectStatusBadgeComponent } from '../../components/project-status-badge/project-status-badge.component';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

import { Task } from '../../../tasks/models/task.model';
import { TasksService } from '../../../tasks/services/tasks.service';

type TaskState = 'pendiente' | 'finalizado' | 'baja';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectStatusBadgeComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectDetailComponent implements OnInit {
  project = signal<Project | null>(null);
  tasks = signal<Task[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(
    private readonly projectService: ProjectService,
    private readonly tasksService: TasksService,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('No se encontró el proyecto solicitado.');
      this.loading.set(false);
      return;
    }

    this.loadProject(id);
    this.loadProjectTasks(id);
  }

  get tareasAsociadas(): Task[] {
    return this.tasks();
  }

  private loadProject(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.projectService.getOne(id).subscribe({
      next: (data: Project) => {
        this.project.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.project.set(null);
        this.error.set('No se pudo cargar la información del proyecto.');
        this.loading.set(false);
      },
    });
  }

  private loadProjectTasks(projectId: number): void {
    this.tasksService.getTareas({ proyectoId: projectId }).subscribe({
      next: (data: Task[]) => {
        const relatedTasks = data.filter((task) =>
          this.taskBelongsToProject(task, projectId),
        );

        this.tasks.set(relatedTasks);
      },
      error: () => {
        this.tasks.set([]);
      },
    });
  }

  normalizarEstadoTarea(estado: string | undefined | null): TaskState {
    const estadoNormalizado = String(estado ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (estadoNormalizado === 'finalizado') {
      return 'finalizado';
    }

    if (estadoNormalizado === 'baja') {
      return 'baja';
    }

    return 'pendiente';
  }

  obtenerTextoEstadoTarea(estado: string | undefined | null): string {
    const estadoNormalizado = this.normalizarEstadoTarea(estado);

    if (estadoNormalizado === 'finalizado') {
      return 'Finalizado';
    }

    if (estadoNormalizado === 'baja') {
      return 'Baja';
    }

    return 'Pendiente';
  }

  private taskBelongsToProject(task: Task, projectId: number): boolean {
    const taskData = task as Task & {
      projectId?: number;
      project?: {
        id?: number;
      };
      proyecto?: {
        id?: number;
      };
    };

    const taskProjectId =
      task.proyectoId ??
      taskData.projectId ??
      taskData.project?.id ??
      taskData.proyecto?.id ??
      null;

    return Number(taskProjectId) === projectId;
  }
}