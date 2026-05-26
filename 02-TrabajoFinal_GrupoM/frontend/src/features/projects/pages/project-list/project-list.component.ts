import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProjectListComponent } from '../../components/project-list/project-list.component';

@Component({
  selector: 'app-project-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectListComponent],
  templateUrl: './project-list.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectListPageComponent implements OnInit {
  projects = signal<Project[]>([]);

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.projectService.getAll().subscribe(data => {
      this.projects.set(data);
    });
  }
}