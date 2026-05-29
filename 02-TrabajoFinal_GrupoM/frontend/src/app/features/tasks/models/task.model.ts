export type TaskStatus = 'pendiente' | 'finalizado' | 'baja';

export interface Task {
    id: number;
    descripcion: string;
    estado: TaskStatus;
    proyectoId: number | null;
    proyectoNombre?: string | null;
}

export interface TaskFormData {
    id?: number | null;
    descripcion: string;
    estado?: TaskStatus;
    proyectoId: number | null;
}