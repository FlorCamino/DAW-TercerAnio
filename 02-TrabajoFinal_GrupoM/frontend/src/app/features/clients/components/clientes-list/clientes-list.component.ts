import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
export class ClientesListComponent implements OnInit {
  listaClientes: any[] = [];
  filtros = {
    estado: '',
    nombre: '',
    email: '',
    telefono: '',
  };
  clienteEditado: any = { id: null, nombre: '', email: '', telefono: '' };
  editando = false;
  alerta: ClientAlert | null = null;
  totalClientes = 0;
  paginaActual = 1;
  cantidadPorPagina = 6;
  totalPaginas = 0;

  constructor(private api: ClientsService) { }

  ngOnInit(): void {
    this.cargarTodos();
  }

  cargarTodos(): void {
    this.cargarClientes(false);
  }

  buscarClientes(): void {
    this.paginaActual = 1;
    this.cargarClientes(true);
  }

  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      nombre: '',
      email: '',
      telefono: '',
    };
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
          this.listaClientes = response.data;
          this.totalClientes = response.total;
          this.paginaActual = response.page;
          this.cantidadPorPagina = response.limit;
          this.totalPaginas = response.totalPages;
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
