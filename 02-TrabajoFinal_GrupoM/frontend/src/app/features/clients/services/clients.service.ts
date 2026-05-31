import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client, ClientFilters, ClientFormData, PaginatedClients } from '../models/client.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type ClientsApiResponse = ApiResponse<PaginatedClients | Client[]> | PaginatedClients | Client[];
type ClientApiResponse = ApiResponse<Client> | Client;

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
    return this.http
      .get<ClientsApiResponse>(this.apiUrl, {
        params: this.buildParams(filters),
      })
      .pipe(
        map((response: ClientsApiResponse) => this.normalizeClientsResponse(response, filters)),
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
          return response.data;
        }

        return response;
      }),
    );
  }

  crearCliente(cliente: ClientFormData): Observable<Client> {
    if (cliente.id) {
      const { id, ...clienteActualizado } = cliente;
      return this.http.patch<ClientApiResponse>(`${this.apiUrl}/${id}`, clienteActualizado).pipe(
        map((response: ClientApiResponse) => this.getSingleResponsePayload(response)),
      );
    }

    const { id, estado, ...nuevoCliente } = cliente;
    return this.http.post<ClientApiResponse>(this.apiUrl, nuevoCliente).pipe(
      map((response: ClientApiResponse) => this.getSingleResponsePayload(response)),
    );
  }

  cambiarEstado(id: number): Observable<Client> {
    return this.http.delete<ClientApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response: ClientApiResponse) => this.getSingleResponsePayload(response)),
    );
  }

  activarCliente(id: number): Observable<Client> {
    return this.http.patch<ClientApiResponse>(`${this.apiUrl}/${id}`, { estado: 'activo' }).pipe(
      map((response: ClientApiResponse) => this.getSingleResponsePayload(response)),
    );
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

  private getResponsePayload(response: ClientsApiResponse): PaginatedClients | Client[] {
    if (Array.isArray(response)) {
      return response;
    }

    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private getSingleResponsePayload(response: ClientApiResponse): Client {
    if ('success' in response && 'data' in response) {
      return response.data;
    }

    return response;
  }

  private toPaginatedResponse(data: Client[], filters: ClientFilters): PaginatedClients {
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
    payload: PaginatedClients,
    filters: ClientFilters,
  ): PaginatedClients {
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
