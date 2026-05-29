import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Task, TaskFormData } from '../models/task.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface TaskFilters {
  estado?: string;
  busqueda?: string;
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

type TasksApiResponse = ApiResponse<PaginatedTasks | Task[]> | PaginatedTasks | Task[];

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private readonly http: HttpClient) { }

  getTareas(filters: TaskFilters = {}): Observable<Task[]> {
    return this.getTareasPaginadas(filters).pipe(
      map((response: PaginatedTasks) => response.data),
    );
  }

  getTareasPaginadas(filters: TaskFilters = {}): Observable<PaginatedTasks> {
    return this.http
      .get<TasksApiResponse>(this.apiUrl, {
        params: this.buildParams(filters),
      })
      .pipe(
        map((response: TasksApiResponse) => this.normalizeTasksResponse(response, filters)),
      );
  }

  guardarTarea(tarea: TaskFormData): Observable<Task> {
    if (tarea.id) {
      const { id, ...tareaActualizada } = tarea;
      return this.http.patch<Task>(`${this.apiUrl}/${id}`, tareaActualizada);
    }

    const { id, ...nuevaTarea } = tarea;
    return this.http.post<Task>(this.apiUrl, nuevaTarea);
  }

  cambiarEstado(id: number, estado: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, { estado });
  }

  eliminarTarea(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private buildParams(filters: TaskFilters): HttpParams {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      const trimmedValue = typeof value === 'string' ? value.trim() : value?.toString();

      if (trimmedValue) {
        params = params.set(key, trimmedValue);
      }
    }

    return params.set('_t', Date.now().toString());
  }

  private normalizeTasksResponse(
    response: TasksApiResponse,
    filters: TaskFilters,
  ): PaginatedTasks {
    if (
      !Array.isArray(response) &&
      'success' in response &&
      response.success &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      return this.toPaginatedResponseFromPayload(response.data, filters);
    }

    const payload = this.getResponsePayload(response);

    if (Array.isArray(payload)) {
      return this.toPaginatedResponse(payload, filters);
    }

    if (payload && !Array.isArray(payload)) {
      return this.toPaginatedResponseFromPayload(payload, filters);
    }

    return this.toPaginatedResponse([], filters);
  }

  private getResponsePayload(response: TasksApiResponse): PaginatedTasks | Task[] {
    if (Array.isArray(response)) {
      return response;
    }

    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private toPaginatedResponse(data: Task[], filters: TaskFilters): PaginatedTasks {
    const limit = filters.limit ?? data.length;

    return {
      data,
      total: data.length,
      page: filters.page ?? 1,
      limit,
      totalPages: data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0,
    };
  }

  private toPaginatedResponseFromPayload(
    payload: PaginatedTasks,
    filters: TaskFilters,
  ): PaginatedTasks {
    const data = Array.isArray(payload.data) ? payload.data : [];
    const limit = payload.limit ?? filters.limit ?? data.length;

    return {
      data,
      total: payload.total ?? data.length,
      page: payload.page ?? filters.page ?? 1,
      limit,
      totalPages:
        payload.totalPages ??
        (data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0),
    };
  }
}