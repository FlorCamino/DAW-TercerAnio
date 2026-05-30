import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectStatusBadgeComponent } from '../../components/project-status-badge/project-status-badge.component';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { TasksService } from '../../../tasks/services/tasks.service';
import { Task } from '../../../tasks/models/task.model';


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

  constructor(
    private readonly projectService: ProjectService,
    private readonly tasksService: TasksService,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.projectService.getOne(id).subscribe((data: Project) => {
      this.project.set(data);
    });

    this.tasksService.getTareas({ proyectoId: id }).subscribe(data => {
      this.tasks.set(data);
    });
  }
}
