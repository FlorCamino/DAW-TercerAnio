import { Client } from '../../clients/models/client.model';

export type ProjectStatus = 'activo' | 'finalizado' | 'baja';

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
