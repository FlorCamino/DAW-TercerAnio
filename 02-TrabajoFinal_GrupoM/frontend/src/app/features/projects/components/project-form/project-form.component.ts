import { CommonModule } from '@angular/common';
import { Component, OnInit, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../../../clients/services/clients.service';
import { Client, Project, ProjectStatus } from '../../models/project.model';

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

  constructor(private readonly clientsService: ClientsService) { }

  ngOnInit(): void {
    this.loadActiveClients();
    this.loadInitialData();
  }

  onSubmit(): void {
    const projectName = this.name().trim();

    if (!projectName) {
      return;
    }

    this.formSubmit.emit({
      name: projectName,
      status: this.status(),
      clientId: this.clientId() ? Number(this.clientId()) : null,
      endDate: this.endDate() || null,
    });
  }

  private loadActiveClients(): void {
    this.clientsService.getClientes().subscribe((data: Client[]) => {
      const activeClients = data.filter((client: Client) => {
        return client.estado?.toLowerCase() === 'activo';
      });

      this.clients.set(activeClients);
    });
  }

  private loadInitialData(): void {
    const data = this.initialData();

    if (!data) {
      return;
    }

    this.name.set(data.name);
    this.status.set(data.status);
    this.clientId.set(data.clientId);
    this.endDate.set(data.endDate);
  }
}