import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedTasks, Task, TaskFilters, TaskFormData, TaskStatus } from '../models/task.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ApiTask {
  id: number;
  description: string;
  status: TaskStatus;
  projectId: number;
  projectName: string | null;
}

interface ApiPaginatedTasks {
  data: ApiTask[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type TasksBackendResponse = ApiResponse<ApiPaginatedTasks | ApiTask[]> | ApiPaginatedTasks | ApiTask[];
type TaskBackendResponse = ApiResponse<ApiTask> | ApiTask;

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
    const normalizedFilters = this.withDefaultPagination(filters);

    return this.http
      .get<TasksBackendResponse>(this.apiUrl, {
        params: this.buildParams(this.toApiFilters(normalizedFilters)),
      })
      .pipe(
        map((response: TasksBackendResponse) => this.normalizeTasksResponse(response, normalizedFilters)),
      );
  }

  getTareaPorId(id: number): Observable<Task> {
    return this.http.get<TaskBackendResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: TaskBackendResponse) => this.toTask(this.getSingleResponsePayload(response))),
    );
  }

  guardarTarea(tarea: TaskFormData): Observable<Task> {
    if (tarea.id) {
      const { id, ...tareaActualizada } = tarea;
      return this.http.patch<TaskBackendResponse>(`${this.apiUrl}/${id}`, this.toApiTaskPayload(tareaActualizada)).pipe(
        map((response: TaskBackendResponse) => this.toTask(this.getSingleResponsePayload(response))),
      );
    }

    return this.http.post<TaskBackendResponse>(this.apiUrl, this.toApiTaskPayload(tarea)).pipe(
      map((response: TaskBackendResponse) => this.toTask(this.getSingleResponsePayload(response))),
    );
  }

  cambiarEstado(id: number, estado: TaskStatus): Observable<Task> {
    return this.http.patch<TaskBackendResponse>(`${this.apiUrl}/${id}`, { status: estado }).pipe(
      map((response: TaskBackendResponse) => this.toTask(this.getSingleResponsePayload(response))),
    );
  }

  eliminarTarea(id: number): Observable<Task> {
    return this.http.delete<TaskBackendResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: TaskBackendResponse) => this.toTask(this.getSingleResponsePayload(response))),
    );
  }

  private buildParams(filters: Record<string, string | number | null | undefined>): HttpParams {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      const trimmedValue = typeof value === 'string' ? value.trim() : value?.toString();

      if (trimmedValue) {
        params = params.set(key, trimmedValue);
      }
    }

    return params.set('_t', Date.now().toString());
  }

  private withDefaultPagination(filters: TaskFilters): TaskFilters {
    return {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };
  }

  private normalizeTasksResponse(
    response: TasksBackendResponse,
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

  private getResponsePayload(response: TasksBackendResponse): ApiPaginatedTasks | ApiTask[] {
    if (Array.isArray(response)) {
      return response;
    }

    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private getSingleResponsePayload(response: TaskBackendResponse): ApiTask {
    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private toPaginatedResponse(data: ApiTask[], filters: TaskFilters): PaginatedTasks {
    const limit = filters.limit ?? data.length;

    return {
      data: data.map((task) => this.toTask(task)),
      total: data.length,
      page: filters.page ?? 1,
      limit,
      totalPages: data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0,
    };
  }

  private toPaginatedResponseFromPayload(
    payload: ApiPaginatedTasks,
    filters: TaskFilters,
  ): PaginatedTasks {
    const data = Array.isArray(payload.data) ? payload.data : [];
    const limit = payload.limit ?? filters.limit ?? data.length;

    return {
      data: data.map((task) => this.toTask(task)),
      total: payload.total ?? data.length,
      page: payload.page ?? filters.page ?? 1,
      limit,
      totalPages:
        payload.totalPages ??
        (data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0),
    };
  }

  private toTask(task: ApiTask): Task {
    return {
      id: task.id,
      descripcion: task.description,
      estado: task.status,
      proyectoId: task.projectId,
      proyectoNombre: task.projectName,
    };
  }

  private toApiFilters(filters: TaskFilters): Record<string, string | number | null | undefined> {
    return {
      status: filters.estado,
      description: filters.descripcion,
      projectId: filters.proyectoId,
      page: filters.page,
      limit: filters.limit,
    };
  }

  private toApiTaskPayload(tarea: Partial<TaskFormData>): {
    description?: string;
    status?: TaskStatus;
    projectId?: number | null;
  } {
    return {
      description: tarea.descripcion,
      status: tarea.estado,
      projectId: tarea.proyectoId,
    };
  }
}
