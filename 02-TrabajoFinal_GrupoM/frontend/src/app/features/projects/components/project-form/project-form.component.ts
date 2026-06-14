import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ClientsService } from '../../../clients/services/clients.service';

export interface ProjectFormValue {
  name: string;
  clientId: number | null;
  endDate: string | null;
}

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent implements OnInit {
  @Input() submitLabel = 'Guardar proyecto';

  @Input() initialValue: ProjectFormValue = {
    name: '',
    clientId: null,
    endDate: null,
  };

  @Output() formSubmit = new EventEmitter<ProjectFormValue>();

  form: ProjectFormValue = {
    name: '',
    clientId: null,
    endDate: null,
  };

  clientes: any[] = [];
  cargandoClientes = false;
  errorClientes = '';
  fechaMinima = this.obtenerFechaActualISO();

  constructor(private readonly clientsService: ClientsService) { }

  get formularioValido(): boolean {
    return Boolean(
      this.form.name.trim() &&
      this.form.clientId &&
      this.fechaFinalizacionValida,
    );
  }

  get fechaFinalizacionValida(): boolean {
    return !this.form.endDate || this.form.endDate >= this.fechaMinima;
  }

  ngOnInit(): void {
    this.form = {
      name: this.initialValue.name ?? '',
      clientId: this.initialValue.clientId ?? null,
      endDate: this.initialValue.endDate ?? null,
    };

    this.cargarClientes();
  }

  submit(): void {
    if (!this.formularioValido || this.cargandoClientes) {
      return;
    }

    this.formSubmit.emit({
      name: this.form.name.trim(),
      clientId: this.form.clientId ? Number(this.form.clientId) : null,
      endDate: this.form.endDate || null,
    });
  }

  estaDeBaja(cliente: any): boolean {
    return String(cliente?.estado ?? '').toLowerCase() === 'baja';
  }

  private cargarClientes(): void {
    this.cargandoClientes = true;
    this.errorClientes = '';

    this.clientsService.getClientesPaginados({
      estado: 'activo',
      page: 1,
      limit: 1000,
    }).subscribe({
      next: (response) => {
        this.clientes = (response.data ?? []).filter(
          (cliente) => String(cliente.estado ?? '').toLowerCase() === 'activo',
        );

        this.cargandoClientes = false;
      },
      error: () => {
        this.clientes = [];
        this.errorClientes = 'No se pudieron cargar los clientes activos.';
        this.cargandoClientes = false;
      },
    });
  }

  private obtenerFechaActualISO(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
