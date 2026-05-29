export type ProjectStatus = 'activo' | 'finalizado' | 'baja';

export interface Client {
  id: number;
  nombre: string;
  estado: string;
}

export interface Project {
  id: number;
  name: string;
  status: ProjectStatus;
  clientId: number | null;
  client: Client | null;
  endDate: string | null;
  isOverdue: boolean;
}

export interface ProjectListResponse {
  data: Project[];
  total: number;
}