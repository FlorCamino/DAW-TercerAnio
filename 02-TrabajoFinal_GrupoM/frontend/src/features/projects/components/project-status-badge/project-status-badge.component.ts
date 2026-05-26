import { Component, input } from '@angular/core';
import { ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'app-project-status-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="'badge-' + status()">
      {{ status() }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: capitalize;
    }
    .badge-activo { background: rgba(35,134,54,0.12); color: #1a7f37; }
    .badge-finalizado { background: rgba(26,115,232,0.12); color: #1558b0; }
    .badge-baja { background: rgba(209,36,47,0.10); color: #d1242f; }
  `]
})
export class ProjectStatusBadgeComponent {
  status = input.required<ProjectStatus>();
}