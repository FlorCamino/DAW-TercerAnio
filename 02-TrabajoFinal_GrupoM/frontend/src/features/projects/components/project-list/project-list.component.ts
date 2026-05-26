import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Project } from '../../models/project.model';
import { ProjectStatusBadgeComponent } from '../project-status-badge/project-status-badge.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectStatusBadgeComponent],
  templateUrl: './project-list.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectListComponent {
  projects = input.required<Project[]>();
}