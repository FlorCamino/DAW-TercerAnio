import { Component, OnInit, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client, Project, ProjectStatus } from '../../models/project.model';
import { ClientsService } from '../../../../app/features/clients/services/clients.service';

export interface ProjectFormValue {
  name: string;
  status: ProjectStatus;
  clientId: number | null;
  endDate: string | null;
}

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-form.component.html',
  styleUrl: '../../projects.styles.css',
})
export class ProjectFormComponent implements OnInit {
  initialData = input<Project | null>(null);
  submitLabel = input<string>('Guardar');

  formSubmit = output<ProjectFormValue>();

  name = signal('');
  status = signal<ProjectStatus>('activo');
  clientId = signal<number | null>(null);
  endDate = signal<string | null>(null);
  clients = signal<Client[]>([]);

  statuses: ProjectStatus[] = ['activo', 'finalizado', 'baja'];

  constructor(private clientsService: ClientsService) {}

  ngOnInit(): void {
    this.clientsService.getClientes().subscribe(data => {
      // Filtramos solo clientes activos
      const activos = data.filter(c => c.estado === 'ACTIVO' || c.estado === 'activo');
      this.clients.set(activos);
    });

    const data = this.initialData();
    if (data) {
      this.name.set(data.name);
      this.status.set(data.status);
      this.clientId.set(data.clientId);
      this.endDate.set(data.endDate);
    }
  }

  onSubmit(): void {
    if (!this.name().trim()) return;

    this.formSubmit.emit({
      name: this.name(),
      status: this.status(),
      clientId: this.clientId() ? Number(this.clientId()) : null,
      endDate: this.endDate() || null,
    });
  }
}