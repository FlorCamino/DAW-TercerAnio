import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ProjectFormComponent, ProjectFormValue } from '../../components/project-form/project-form.component';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent],
  templateUrl: './project-create.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectCreateComponent {
  constructor(
    private projectService: ProjectService,
    private router: Router,
  ) {}

  onSubmit(value: ProjectFormValue): void {
    this.projectService.create(value).subscribe(() => {
      this.router.navigate(['/projects']);
    });
  }
}