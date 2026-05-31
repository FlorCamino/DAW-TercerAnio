import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Task, TaskStatus } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';

type TaskState = TaskStatus;

@Component({
    selector: 'app-task-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './task-detail.component.html'
})
export class TaskDetailComponent implements OnInit {
    tarea = signal<Task | null>(null);
    loading = signal(true);
    error = signal('');

    constructor(
        private readonly tasksService: TasksService,
        private readonly route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.loadTask();
    }

    private loadTask(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (!id) {
            this.error.set('No se encontró la tarea solicitada.');
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.error.set('');

        this.tasksService.getTareaPorId(id).subscribe({
            next: (data: Task) => {
                this.tarea.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.tarea.set(null);
                this.error.set('No se pudo cargar la información de la tarea.');
                this.loading.set(false);
            },
        });
    }

    obtenerTextoEstado(estado: string | undefined | null): string {
        const estadoNormalizado = this.normalizarEstadoTarea(estado);

        if (estadoNormalizado === 'finalizado') {
            return 'Finalizado';
        }

        if (estadoNormalizado === 'baja') {
            return 'Baja';
        }

        return 'Pendiente';
    }

    normalizarEstadoTarea(estado: string | undefined | null): TaskState {
        const estadoNormalizado = String(estado ?? '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();

        if (estadoNormalizado === 'finalizado') {
            return 'finalizado';
        }

        if (estadoNormalizado === 'baja') {
            return 'baja';
        }

        return 'pendiente';
    }

    estaPendiente(estado: string | undefined | null): boolean {
        return this.normalizarEstadoTarea(estado) === 'pendiente';
    }

    estaFinalizada(estado: string | undefined | null): boolean {
        return this.normalizarEstadoTarea(estado) === 'finalizado';
    }

    estaDeBaja(estado: string | undefined | null): boolean {
        return this.normalizarEstadoTarea(estado) === 'baja';
    }

    obtenerProyecto(tarea: Task): string {
        if (tarea.proyectoNombre) {
            return tarea.proyectoNombre;
        }

        if (tarea.proyecto?.name) {
            return tarea.proyecto.name;
        }

        if (tarea.proyecto?.nombre) {
            return tarea.proyecto.nombre;
        }

        if (tarea.project?.name) {
            return tarea.project.name;
        }

        if (tarea.project?.nombre) {
            return tarea.project.nombre;
        }

        if (tarea.proyectoId) {
            return `Proyecto #${tarea.proyectoId}`;
        }

        return 'Sin proyecto asociado';
    }

    obtenerProyectoId(tarea: Task): number | null {
        return tarea.proyectoId
            ?? tarea.proyecto?.id
            ?? tarea.project?.id
            ?? null;
    }
}
