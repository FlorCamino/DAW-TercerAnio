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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 24px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 850;
      text-transform: capitalize;
      line-height: 1;
    }
    .badge-activo { color: #177d63; background: #e4eeea; }
    .badge-finalizado { color: #4f6f21; background: #edf4df; }
    .badge-baja { color: #8f3d3d; background: #f3e4e4; }
  `]
})
export class ProjectStatusBadgeComponent {
  status = input.required<ProjectStatus>();
}
