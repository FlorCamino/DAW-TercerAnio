import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectStatusBadgeComponent } from '../../components/project-status-badge/project-status-badge.component';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectStatusBadgeComponent],
  templateUrl: './project-list.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectListComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(private readonly projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.error.set('');

    this.projectService.getAll().subscribe({
      next: (data: Project[]) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.projects.set([]);
        this.error.set('No se pudieron cargar los proyectos.');
        this.loading.set(false);
      },
    });
  }
}
