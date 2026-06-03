import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client, ClientFilters, ClientFormData, PaginatedClients } from '../models/client.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface ApiClient {
  id: number;
  name: string;
  status: Client['estado'];
  email: string | null;
  phone: string | null;
  projects?: Client['proyectos'];
}

interface ApiPaginatedClients {
  data: ApiClient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ClientsApiResponse = ApiResponse<ApiPaginatedClients | ApiClient[]> | ApiPaginatedClients | ApiClient[];
type ClientApiResponse = ApiResponse<ApiClient> | ApiClient;

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;

  constructor(private readonly http: HttpClient) { }

  getClientes(filters: ClientFilters = {}): Observable<Client[]> {
    return this.getClientesPaginados(filters).pipe(
      map((response: PaginatedClients) => response.data),
    );
  }

  getClientesPaginados(filters: ClientFilters = {}): Observable<PaginatedClients> {
    const normalizedFilters = this.withDefaultPagination(filters);

    return this.http
      .get<ClientsApiResponse>(this.apiUrl, {
        params: this.buildParams(normalizedFilters),
      })
      .pipe(
        map((response: ClientsApiResponse) => this.normalizeClientsResponse(response, normalizedFilters)),
      );
  }

  getClientePorId(id: number): Observable<Client> {
    return this.http.get<ClientApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: ClientApiResponse) => {
        if (
          response &&
          typeof response === 'object' &&
          'success' in response &&
          'data' in response
        ) {
          return this.toClient(response.data);
        }

        return this.toClient(response);
      }),
    );
  }

  crearCliente(cliente: ClientFormData): Observable<Client> {
    if (cliente.id) {
      const { id, ...clienteActualizado } = cliente;
      return this.http.patch<ClientApiResponse>(`${this.apiUrl}/${id}`, this.toApiWritePayload(clienteActualizado)).pipe(
        map((response: ClientApiResponse) => this.toClient(this.getSingleResponsePayload(response))),
      );
    }

    return this.http.post<ClientApiResponse>(this.apiUrl, this.toApiWritePayload(cliente)).pipe(
      map((response: ClientApiResponse) => this.toClient(this.getSingleResponsePayload(response))),
    );
  }

  cambiarEstado(id: number): Observable<Client> {
    return this.http.delete<ClientApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: ClientApiResponse) => this.toClient(this.getSingleResponsePayload(response))),
    );
  }

  activarCliente(id: number): Observable<Client> {
    return this.http.patch<ClientApiResponse>(`${this.apiUrl}/${id}`, { status: 'activo' }).pipe(
      map((response: ClientApiResponse) => this.toClient(this.getSingleResponsePayload(response))),
    );
  }

  private buildParams(filters: ClientFilters): HttpParams {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(this.toApiFilters(filters))) {
      const trimmedValue = typeof value === 'string' ? value.trim() : value?.toString();

      if (trimmedValue) {
        params = params.set(key, trimmedValue);
      }
    }

    return params.set('_t', Date.now().toString());
  }

  private withDefaultPagination(filters: ClientFilters): ClientFilters {
    return {
      ...filters,
      page: filters.page ?? 1,
      limit: filters.limit ?? 6,
    };
  }

  private normalizeClientsResponse(
    response: ClientsApiResponse,
    filters: ClientFilters,
  ): PaginatedClients {
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

  private getResponsePayload(response: ClientsApiResponse): ApiPaginatedClients | ApiClient[] {
    if (Array.isArray(response)) {
      return response;
    }

    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private getSingleResponsePayload(response: ClientApiResponse): ApiClient {
    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private toPaginatedResponse(data: ApiClient[], filters: ClientFilters): PaginatedClients {
    const limit = filters.limit ?? data.length;

    return {
      data: data.map((client) => this.toClient(client)),
      total: data.length,
      page: filters.page ?? 1,
      limit,
      totalPages: data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0,
    };
  }

  private toPaginatedResponseFromPayload(
    payload: ApiPaginatedClients,
    filters: ClientFilters,
  ): PaginatedClients {
    const data = Array.isArray(payload.data) ? payload.data : [];
    const limit = payload.limit ?? filters.limit ?? data.length;

    return {
      data: data.map((client) => this.toClient(client)),
      total: payload.total ?? data.length,
      page: payload.page ?? filters.page ?? 1,
      limit,
      totalPages:
        payload.totalPages ??
        (data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0),
    };
  }

  private toClient(client: ApiClient): Client {
    return {
      id: client.id,
      nombre: client.name,
      estado: client.status,
      email: client.email,
      telefono: client.phone,
      proyectos: client.projects,
    };
  }

  private toApiFilters(filters: ClientFilters): Record<string, string | number | undefined> {
    return {
      status: filters.estado,
      name: filters.nombre,
      email: filters.email,
      phone: filters.telefono,
      page: filters.page,
      limit: filters.limit,
    };
  }

  private toApiWritePayload(cliente: Partial<ClientFormData>): {
    nombre?: string;
    email?: string | null;
    telefono?: string | null;
    status?: string;
  } {
    return {
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      status: cliente.estado,
    };
  }
}
