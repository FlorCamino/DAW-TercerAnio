import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProjectFormComponent, ProjectFormValue } from '../../components/project-form/project-form.component';
import { ProjectService } from '../../services/project.service';

type AlertType = 'info' | 'error';

interface ProjectAlert {
  title: string;
  message: string;
  type: AlertType;
  confirmText: string;
  onClose?: () => void;
}

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [CommonModule, RouterLink, ProjectFormComponent],
  templateUrl: './project-create.component.html'
})
export class ProjectCreateComponent {
  alerta: ProjectAlert | null = null;
  guardando = false;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  onSubmit(value: ProjectFormValue): void {
    if (this.guardando) {
      return;
    }

    this.cerrarAlerta();
    this.guardando = true;

    this.projectService.create(value).subscribe({
      next: () => {
        this.guardando = false;
        this.alerta = {
          title: 'Proyecto creado',
          message: `Proyecto "${value.name}" creado correctamente.`,
          type: 'info',
          confirmText: 'Salir',
          onClose: () => this.router.navigate(['/projects']),
        };
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando = false;
        this.mostrarError('No se pudo crear', this.obtenerMensajeError(err, 'No se pudo crear el proyecto.'));
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
