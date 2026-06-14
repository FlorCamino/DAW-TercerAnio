import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Project } from '../../../projects/models/project.model';
import { ProjectService } from '../../../projects/services/project.service';
import { TaskStatus } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';

type AlertType = 'info' | 'error';

interface TaskAlert {
    title: string;
    message: string;
    type: AlertType;
    confirmText: string;
    onClose?: () => void;
}

@Component({
    selector: 'app-task-create',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './task-create.component.html'
})

export class TaskCreateComponent implements OnInit {
    tarea = {
        descripcion: '',
        estado: 'pendiente' as TaskStatus,
        proyectoId: null as number | null,
    };

    proyectos: Project[] = [];

    alerta: TaskAlert | null = null;
    guardando = false;
    cargandoProyectos = false;

    get formularioValido(): boolean {
        return Boolean(this.tarea.descripcion.trim() && this.tarea.proyectoId);
    }

    constructor(
        private readonly tasksService: TasksService,
        private readonly projectService: ProjectService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef,
    ) { }

    ngOnInit(): void {
        this.cargarProyectos();
    }

    guardar(): void {
        if (this.guardando || !this.formularioValido) {
            return;
        }

        this.cerrarAlerta();

        const descripcion = this.tarea.descripcion.trim();

        if (!descripcion) {
            this.mostrarError('Datos incompletos', 'Debe ingresar una descripción para la tarea.');
            return;
        }

        if (!this.tarea.proyectoId) {
            this.mostrarError('Datos incompletos', 'Debe seleccionar un proyecto.');
            return;
        }

        this.guardando = true;

        this.tasksService
            .guardarTarea({
                descripcion,
                estado: this.tarea.estado,
                proyectoId: Number(this.tarea.proyectoId),
            })
            .subscribe({
                next: () => {
                    this.guardando = false;
                    this.alerta = {
                        title: 'Tarea creada',
                        message: `Tarea "${descripcion}" creada correctamente.`,
                        type: 'info',
                        confirmText: 'Salir',
                        onClose: () => this.router.navigate(['/tareas']),
                    };
                    this.cdr.detectChanges();
                },
                error: (err: HttpErrorResponse) => {
                    this.guardando = false;
                    this.mostrarError(
                        'No se pudo crear',
                        this.obtenerMensajeError(err) || 'No se pudo crear la tarea.',
                    );
                    this.cdr.detectChanges();
                },
            });
    }

    private cargarProyectos(): void {
        this.cargandoProyectos = true;

        this.projectService.getAll({ limit: 1000 }).subscribe({
            next: (proyectos: Project[]) => {
                this.proyectos = proyectos.filter((proyecto) => {
                    return proyecto.status?.toLowerCase() !== 'baja';
                });

                this.cargandoProyectos = false;
                this.cdr.detectChanges();
            },
            error: (err: HttpErrorResponse) => {
                this.proyectos = [];
                this.cargandoProyectos = false;
                this.mostrarError(
                    'No se pudieron cargar los proyectos',
                    this.obtenerMensajeError(err) || 'No se pudieron cargar los proyectos.',
                );
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
