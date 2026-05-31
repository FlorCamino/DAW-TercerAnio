import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedTasks, Task, TaskFilters, TaskFormData, TaskStatus } from '../models/task.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type TasksApiResponse = ApiResponse<PaginatedTasks | Task[]> | PaginatedTasks | Task[];
type TaskApiResponse = ApiResponse<Task> | Task;

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

  getTareaPorId(id: number): Observable<Task> {
    return this.http.get<TaskApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: TaskApiResponse) => this.getSingleResponsePayload(response)),
    );
  }

  guardarTarea(tarea: TaskFormData): Observable<Task> {
    if (tarea.id) {
      const { id, ...tareaActualizada } = tarea;
      return this.http.patch<TaskApiResponse>(`${this.apiUrl}/${id}`, tareaActualizada).pipe(
        map((response: TaskApiResponse) => this.getSingleResponsePayload(response)),
      );
    }

    const { id, ...nuevaTarea } = tarea;
    return this.http.post<TaskApiResponse>(this.apiUrl, nuevaTarea).pipe(
      map((response: TaskApiResponse) => this.getSingleResponsePayload(response)),
    );
  }

  cambiarEstado(id: number, estado: TaskStatus): Observable<Task> {
    return this.http.patch<TaskApiResponse>(`${this.apiUrl}/${id}`, { estado }).pipe(
      map((response: TaskApiResponse) => this.getSingleResponsePayload(response)),
    );
  }

  eliminarTarea(id: number): Observable<Task> {
    return this.http.delete<TaskApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: TaskApiResponse) => this.getSingleResponsePayload(response)),
    );
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

  private getSingleResponsePayload(response: TaskApiResponse): Task {
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
