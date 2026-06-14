import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, ProjectStatus } from '../models/project.model';
import { environment } from '../../../../environments/environment';

interface ProjectFilters {
  estado?: string;
  nombre?: string;
  clientId?: number | string | null;
  page?: number;
  limit?: number;
}

interface ApiProject {
  id: number;
  name: string;
  status: ProjectStatus;
  clientId: number | null;
  client: {
    id: number;
    name: string;
    status: string;
  } | null;
  endDate: string | null;
  isOverdue: boolean;
  tasks?: {
    id: number;
    description: string;
    status: 'pendiente' | 'finalizado' | 'baja';
  }[];
}

interface ApiProjectListResponse {
  data: ApiProject[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(filters: ProjectFilters = {}): Observable<Project[]> {
    return this.http.get<{ success: boolean; data: ApiProjectListResponse }>(this.apiUrl, {
      params: this.buildParams(filters),
    }).pipe(
      map(res => res.data.data.map((project) => this.toProject(project)))
    );
  }

  getOne(id: number): Observable<Project> {
    return this.http.get<{ success: boolean; data: ApiProject }>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.toProject(res.data))
    );
  }

  create(payload: { name: string; clientId?: number | null; endDate?: string | null }): Observable<Project> {
    return this.http.post<{ success: boolean; data: ApiProject }>(this.apiUrl, payload).pipe(
      map(res => this.toProject(res.data))
    );
  }

  update(
    id: number,
    payload: { name?: string; status?: string; clientId?: number | null; endDate?: string | null },
  ): Observable<Project> {
    return this.http.patch<{ success: boolean; data: ApiProject }>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => this.toProject(res.data))
    );
  }

  remove(id: number): Observable<Project> {
    return this.http.delete<{ success: boolean; data: ApiProject }>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.toProject(res.data))
    );
  }

  private buildParams(filters: ProjectFilters): HttpParams {
    let params = new HttpParams()
      .set('page', (filters.page ?? 1).toString())
      .set('limit', (filters.limit ?? 6).toString());

    for (const [key, value] of Object.entries(this.toApiFilters(filters))) {
      if (key === 'page' || key === 'limit') continue;

      const trimmedValue = typeof value === 'string' ? value.trim() : value?.toString();
      if (trimmedValue) {
        params = params.set(key, trimmedValue);
      }
    }

    return params.set('_t', Date.now().toString());
  }

  private toApiFilters(filters: ProjectFilters): Record<string, string | number | null | undefined> {
    return {
      status: filters.estado,
      name: filters.nombre,
      clientId: filters.clientId,
      page: filters.page,
      limit: filters.limit,
    };
  }

  private toProject(project: ApiProject): Project {
    return {
      ...project,
      client: project.client
        ? {
            id: project.client.id,
            nombre: project.client.name,
            estado: project.client.status as 'activo' | 'baja',
            email: null,
            telefono: null,
          }
        : null,
    };
  }
}
