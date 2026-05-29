import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
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
  success = '';
  guardando = false;

  constructor(
    private readonly clientsService: ClientsService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  guardar(): void {
    this.error = '';
    this.success = '';
    this.guardando = true;

    this.clientsService.crearCliente(this.cliente).subscribe({
      next: () => {
        this.guardando = false;
        this.success = 'El cliente fue creado con éxito.';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/clientes']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.success = '';
        this.error = this.obtenerMensajeError(err) || 'No se pudo crear el cliente.';

        this.cdr.detectChanges();
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