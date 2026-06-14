export type TaskStatus = 'pendiente' | 'finalizado' | 'baja';

export interface TaskProjectSummary {
    id: number;
    name: string;
    nombre?: string;
}

export interface Task {
    id: number;
    descripcion: string;
    estado: TaskStatus;
    proyectoId: number;
    proyectoNombre: string | null;
    project?: TaskProjectSummary | null;
    proyecto?: TaskProjectSummary | null;
}

export interface TaskFormData {
    id?: number | null;
    descripcion: string;
    estado?: TaskStatus;
    proyectoId: number | null;
}

export interface TaskFilters {
    estado?: string;
    descripcion?: string;
    proyectoId?: number | string | null;
    page?: number;
    limit?: number;
}

export interface PaginatedTasks {
    data: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
