import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Project } from '../../../projects/models/project.model';
import { ProjectService } from '../../../projects/services/project.service';
import { TaskStatus } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';

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

    error = '';
    success = '';
    guardando = false;
    cargandoProyectos = false;

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
        this.error = '';
        this.success = '';

        const descripcion = this.tarea.descripcion.trim();

        if (!descripcion) {
            this.error = 'Debe ingresar una descripción para la tarea.';
            return;
        }

        if (!this.tarea.proyectoId) {
            this.error = 'Debe seleccionar un proyecto.';
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
                    this.success = 'La tarea fue creada con éxito.';
                    this.cdr.detectChanges();

                    setTimeout(() => {
                        this.router.navigate(['/tareas']);
                    }, 1800);
                },
                error: (err: HttpErrorResponse) => {
                    this.guardando = false;
                    this.error = this.obtenerMensajeError(err) || 'No se pudo crear la tarea.';
                    this.cdr.detectChanges();
                },
            });
    }

    private cargarProyectos(): void {
        this.cargandoProyectos = true;

        this.projectService.getAll().subscribe({
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
                this.error = this.obtenerMensajeError(err) || 'No se pudieron cargar los proyectos.';
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