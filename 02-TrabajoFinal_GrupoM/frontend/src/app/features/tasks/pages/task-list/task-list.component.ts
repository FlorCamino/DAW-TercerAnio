import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Task, TaskFormData, TaskStatus } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';

type AlertType = 'info' | 'error' | 'confirm';

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
  styleUrl: './task-list.component.css',
})
export class TaskListComponent implements OnInit, OnDestroy {
  listaTareas: Task[] = [];

  filtros = {
    estado: '',
    busqueda: '',
  };

  tareaEditada: TaskFormData = this.crearTareaVacia();

  editando = false;
  mostrandoFormulario = false;
  estadoDropdownAbierto = false;
  alerta: TaskAlert | null = null;

  totalTareas = 0;
  paginaActual = 1;
  cantidadPorPagina = 6;
  totalPaginas = 0;

  private readonly filtrosChange$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly tasksService: TasksService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.filtrosChange$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.paginaActual = 1;
        this.cargarTareas(this.hayFiltrosActivos());
      });

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

  nuevaTarea(): void {
    this.tareaEditada = this.crearTareaVacia();
    this.editando = false;
    this.mostrandoFormulario = true;

    setTimeout(() => {
      document.querySelector('.task-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
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

    setTimeout(() => {
      document.querySelector('.task-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  guardar(): void {
    const descripcion = this.tareaEditada.descripcion.trim();

    if (!descripcion) {
      this.mostrarAviso('Datos incompletos', 'Debe ingresar una descripción para la tarea.');
      return;
    }

    if (!this.tareaEditada.proyectoId) {
      this.mostrarAviso('Datos incompletos', 'Debe ingresar el ID del proyecto asociado.');
      return;
    }

    this.tasksService
      .guardarTarea({
        ...this.tareaEditada,
        descripcion,
        proyectoId: Number(this.tareaEditada.proyectoId),
      })
      .subscribe({
        next: () => {
          this.limpiarFormulario();
          this.limpiarFiltros();
        },
        error: (err: HttpErrorResponse) => {
          this.mostrarError(
            err,
            this.editando ? 'No se pudo actualizar la tarea.' : 'No se pudo crear la tarea.',
          );
        },
      });
  }

  eliminar(tarea: Task): void {
    this.pedirConfirmacion({
      title: 'Dar de baja tarea',
      message: `¿Está seguro que desea dar de baja la tarea "${tarea.descripcion}"?`,
      confirmText: 'Dar de baja',
      confirmDanger: true,
      onConfirm: () => {
        this.tasksService.eliminarTarea(tarea.id).subscribe({
          next: () => this.limpiarFiltros(),
          error: (err: HttpErrorResponse) => {
            this.mostrarError(err, 'No se pudo dar de baja la tarea.');
          },
        });
      },
    });
  }

  finalizar(tarea: Task): void {
    this.tasksService.cambiarEstado(tarea.id, 'finalizado').subscribe({
      next: () => this.cargarTareas(this.hayFiltrosActivos()),
      error: (err: HttpErrorResponse) => {
        this.mostrarError(err, 'No se pudo finalizar la tarea.');
      },
    });
  }

  reactivar(tarea: Task): void {
    this.tasksService.cambiarEstado(tarea.id, 'pendiente').subscribe({
      next: () => this.cargarTareas(this.hayFiltrosActivos()),
      error: (err: HttpErrorResponse) => {
        this.mostrarError(err, 'No se pudo reactivar la tarea.');
      },
    });
  }

  limpiarFormulario(): void {
    this.tareaEditada = this.crearTareaVacia();
    this.editando = false;
    this.mostrandoFormulario = false;
  }

  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      busqueda: '',
    };

    this.estadoDropdownAbierto = false;
    this.paginaActual = 1;
    this.cargarTodas();
  }

  hayFiltrosActivos(): boolean {
    return Object.values(this.filtros).some((value) => value.trim() !== '');
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

  estaPendiente(tarea: Task): boolean {
    return tarea.estado?.toLowerCase() === 'pendiente';
  }

  estaFinalizada(tarea: Task): boolean {
    return tarea.estado?.toLowerCase() === 'finalizado';
  }

  estaDeBaja(tarea: Task): boolean {
    return tarea.estado?.toLowerCase() === 'baja';
  }

  obtenerProyecto(tarea: Task): string {
    if (tarea.proyectoNombre) {
      return tarea.proyectoNombre;
    }

    if (tarea.proyectoId) {
      return `Proyecto #${tarea.proyectoId}`;
    }

    return 'Sin proyecto';
  }

  cerrarAlerta(): void {
    this.alerta = null;
  }

  confirmarAlerta(): void {
    const onConfirm = this.alerta?.onConfirm;
    this.cerrarAlerta();
    onConfirm?.();
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

  private mostrarError(error: HttpErrorResponse, titulo: string): void {
    const detalle = this.obtenerMensajeError(error);

    this.alerta = {
      title: titulo,
      message: detalle,
      type: 'error',
      confirmText: 'Entendido',
    };
  }

  private mostrarAviso(title: string, message: string): void {
    this.alerta = {
      title,
      message,
      type: 'info',
      confirmText: 'Entendido',
    };
  }

  private pedirConfirmacion(alerta: Omit<TaskAlert, 'type'>): void {
    this.alerta = {
      type: 'confirm',
      cancelText: 'Cancelar',
      confirmText: 'Aceptar',
      ...alerta,
    };
  }

  private obtenerMensajeError(error: HttpErrorResponse): string {
    const message = error.error?.message ?? error.message;

    if (Array.isArray(message)) {
      return message.join('\n');
    }

    if (typeof message === 'string') {
      return message;
    }

    return '';
  }
}