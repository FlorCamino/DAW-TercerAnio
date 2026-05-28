import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsService } from '../../services/projects.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.css',
})
export class ProjectsListComponent implements OnInit {

  projects: any[] = [];

  constructor(private projectsService: ProjectsService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {

    this.projectsService.getProjects().subscribe({

      next: (data: any[]) => {

        console.log('PROYECTOS:', data);

        this.projects = data;

      },

      error: (err: any) => {

        console.error('ERROR:', err);

      }

    });

  }

  deleteProject(id: number): void {

    this.projectsService.deleteProject(id).subscribe({

      next: () => {

        this.projects = this.projects.filter(
          project => project.id !== id
        );

      },

      error: (err: any) => {

        console.error(err);

      }

    });

  }

}