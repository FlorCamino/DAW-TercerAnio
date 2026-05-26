import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProjectFormComponent, ProjectFormValue } from '../../components/project-form/project-form.component';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent],
  templateUrl: './project-edit.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectEditComponent implements OnInit {
  id = 0;
  project = signal<Project | null>(null);

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.projectService.getOne(this.id).subscribe(data => {
      this.project.set(data);
    });
  }

  onSubmit(value: ProjectFormValue): void {
    this.projectService.update(this.id, value).subscribe(() => {
      this.router.navigate(['/projects']);
    });
  }
}