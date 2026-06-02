import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, debounceTime, finalize, takeUntil } from 'rxjs';

import { Project } from '../../../projects/models/project.model';
import { ProjectService } from '../../../projects/services/project.service';
import { Task, TaskFormData, TaskStatus } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';

// Manejo de roles
import { AuthService } from '../../../../../core/services/auth.service';

type AlertType = 'info' | 'error' | 'confirm';
type TaskState = TaskStatus;

interface TaskAlert {
  title: string;
  message?: string;
  type: AlertType;
  confirmText?: string;
  cancelText?: string;
  confirmDanger?: boolean;
  onConfirm?: () => void;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit, OnDestroy {
  listaTareas: Task[] = [];
  proyectos: Project[] = [];

  filtros = {
    estado: '',
    descripcion: '',
  };

  tareaEditada: TaskFormData = this.crearTareaVacia();

  editando = false;
  mostrandoFormulario = false;
  estadoDropdownAbierto = false;
  alerta: TaskAlert | null = null;
  cambiandoEstadoId: number | null = null;

  totalTareas = 0;
  paginaActual = 1;
  cantidadPorPagina = 6;
  totalPaginas = 0;

  private readonly filtrosChange$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly tasksService: TasksService,
    private readonly projectService: ProjectService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthService,
  ) { }

  esAdmin(): boolean {
    return this.authService.esAdmin();
  }

