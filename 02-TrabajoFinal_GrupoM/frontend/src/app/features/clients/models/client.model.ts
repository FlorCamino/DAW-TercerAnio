export type ClientStatus = 'activo' | 'baja';

export interface ClientProjectSummary {
  id: number;
  name: string;
  status: string;
  endDate: string | null;
  isOverdue?: boolean;
}

export interface Client {
  id: number;
  nombre: string;
  estado: ClientStatus;
  email: string | null;
  telefono: string | null;
  proyectos?: ClientProjectSummary[];
}

export interface ClientFormData {
  id?: number | null;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  estado?: ClientStatus;
}

export interface ClientFilters {
  estado?: string;
  busqueda?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClients {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
