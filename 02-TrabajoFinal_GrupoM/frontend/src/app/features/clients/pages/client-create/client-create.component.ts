import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientFormData } from '../../models/client.model';
import { ClientsService } from '../../services/clients.service';

type AlertType = 'info' | 'error';

interface ClientAlert {
  title: string;
  message: string;
  type: AlertType;
  confirmText: string;
  onClose?: () => void;
}

@Component({
  selector: 'app-cliente-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-create.component.html'
})
export class ClientCreateComponent {
  cliente: ClientFormData = {
    nombre: '',
    email: '',
    telefono: '',
  };

  alerta: ClientAlert | null = null;
  guardando = false;

  get formularioValido(): boolean {
    return Boolean(
      this.cliente.nombre.trim() &&
      String(this.cliente.telefono ?? '').trim().length >= 7,
    );
  }

  constructor(
    private readonly clientsService: ClientsService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  guardar(): void {
    if (this.guardando || !this.formularioValido) {
      return;
    }

    this.cerrarAlerta();
    this.guardando = true;

    this.clientsService.crearCliente(this.cliente).subscribe({
      next: () => {
        this.guardando = false;
        this.alerta = {
          title: 'Cliente creado',
          message: `Cliente "${this.cliente.nombre}" creado correctamente.`,
          type: 'info',
          confirmText: 'Salir',
          onClose: () => this.router.navigate(['/clientes']),
        };
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError('No se pudo crear', this.obtenerMensajeError(err, 'No se pudo crear el cliente.'));
        this.cdr.detectChanges();
      },
    });
  }

  cerrarAlerta(): void {
    const onClose = this.alerta?.onClose;
    this.alerta = null;

    if (onClose) {
      onClose();
    }
  }

  private mostrarError(title: string, message: string): void {
    this.alerta = {
      title,
      message,
      type: 'error',
      confirmText: 'Salir',
    };
  }

  private obtenerMensajeError(error: HttpErrorResponse, mensajePorDefecto: string): string {
    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' ');
    }

    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return mensajePorDefecto;
  }
}
