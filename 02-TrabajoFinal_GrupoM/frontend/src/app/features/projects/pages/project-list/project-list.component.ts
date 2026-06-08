import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { Client } from '../../../clients/models/client.model';
import { ClientsService } from '../../../clients/services/clients.service';
import { Project, ProjectStatus } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

interface ProjectEditForm {
  id: number | null;
  name: string;
  status: ProjectStatus;
  clientId: number | null;
  endDate: string | null;
}

type AlertType = 'info' | 'error' | 'confirm';

interface ProjectAlert {
  title: string;
  message: string;
  type: AlertType;
  confirmText: string;
  cancelText?: string;
  confirmDanger?: boolean;
  onConfirm?: () => void;
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
  proyectoOriginal: ProjectEditForm = this.crearProyectoVacio();
  editando = false;
  guardando = false;
  cambiandoEstadoId: number | null = null;
  alerta: ProjectAlert | null = null;

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
    return Boolean(
      this.filtros.estado ||
      this.filtros.busqueda.trim() ||
      this.filtros.fechaDesde ||
      this.filtros.fechaHasta,
    );
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

  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) {
      return '-';
    }

    const [year, month, day] = String(fecha).split('T')[0].split('-');

    if (!year || !month || !day) {
      return String(fecha);
    }

    return `${day}/${month}/${year}`;
  }

  editar(project: Project): void {
    if (!this.esAdmin()) {
      return;
    }

    if (this.estaDeBaja(project)) {
      this.mostrarError('No se puede editar', 'No se puede editar un proyecto dado de baja.');
      return;
    }

    this.proyectoEditado = {
      id: project.id,
      name: project.name,
      status: project.status,
      clientId: project.clientId,
      endDate: project.endDate,
    };
    this.proyectoOriginal = { ...this.proyectoEditado };
    this.editando = true;
    this.cerrarAlerta();

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
      this.mostrarError('Proyecto no seleccionado', 'Seleccione un proyecto para actualizar.');
      return;
    }

    if (!projectName) {
      this.mostrarError('Nombre obligatorio', 'El nombre del proyecto es obligatorio.');
      return;
    }

    if (!this.hayCambiosEdicion) {
      return;
    }

    this.guardando = true;
    this.cerrarAlerta();

    this.projectService
      .update(projectId, {
        name: projectName,
        clientId: this.proyectoEditado.clientId,
        endDate: this.proyectoEditado.endDate || null,
      })
      .subscribe({
        next: () => {
          this.mostrarInfo('Proyecto actualizado', 'El proyecto fue actualizado correctamente.');
          this.guardando = false;
          this.limpiar();
          this.loadProjects();
        },
        error: (err: HttpErrorResponse) => {
          this.mostrarError(
            'No se pudo actualizar',
            this.obtenerMensajeError(err, 'No se pudo actualizar el proyecto.'),
          );
          this.guardando = false;
          this.cdr.detectChanges();
        },
      });
  }

  limpiar(): void {
    this.proyectoEditado = this.crearProyectoVacio();
    this.proyectoOriginal = this.crearProyectoVacio();
    this.editando = false;
    this.guardando = false;
  }

  get formularioEdicionValido(): boolean {
    return Boolean(this.proyectoEditado.name.trim());
  }

  get hayCambiosEdicion(): boolean {
    return (
      this.normalizarValor(this.proyectoEditado.name) !== this.normalizarValor(this.proyectoOriginal.name) ||
      this.proyectoEditado.clientId !== this.proyectoOriginal.clientId ||
      this.normalizarValor(this.proyectoEditado.endDate) !== this.normalizarValor(this.proyectoOriginal.endDate)
    );
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

  cambiarEstado(project: Project, status: ProjectStatus, statusSelect?: HTMLSelectElement): void {
    if (!this.esAdmin()) {
      this.restaurarSelectEstado(project, statusSelect);
      return;
    }

    const estadoActual = this.normalizarEstadoProyecto(project.status);

    if (estadoActual === status) {
      return;
    }

    this.restaurarSelectEstado(project, statusSelect);

    if (status === 'finalizado') {
      this.validarFinalizacionProyecto(project);
      return;
    }

    this.alerta = {
      title: 'Confirmar cambio de estado',
      message: this.obtenerMensajeConfirmacionEstado(project, status),
      type: 'confirm',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmDanger: status === 'baja',
      onConfirm: () => this.actualizarEstadoProyecto(project, status),
    };
  }

  private restaurarSelectEstado(project: Project, statusSelect?: HTMLSelectElement): void {
    if (!statusSelect) {
      return;
    }

    statusSelect.value = this.normalizarEstadoProyecto(project.status);
  }

  confirmarAlerta(): void {
    if (!this.alerta) {
      return;
    }

    if (this.alerta.type !== 'confirm') {
      this.cerrarAlerta();
      return;
    }

    const onConfirm = this.alerta.onConfirm;
    this.cerrarAlerta();
    onConfirm?.();
  }

  private actualizarEstadoProyecto(project: Project, status: ProjectStatus): void {
    this.cambiandoEstadoId = project.id;

    this.projectService.update(project.id, { status }).subscribe({
      next: () => {
        this.mostrarInfo(
          'Estado actualizado',
          `El estado de "${project.name}" fue actualizado correctamente.`,
        );
        this.cambiandoEstadoId = null;
        this.loadProjects();
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarError(
          'No se pudo actualizar el estado',
          this.obtenerMensajeError(err, 'No se pudo actualizar el estado del proyecto.'),
        );
        this.cambiandoEstadoId = null;
        this.cdr.detectChanges();
      },
    });
  }

  private validarFinalizacionProyecto(project: Project): void {
    this.cambiandoEstadoId = project.id;

    this.projectService.getOne(project.id).subscribe({
      next: (projectDetail) => {
        const unresolvedTasks = (projectDetail.tasks ?? []).filter(
          (task) => task.status !== 'finalizado',
        );

        this.cambiandoEstadoId = null;

        if (unresolvedTasks.length > 0) {
          const taskNames = unresolvedTasks
            .map((task) => `"${task.description}" (${this.obtenerTextoEstadoTarea(task.status)})`)
            .join(', ');

          this.mostrarError(
            'No se puede finalizar',
            `Para finalizar "${project.name}" primero deben estar finalizadas todas sus tareas. Tareas pendientes: ${taskNames}.`,
          );
          this.cdr.detectChanges();
          return;
        }

        this.alerta = {
          title: 'Confirmar cambio de estado',
          message: this.obtenerMensajeConfirmacionEstado(project, 'finalizado'),
          type: 'confirm',
          confirmText: 'Confirmar',
          cancelText: 'Cancelar',
          confirmDanger: false,
          onConfirm: () => this.actualizarEstadoProyecto(project, 'finalizado'),
        };
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.cambiandoEstadoId = null;
        this.mostrarError(
          'No se pudo validar el proyecto',
          this.obtenerMensajeError(err, 'No se pudieron verificar las tareas asociadas al proyecto.'),
        );
        this.cdr.detectChanges();
      },
    });
  }

  private obtenerMensajeConfirmacionEstado(project: Project, status: ProjectStatus): string {
    if (status === 'baja') {
      return `Esta seguro que desea dar de baja "${project.name}"? Las tareas asociadas tambien pasaran a baja.`;
    }

    return `Esta seguro que desea cambiar el estado de "${project.name}" a "${this.obtenerTextoEstado(status)}"?`;
  }

  private obtenerTextoEstadoTarea(status: string): string {
    if (status === 'finalizado') {
      return 'finalizada';
    }

    if (status === 'baja') {
      return 'baja';
    }

    return 'pendiente';
  }

  cerrarAlerta(): void {
    this.alerta = null;
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
        this.error.set('');
        this.mostrarError('Error al cargar proyectos', 'No se pudieron cargar los proyectos.');
        this.loading.set(false);
      },
    });
  }

  private aplicarFiltrosYPaginado(): void {
    const estadoFiltro = this.normalizarTexto(this.filtros.estado);
    const busquedaFiltro = this.normalizarTexto(this.filtros.busqueda);
    const fechaDesde = this.parseDateFilter(this.filtros.fechaDesde);
    const fechaHasta = this.parseDateFilter(this.filtros.fechaHasta);

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      this.listaProyectos = [];
      this.totalProyectos = 0;
      this.totalPaginas = 1;
      this.mostrarError('Rango de fechas invalido', 'La fecha desde no puede ser posterior a la fecha hasta.');
      return;
    }

    if (this.alerta?.title === 'Rango de fechas invalido') {
      this.cerrarAlerta();
    }

    const proyectosFiltrados = this.projects().filter((project) => {
      const estadoProyecto = this.normalizarTexto(String(project.status ?? ''));
      const fechaProyecto = this.parseDateFilter(project.endDate);
      const textoProyecto = this.normalizarTexto(`
        ${project.name ?? ''}
        ${project.client?.nombre ?? ''}
        ${project.endDate ?? ''}
        ${project.status ?? ''}
      `);

      const coincideEstado = !estadoFiltro || estadoProyecto === estadoFiltro;
      const coincideBusqueda = !busquedaFiltro || textoProyecto.includes(busquedaFiltro);
      const coincideFechaDesde = !fechaDesde || (fechaProyecto !== null && fechaProyecto >= fechaDesde);
      const coincideFechaHasta = !fechaHasta || (fechaProyecto !== null && fechaProyecto <= fechaHasta);

      return coincideEstado && coincideBusqueda && coincideFechaDesde && coincideFechaHasta;
    });

    this.totalProyectos = proyectosFiltrados.length;
    this.totalPaginas = Math.max(Math.ceil(this.totalProyectos / this.cantidadPorPagina), 1);

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

  private mostrarInfo(title: string, message: string): void {
    this.alerta = {
      title,
      message,
      type: 'info',
      confirmText: 'Salir',
    };
  }

  private mostrarError(title: string, message: string): void {
    this.alerta = {
      title,
      message,
      type: 'error',
      confirmText: 'Salir',
    };
  }

  private normalizarValor(value: string | null | undefined): string {
    return String(value ?? '').trim();
  }

  private parseDateFilter(value: string | null | undefined): number | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(`${value}T00:00:00`);
    const timestamp = parsedDate.getTime();

    return Number.isNaN(timestamp) ? null : timestamp;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
