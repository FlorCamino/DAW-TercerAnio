import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ClientsService } from '../../services/clients.service';

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
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css',
})
export class ClientesListComponent implements OnInit, OnDestroy {
  listaClientes: any[] = [];

  filtros = {
    estado: '',
    busqueda: '',
  };

  clienteEditado: any = { id: null, nombre: '', email: '', telefono: '' };
  editando = false;
  alerta: ClientAlert | null = null;

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
  ) { }

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
      busqueda: '',
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
      },
      error: (err) => {
        console.error('Error detallado:', err);
        this.mostrarError(err, 'No se pudo actualizar el cliente.');
      },
    });
  }

  editar(cliente: any): void {
    if (this.estaDeBaja(cliente)) {
      this.mostrarAviso(
        'Cliente dado de baja',
        'No se puede editar el usuario porque su estado es baja.',
      );
      return;
    }

    this.clienteEditado = { ...cliente };
    this.editando = true;

    setTimeout(() => {
      document.querySelector('.client-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  eliminar(cliente: any): void {
    this.pedirConfirmacion({
      title: 'Dar de baja cliente',
      message: `¿Esta seguro que desea dar de baja al cliente "${cliente.nombre}"?`,
      confirmText: 'Dar de baja',
      confirmDanger: true,
      onConfirm: () => {
        this.api.cambiarEstado(cliente.id).subscribe({
          next: () => this.limpiarFiltros(),
          error: (err) => {
            console.error('Error detallado:', err);
            this.mostrarError(err, 'No se pudo dar de baja el cliente.');
          },
        });
      },
    });
  }

  activar(id: number): void {
    this.pedirConfirmacion({
      title: 'Dar de alta cliente',
      message: 'Esta seguro que desea dar de alta a este cliente?',
      confirmText: 'Dar de alta',
      onConfirm: () => {
        this.api.activarCliente(id).subscribe({
          next: () => this.limpiarFiltros(),
          error: (err) => {
            console.error('Error detallado:', err);
            this.mostrarError(err, 'No se pudo dar de alta el cliente.');
          },
        });
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

  estaDeBaja(cliente: any): boolean {
    return cliente.estado?.toLowerCase() === 'baja';
  }

  cerrarAlerta(): void {
    this.alerta = null;
  }

  confirmarAlerta(): void {
    const onConfirm = this.alerta?.onConfirm;
    this.cerrarAlerta();
    onConfirm?.();
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

  private pedirConfirmacion(alerta: Omit<ClientAlert, 'type'>): void {
    this.alerta = {
      type: 'confirm',
      cancelText: 'Cancelar',
      confirmText: 'Aceptar',
      ...alerta,
    };
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
            this.mostrarError(err, 'No se pudieron cargar los clientes.');
          }
        },
      });
  }

  private normalizarRespuestaClientes(response: any) {
    const pagina = this.extraerPaginaClientes(response);
    const data = Array.isArray(pagina) ? pagina : pagina?.data;
    const clientes = Array.isArray(data) ? data : [];
    const limit = pagina?.limit ?? this.cantidadPorPagina;

    return {
      data: clientes,
      total: pagina?.total ?? clientes.length,
      page: pagina?.page ?? this.paginaActual,
      limit,
      totalPages:
        pagina?.totalPages ??
        (clientes.length > 0 && limit > 0 ? Math.ceil(clientes.length / limit) : 0),
    };
  }

  private extraerPaginaClientes(response: any): any {
    let payload = response;

    for (let i = 0; i < 3; i++) {
      if (Array.isArray(payload) || Array.isArray(payload?.data)) {
        return payload;
      }

      payload = payload?.data;
    }

    return [];
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