  ngOnInit(): void {
    this.filtrosChange$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginaActual = 1;
        this.cargarTareas(this.hayFiltrosActivos());
      });

    this.cargarProyectos();
    this.cargarTodas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTodas(): void {
    this.cargarTareas(false);
  }

  buscarTareas(): void {
    this.paginaActual = 1;
    this.cargarTareas(true);
  }

  actualizarBusqueda(): void {
    this.filtrosChange$.next();
  }

  seleccionarEstado(estado: string): void {
    this.filtros.estado = estado;
    this.estadoDropdownAbierto = false;
    this.actualizarBusqueda();
  }

  obtenerTextoEstado(estado: string): string {
    if (estado === 'pendiente') {
      return 'Pendiente';
    }

    if (estado === 'finalizado') {
      return 'Finalizado';
    }

    if (estado === 'baja') {
      return 'Baja';
    }

    return 'Todos los estados';
  }

  editar(tarea: Task): void {
    if (this.estaDeBaja(tarea)) {
      this.mostrarAviso(
        'Tarea dada de baja',
        'No se puede editar una tarea en estado baja.',
      );
      return;
    }

    this.tareaEditada = {
      id: tarea.id,
      descripcion: tarea.descripcion,
      estado: tarea.estado,
      proyectoId: tarea.proyectoId,
    };

    this.editando = true;
    this.mostrandoFormulario = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      document.querySelector('.management-edit-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  guardar(): void {
    if (!this.tareaEditada.descripcion.trim()) {
      this.mostrarAviso(
        'Datos incompletos',
        'La descripción de la tarea es obligatoria.',
      );
      return;
    }

    if (!this.tareaEditada.proyectoId) {
      this.mostrarAviso(
        'Datos incompletos',
        'Debe seleccionar un proyecto para la tarea.',
      );
      return;
    }

    this.tasksService.guardarTarea(this.tareaEditada).subscribe({
      next: () => {
        this.limpiar();

        this.mostrarAviso(
          'Tarea actualizada',
          'Los datos de la tarea se guardaron correctamente.',
        );

        this.cargarTareas(this.hayFiltrosActivos());
      },
      error: (err: HttpErrorResponse) => {
        this.mostrarError(err, 'No se pudo actualizar la tarea.');
      },
    });
  }

  limpiar(): void {
    this.tareaEditada = this.crearTareaVacia();
    this.editando = false;
    this.mostrandoFormulario = false;
    this.cdr.detectChanges();
  }

  normalizarEstadoTarea(estado: string): TaskState {
    const estadoNormalizado = String(estado ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    if (estadoNormalizado === 'finalizado') {
      return 'finalizado';
    }

    if (estadoNormalizado === 'baja') {
      return 'baja';
    }

    return 'pendiente';
  }

  solicitarCambioEstado(tarea: Task, nuevoEstado: TaskState): void {
    const estadoActual = this.normalizarEstadoTarea(tarea.estado);

    if (estadoActual === nuevoEstado) {
      return;
    }

    this.pedirConfirmacion({
      title: this.obtenerTituloCambioEstado(nuevoEstado),
      message: `¿Está seguro que desea cambiar el estado de la tarea "${tarea.descripcion}" a "${this.obtenerTextoEstado(nuevoEstado)}"?`,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      confirmDanger: nuevoEstado === 'baja',
      onConfirm: () => {
        this.actualizarEstadoTarea(tarea, nuevoEstado);
      },
    });
  }

  cambiarCantidadPorPagina(): void {
    this.paginaActual = 1;
    this.cargarTareas(this.hayFiltrosActivos());
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarTareas(this.hayFiltrosActivos());
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarTareas(this.hayFiltrosActivos());
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      descripcion: '',
    };

    this.estadoDropdownAbierto = false;
    this.paginaActual = 1;
    this.cargarTodas();
  }

  hayFiltrosActivos(): boolean {
    return Object.values(this.filtros).some((value) => value.trim() !== '');
  }

  estaPendiente(tarea: Task): boolean {
    return this.normalizarEstadoTarea(tarea.estado) === 'pendiente';
  }

  estaFinalizada(tarea: Task): boolean {
    return this.normalizarEstadoTarea(tarea.estado) === 'finalizado';
  }

  estaDeBaja(tarea: Task): boolean {
    return this.normalizarEstadoTarea(tarea.estado) === 'baja';
  }

  obtenerProyecto(tarea: Task): string {
    if (tarea.proyectoNombre) {
      return tarea.proyectoNombre;
    }

    if (tarea.proyecto?.name) {
      return tarea.proyecto.name;
    }

    if (tarea.proyecto?.nombre) {
      return tarea.proyecto.nombre;
    }

    if (tarea.project?.name) {
      return tarea.project.name;
    }

    if (tarea.project?.nombre) {
      return tarea.project.nombre;
    }

    if (tarea.proyectoId) {
      return `Proyecto #${tarea.proyectoId}`;
    }

    return 'Sin proyecto';
  }

  cerrarAlerta(): void {
    this.alerta = null;
    this.cdr.detectChanges();
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

    this.alerta = null;
    this.cdr.detectChanges();

    onConfirm?.();
  }

  private actualizarEstadoTarea(tarea: Task, nuevoEstado: TaskState): void {
    this.cambiandoEstadoId = tarea.id;

    const request$: Observable<unknown> =
      nuevoEstado === 'baja'
        ? this.tasksService.eliminarTarea(tarea.id)
        : this.tasksService.cambiarEstado(tarea.id, nuevoEstado);

    request$
      .pipe(
        finalize(() => {
          this.cambiandoEstadoId = null;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.mostrarAviso(
            'Estado actualizado',
            `La tarea "${tarea.descripcion}" fue actualizada correctamente.`,
          );

          this.cargarTareas(this.hayFiltrosActivos());
        },
        error: (err: HttpErrorResponse) => {
          this.mostrarError(err, 'No se pudo actualizar el estado de la tarea.');
          this.cargarTareas(this.hayFiltrosActivos());
        },
      });
  }

  private obtenerTituloCambioEstado(estado: TaskState): string {
    if (estado === 'finalizado') {
      return 'Finalizar tarea';
    }

    if (estado === 'baja') {
      return 'Dar de baja tarea';
    }

    return 'Reabrir tarea';
  }

  private cargarTareas(conFiltros: boolean): void {
    const filtros = conFiltros ? this.filtros : {};

    this.tasksService
      .getTareasPaginadas({
        ...filtros,
        page: this.paginaActual,
        limit: this.cantidadPorPagina,
      })
      .subscribe({
        next: (response) => {
          this.listaTareas = [...response.data];
          this.totalTareas = response.total;
          this.paginaActual = response.page;
          this.cantidadPorPagina = response.limit;
          this.totalPaginas = response.totalPages;

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.listaTareas = [];
          this.totalTareas = 0;
          this.totalPaginas = 0;

          if (!conFiltros || err.status !== 400) {
            this.mostrarError(err, 'No se pudieron cargar las tareas.');
          }

          this.cdr.detectChanges();
        },
      });
  }

  private cargarProyectos(): void {
    this.projectService.getAll({ limit: 1000 }).subscribe({
      next: (projects: Project[]) => {
        this.proyectos = projects;
        this.cdr.detectChanges();
      },
      error: () => {
        this.proyectos = [];
        this.cdr.detectChanges();
      },
    });
  }

  private crearTareaVacia(): TaskFormData {
    return {
      id: null,
      descripcion: '',
      estado: 'pendiente',
      proyectoId: null,
    };
  }

  private mostrarError(error: unknown, mensajePorDefecto: string): void {
    this.alerta = {
      title: 'Ocurrió un error',
      message: this.obtenerMensajeError(error, mensajePorDefecto),
      type: 'error',
      confirmText: 'Entendido',
    };

    this.cdr.detectChanges();
  }

  private mostrarAviso(title: string, message: string): void {
    this.alerta = {
      title,
      message,
      type: 'info',
      confirmText: 'Entendido',
    };

    this.cdr.detectChanges();
  }

  private pedirConfirmacion(alerta: Omit<TaskAlert, 'type'>): void {
    this.alerta = {
      type: 'confirm',
      cancelText: 'Cancelar',
      confirmText: 'Aceptar',
      ...alerta,
    };

    this.cdr.detectChanges();
  }

  private obtenerMensajeError(error: unknown, mensajePorDefecto: string): string {
    if (error instanceof HttpErrorResponse) {
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
    }

    return mensajePorDefecto;
  }
}
