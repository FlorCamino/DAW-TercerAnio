import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Client } from '../../../clients/models/client.model';
import { ClientsService } from '../../../clients/services/clients.service';
import { Project, ProjectStatus } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

import { AuthService } from '../../../../../core/services/auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProjectEditForm {
  id: number | null;
  name: string;
  status: ProjectStatus;
  clientId: number | null;
  endDate: string | null;
}

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal('');

  listaProyectos: Project[] = [];
  clientesActivos: Client[] = [];

  proyectoEditado: ProjectEditForm = this.crearProyectoVacio();
  editando = false;
  guardando = false;
  cambiandoEstadoId: number | null = null;
  mensajeEdicion = '';
  errorEdicion = '';

  filtros = {
    estado: '',
    busqueda: '',
    fechaDesde: '',
    fechaHasta: '',
};

  estadoDropdownAbierto = false;

  paginaActual = 1;
  cantidadPorPagina = 6;
  totalPaginas = 1;
  totalProyectos = 0;

  constructor(
    private readonly projectService: ProjectService,
    private readonly clientsService: ClientsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
  ) { }

  esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  ngOnInit(): void {
    this.loadActiveClients();
    this.loadProjects();
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.error.set('');

    this.projectService.getAll({ limit: 1000 }).subscribe({
      next: (data: Project[]) => {
        this.projects.set(data);
        this.aplicarFiltrosYPaginado();
        this.loading.set(false);
      },
      error: () => {
        this.projects.set([]);
        this.listaProyectos = [];
        this.totalProyectos = 0;
        this.totalPaginas = 1;
        this.error.set('No se pudieron cargar los proyectos.');
        this.loading.set(false);
      },
    });
  }

  seleccionarEstado(estado: string): void {
    this.filtros.estado = estado;
    this.estadoDropdownAbierto = false;
    this.paginaActual = 1;
    this.aplicarFiltrosYPaginado();
  }

  actualizarBusqueda(): void {
    this.paginaActual = 1;
    this.aplicarFiltrosYPaginado();
  }

  buscarProyectos(): void {
    this.paginaActual = 1;
    this.aplicarFiltrosYPaginado();
  }

  descargarCSV(): void {
  const encabezados = ['Nombre', 'Estado', 'Cliente', 'Fecha Finalización'];

  const filas = this.listaProyectos.map(project => [
    project.name,
    project.status,
    project.client?.nombre ?? 'Sin cliente',
    project.endDate ?? ''
  ]);

  const csv = [
    encabezados.join(','),
    ...filas.map(fila => fila.join(','))
  ].join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'proyectos.csv';
  link.click();

  window.URL.revokeObjectURL(url);
}

