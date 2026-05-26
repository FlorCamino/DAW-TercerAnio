import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { ProjectDetailComponent } from '../../components/project-detail/project-detail.component';

@Component({
  selector: 'app-project-detail-page',
  standalone: true,
  imports: [CommonModule, ProjectDetailComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectDetailPageComponent implements OnInit {
  project = signal<Project | null>(null);

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.projectService.getOne(id).subscribe(data => {
      this.project.set(data);
    });
  }
}