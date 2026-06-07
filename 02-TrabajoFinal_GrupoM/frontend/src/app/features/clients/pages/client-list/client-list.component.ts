import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, finalize, takeUntil } from 'rxjs';
import { Client, ClientFormData, ClientStatus, PaginatedClients } from '../../models/client.model';
import { ClientsService } from '../../services/clients.service';

import { AuthService } from '../../../../../core/services/auth.service';

type AlertType = 'info' | 'error' | 'confirm';

interface ClientAlert {
  title: string;
  message?: string;
  type: AlertType;
  confirmText?: string;
  cancelText?: string;
  confirmDanger?: boolean;
  onConfirm?: () => void;
}
@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-list.component.html',
})
export class ClientListComponent implements OnInit, OnDestroy {
  listaClientes: Client[] = [];

  filtros = {
    estado: '',
    nombre: '',
    telefono: '',
  };

  clienteEditado: ClientFormData = { id: null, nombre: '', email: '', telefono: '' };
  editando = false;
  alerta: ClientAlert | null = null;
  cambiandoEstadoId: number | null = null;

  totalClientes = 0;
  paginaActual = 1;
  cantidadPorPagina = 6;
  totalPaginas = 0;

  estadoDropdownAbierto = false;

  private readonly filtrosChange$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private api: ClientsService,
    private cdr: ChangeDetectorRef,
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
        this.cargarClientes(this.hayFiltrosActivos());
      });

    this.cargarTodos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTodos(): void {
    this.cargarClientes(false);
  }

  buscarClientes(): void {
    this.paginaActual = 1;
    this.cargarClientes(true);
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
    if (estado === 'activo') {
      return 'Activo';
    }

    if (estado === 'baja') {
      return 'Baja';
    }

    return 'Todos los estados';
  }

  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      nombre: '',
      telefono: '',
    };

    this.estadoDropdownAbierto = false;
    this.paginaActual = 1;
    this.cargarTodos();
  }

  guardar(): void {
    this.api.crearCliente(this.clienteEditado).subscribe({
      next: () => {
        this.limpiar();
        this.limpiarFiltros();

        this.mostrarAviso(
          'Cliente actualizado',
          'Los datos del cliente se guardaron correctamente.',
        );
      },
      error: (err: unknown) => {
        this.mostrarError(err, 'No se pudo actualizar el cliente.');
      },
    });
  }

  editar(cliente: Client): void {
    if (this.estaDeBaja(cliente)) {
      this.mostrarAviso(
        'Cliente dado de baja',
        'No se puede editar el cliente porque su estado es baja.',
      );
      return;
    }

    this.clienteEditado = { ...cliente };
    this.editando = true;

    setTimeout(() => {
      document.querySelector('.management-edit-card')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  eliminar(cliente: Client): void {
    if (this.estaDeBaja(cliente)) {
      this.mostrarAviso(
        'Cliente dado de baja',
        'Este cliente ya se encuentra dado de baja.',
      );
      return;
    }

    this.pedirConfirmacion({
      title: 'Dar de baja cliente',
      message: `¿Está seguro que desea dar de baja al cliente "${cliente.nombre}"?`,
      confirmText: 'Dar de baja',
      cancelText: 'Cancelar',
      confirmDanger: true,
      onConfirm: () => {
        this.api.cambiarEstado(cliente.id).subscribe({
          next: () => {
            this.mostrarAviso(
              'Cliente dado de baja',
              `El cliente "${cliente.nombre}" fue dado de baja correctamente.`,
            );

            this.cargarClientes(this.hayFiltrosActivos());
          },
          error: (error: unknown) => {
            this.mostrarError(
              error,
              'No se puede dar de baja el cliente porque está asociado a uno o más proyectos.',
              'No se pudo dar de baja el cliente',
            );
          },
        });
      },
    });
  }

  activar(id: number): void {
    this.pedirConfirmacion({
      title: 'Dar de alta cliente',
      message: '¿Está seguro que desea dar de alta a este cliente?',
      confirmText: 'Dar de alta',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.api.activarCliente(id).subscribe({
          next: () => {
            this.mostrarAviso(
              'Cliente dado de alta',
              'El cliente fue dado de alta correctamente.',
            );

            this.limpiarFiltros();
          },
          error: (err: unknown) => {
            this.mostrarError(err, 'No se pudo dar de alta el cliente.');
          },
        });
      },
    });
  }

  normalizarEstado(estado: string): ClientStatus {
    const estadoNormalizado = String(estado ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    return estadoNormalizado === 'baja' ? 'baja' : 'activo';
  }

  solicitarCambioEstado(cliente: Client, nuevoEstado: ClientStatus): void {
    const estadoActual = this.normalizarEstado(cliente.estado);

    if (estadoActual === nuevoEstado) {
      return;
    }

    this.pedirConfirmacion({
      title: nuevoEstado === 'baja' ? 'Dar de baja cliente' : 'Activar cliente',
      message:
        nuevoEstado === 'baja'
          ? `¿Está seguro que desea dar de baja al cliente "${cliente.nombre}"?`
          : `¿Está seguro que desea activar al cliente "${cliente.nombre}"?`,
      confirmText: nuevoEstado === 'baja' ? 'Dar de baja' : 'Activar',
      cancelText: 'Cancelar',
      confirmDanger: nuevoEstado === 'baja',
      onConfirm: () => {
        this.actualizarEstadoCliente(cliente, nuevoEstado);
      },
    });
  }

  private actualizarEstadoCliente(cliente: Client, nuevoEstado: ClientStatus): void {
    this.cambiandoEstadoId = cliente.id;

    const request$ =
      nuevoEstado === 'baja'
        ? this.api.cambiarEstado(cliente.id)
        : this.api.activarCliente(cliente.id);

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
            nuevoEstado === 'baja' ? 'Cliente dado de baja' : 'Cliente activado',
            nuevoEstado === 'baja'
              ? `El cliente "${cliente.nombre}" fue dado de baja correctamente.`
              : `El cliente "${cliente.nombre}" fue activado correctamente.`,
          );

          this.cargarClientes(this.hayFiltrosActivos());
        },
        error: (error: unknown) => {
          this.mostrarError(
            error,
            nuevoEstado === 'baja'
              ? 'No se puede dar de baja el cliente porque está asociado a uno o más proyectos.'
              : 'No se pudo activar el cliente.',
            nuevoEstado === 'baja'
              ? 'No se pudo dar de baja el cliente'
              : 'No se pudo activar el cliente',
          );

          this.cargarClientes(this.hayFiltrosActivos());
        },
      });
  }

  limpiar(): void {
    this.clienteEditado = { id: null, nombre: '', email: '', telefono: '' };
    this.editando = false;
  }

  hayFiltrosActivos(): boolean {
    return Object.values(this.filtros).some((value) => value.trim() !== '');
  }

  cambiarCantidadPorPagina(): void {
    this.paginaActual = 1;
    this.cargarClientes(this.hayFiltrosActivos());
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.cargarClientes(this.hayFiltrosActivos());
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.cargarClientes(this.hayFiltrosActivos());
    }
  }

  estaDeBaja(cliente: Client): boolean {
    return cliente.estado?.toLowerCase() === 'baja';
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

  private mostrarError(
    error: unknown,
    mensajePorDefecto: string,
    titulo = 'Ocurrió un error',
  ): void {
    this.setAlerta({
      title: titulo,
      message: this.obtenerMensajeError(error, mensajePorDefecto),
      type: 'error',
      confirmText: 'Entendido',
    });
  }

  private mostrarAviso(title: string, message: string): void {
    this.setAlerta({
      title,
      message,
      type: 'info',
      confirmText: 'Entendido',
    });
  }

  private pedirConfirmacion(alerta: Omit<ClientAlert, 'type'>): void {
    this.setAlerta({
      type: 'confirm',
      cancelText: 'Cancelar',
      confirmText: 'Aceptar',
      ...alerta,
    });
  }

  private setAlerta(alerta: ClientAlert): void {
    this.alerta = alerta;
    this.cdr.detectChanges();
  }

  private cargarClientes(conFiltros: boolean): void {
    const filtros = conFiltros ? this.filtros : {};

    this.api
      .getClientesPaginados({
        ...filtros,
        page: this.paginaActual,
        limit: this.cantidadPorPagina,
      })
      .subscribe({
        next: (response) => {
          const clientesPaginados = this.normalizarRespuestaClientes(response);

          this.listaClientes = [...clientesPaginados.data];
          this.totalClientes = clientesPaginados.total;
          this.paginaActual = clientesPaginados.page;
          this.cantidadPorPagina = clientesPaginados.limit;
          this.totalPaginas = clientesPaginados.totalPages;

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.listaClientes = [];
          this.totalClientes = 0;
          this.totalPaginas = 0;

          if (!conFiltros || err.status !== 400) {
            this.mostrarError(
              err,
              'No se pudieron cargar los clientes.',
              'Error al cargar clientes',
            );
          }
        },
      });
  }

  private normalizarRespuestaClientes(response: PaginatedClients): PaginatedClients {
    const clientes = Array.isArray(response.data) ? response.data : [];
    const limit = response.limit ?? this.cantidadPorPagina;

    return {
      data: clientes,
      total: response.total ?? clientes.length,
      page: response.page ?? this.paginaActual,
      limit,
      totalPages:
        response.totalPages ??
        (clientes.length > 0 && limit > 0 ? Math.ceil(clientes.length / limit) : 0),
    };
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