descargarPDF(): void {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Listado de Proyectos', 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [['Nombre', 'Estado', 'Cliente', 'Fecha Finalización']],
    body: this.listaProyectos.map(project => [
      project.name,
      project.status,
      project.client?.nombre ?? 'Sin cliente',
      project.endDate ?? '-'
    ])
  });

  doc.save('proyectos.pdf');
}

  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      busqueda: '',
      fechaDesde: '',
      fechaHasta: '',
     };

    this.estadoDropdownAbierto = false;
    this.paginaActual = 1;
    this.aplicarFiltrosYPaginado();
  }

  hayFiltrosActivos(): boolean {
    return Boolean(this.filtros.estado || this.filtros.busqueda.trim());
  }

  cambiarCantidadPorPagina(): void {
    this.paginaActual = 1;
    this.aplicarFiltrosYPaginado();
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.aplicarFiltrosYPaginado();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.aplicarFiltrosYPaginado();
    }
  }

  obtenerTextoEstado(estado: string): string {
    const estadoNormalizado = this.normalizarTexto(estado);

    const estados: Record<string, string> = {
      '': 'Todos los estados',
      activo: 'Activo',
      active: 'Activo',
      pendiente: 'Pendiente',
      pending: 'Pendiente',
      finalizado: 'Finalizado',
      finished: 'Finalizado',
      completed: 'Finalizado',
      baja: 'Baja',
      inactive: 'Baja',
    };

    return estados[estadoNormalizado] ?? estado;
  }

  editar(project: Project): void {
    if (this.estaDeBaja(project)) {
      this.errorEdicion = 'No se puede editar un proyecto dado de baja.';
      this.mensajeEdicion = '';
      return;
    }

    this.proyectoEditado = {
      id: project.id,
      name: project.name,
      status: project.status,
      clientId: project.clientId,
      endDate: project.endDate,
    };
    this.editando = true;
    this.mensajeEdicion = '';
    this.errorEdicion = '';

    setTimeout(() => {
      document.querySelector('.management-edit-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  guardar(): void {
    const projectId = this.proyectoEditado.id;
    const projectName = this.proyectoEditado.name.trim();

    if (!projectId) {
      this.errorEdicion = 'Seleccione un proyecto para actualizar.';
      this.mensajeEdicion = '';
      return;
    }

    if (!projectName) {
      this.errorEdicion = 'El nombre del proyecto es obligatorio.';
      this.mensajeEdicion = '';
      return;
    }

    this.guardando = true;
    this.errorEdicion = '';
    this.mensajeEdicion = '';

    this.projectService
      .update(projectId, {
        name: projectName,
        clientId: this.proyectoEditado.clientId,
        endDate: this.proyectoEditado.endDate || null,
      })
      .subscribe({
        next: () => {
          this.mensajeEdicion = 'El proyecto fue actualizado correctamente.';
          this.guardando = false;
          this.limpiar();
          this.loadProjects();
        },
        error: (err: HttpErrorResponse) => {
          this.errorEdicion = this.obtenerMensajeError(err, 'No se pudo actualizar el proyecto.');
          this.guardando = false;
          this.cdr.detectChanges();
        },
      });
  }

  limpiar(): void {
    this.proyectoEditado = this.crearProyectoVacio();
    this.editando = false;
    this.guardando = false;
  }

  estaDeBaja(project: Project): boolean {
    return this.normalizarTexto(project.status) === 'baja';
  }

  normalizarEstadoProyecto(status: string): ProjectStatus {
    const estadoNormalizado = this.normalizarTexto(status);

    if (estadoNormalizado === 'finalizado') {
      return 'finalizado';
    }

    if (estadoNormalizado === 'baja') {
      return 'baja';
    }

    return 'activo';
  }

  cambiarEstado(project: Project, status: ProjectStatus): void {
    const estadoActual = this.normalizarEstadoProyecto(project.status);

    if (estadoActual === status) {
      return;
    }

    this.cambiandoEstadoId = project.id;
    this.mensajeEdicion = '';
    this.errorEdicion = '';

    this.projectService
      .update(project.id, { status })
      .subscribe({
        next: () => {
          this.mensajeEdicion = `El estado de "${project.name}" fue actualizado correctamente.`;
          this.cambiandoEstadoId = null;
          this.loadProjects();
        },
        error: (err: HttpErrorResponse) => {
          this.errorEdicion = this.obtenerMensajeError(err, 'No se pudo actualizar el estado del proyecto.');
          this.cambiandoEstadoId = null;
          this.cdr.detectChanges();
        },
      });
  }

  private aplicarFiltrosYPaginado(): void {
  const estadoFiltro = this.normalizarTexto(this.filtros.estado);
  const busquedaFiltro = this.normalizarTexto(this.filtros.busqueda);

  const proyectosFiltrados = this.projects().filter((project) => {
    const estadoProyecto = this.normalizarTexto(String(project.status ?? ''));

    const textoProyecto = this.normalizarTexto(`
      ${project.name ?? ''}
      ${project.client?.nombre ?? ''}
      ${project.endDate ?? ''}
      ${project.status ?? ''}
    `);

    const coincideEstado =
      !estadoFiltro || estadoProyecto === estadoFiltro;

    const coincideBusqueda =
      !busquedaFiltro || textoProyecto.includes(busquedaFiltro);

    let coincideFecha = true;

    if (project.endDate) {
      const fechaProyecto = new Date(project.endDate);

      if (this.filtros.fechaDesde) {
        coincideFecha =
          coincideFecha &&
          fechaProyecto >= new Date(this.filtros.fechaDesde);
      }

      if (this.filtros.fechaHasta) {
        coincideFecha =
          coincideFecha &&
          fechaProyecto <= new Date(this.filtros.fechaHasta);
      }
    }

    return (
      coincideEstado &&
      coincideBusqueda &&
      coincideFecha
    );
  });

  this.totalProyectos = proyectosFiltrados.length;
  this.totalPaginas = Math.max(
    Math.ceil(this.totalProyectos / this.cantidadPorPagina),
    1
  );

  if (this.paginaActual > this.totalPaginas) {
    this.paginaActual = this.totalPaginas;
  }

  const inicio = (this.paginaActual - 1) * this.cantidadPorPagina;
  const fin = inicio + this.cantidadPorPagina;

  this.listaProyectos = proyectosFiltrados.slice(inicio, fin);
}

  private loadActiveClients(): void {
    this.clientsService.getClientes({ limit: 1000 }).subscribe({
      next: (clients: Client[]) => {
        this.clientesActivos = clients.filter((client) => {
          return this.normalizarTexto(client.estado) === 'activo';
        });
        this.cdr.detectChanges();
      },
      error: () => {
        this.clientesActivos = [];
        this.cdr.detectChanges();
      },
    });
  }

  private crearProyectoVacio(): ProjectEditForm {
    return {
      id: null,
      name: '',
      status: 'activo',
      clientId: null,
      endDate: null,
    };
  }

  private obtenerMensajeError(error: HttpErrorResponse, mensajePorDefecto: string): string {
    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join('. ');
    }

    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return mensajePorDefecto;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
