import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientsService } from '../../services/clients.service';

@Component({
  selector: 'app-cliente-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cliente-create.component.html',
  styleUrl: './cliente-create.component.css',
})
export class ClienteCreateComponent {
  cliente = {
    nombre: '',
    email: '',
    telefono: '',
  };
  error = '';

  constructor(
    private readonly clientsService: ClientsService,
    private readonly router: Router,
  ) {}

  guardar(): void {
    this.error = '';

    this.clientsService.crearCliente(this.cliente).subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: (err: HttpErrorResponse) => {
        this.error = this.obtenerMensajeError(err) || 'No se pudo crear el cliente.';
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
