import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ClientFilters {
  estado?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClients {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ClientsApiResponse = ApiResponse<PaginatedClients | any[]> | PaginatedClients | any[];

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getClientes(filters: ClientFilters = {}): Observable<any[]> {
    return this.getClientesPaginados(filters).pipe(map((response) => response.data));
  }

  getClientesPaginados(filters: ClientFilters = {}): Observable<PaginatedClients> {
    return this.http
      .get<ClientsApiResponse>(this.apiUrl, {
        params: this.buildParams(filters),
      })
      .pipe(map((response) => this.normalizeClientsResponse(response, filters)));
  }

  crearCliente(cliente: any): Observable<any> {
    if (cliente.id) {
      const { id, ...clienteActualizado } = cliente;
      return this.http.patch(`${this.apiUrl}/${id}`, clienteActualizado);
    }

    const { id, estado, ...nuevoCliente } = cliente;
    return this.http.post(this.apiUrl, nuevoCliente);
  }

  cambiarEstado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  activarCliente(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { estado: 'activo' });
  }

  private buildParams(filters: ClientFilters): HttpParams {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      const trimmedValue = typeof value === 'string' ? value.trim() : value?.toString();

      if (trimmedValue) {
        params = params.set(key, trimmedValue);
      }
    }

    return params.set('_t', Date.now().toString());
  }

  private normalizeClientsResponse(
    response: ClientsApiResponse,
    filters: ClientFilters,
  ): PaginatedClients {
    const payload = this.getResponsePayload(response);

    if (Array.isArray(payload)) {
      return this.toPaginatedResponse(payload, filters);
    }

    if (payload && Array.isArray(payload.data)) {
      return {
        data: payload.data,
        total: payload.total ?? payload.data.length,
        page: payload.page ?? filters.page ?? 1,
        limit: payload.limit ?? filters.limit ?? payload.data.length,
        totalPages: payload.totalPages ?? 1,
      };
    }

    return this.toPaginatedResponse([], filters);
  }

  private getResponsePayload(response: ClientsApiResponse): PaginatedClients | any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private toPaginatedResponse(data: any[], filters: ClientFilters): PaginatedClients {
    const limit = filters.limit ?? data.length;

    return {
      data,
      total: data.length,
      page: filters.page ?? 1,
      limit,
      totalPages: data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0,
    };
  }
}
