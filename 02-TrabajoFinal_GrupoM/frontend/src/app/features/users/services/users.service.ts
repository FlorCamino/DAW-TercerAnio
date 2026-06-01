import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import { User, UserFilters, PaginatedUsers } from "../models/user.model";

interface ApiResponse<T> {
    success: boolean;
    data: T
}

type UsersApiResponse = ApiResponse<PaginatedUsers | User[]> | PaginatedUsers | User[];
type UserApiResponse = ApiResponse<User> | User;

@Injectable({ providedIn: "root" })
export class UsersService {
    private readonly apiUrl = `${environment.apiUrl}/users`;

    constructor(private readonly http: HttpClient) { }

    getUsuarios(filters: UserFilters = {}): Observable<User[]> {
        return this.getUsuariosPaginados(filters).pipe(
            map((response: PaginatedUsers) => response.data),
        );
    }

    getUsuarioPorId(id: number): Observable<User> {
        return this.http.get<UserApiResponse>(`${this.apiUrl}/${id}`).pipe(
            map((response: UserApiResponse) => this.getSingleResponsePayload(response)),
        );
    }

    getUsuariosPaginados(filters: UserFilters = {}): Observable<PaginatedUsers> {
        return this.http
        .get<UsersApiResponse>(this.apiUrl, {
            params: this.buildParams(filters),
        }).pipe(
            map((response: UsersApiResponse) => this.normalizeUsersResponse(response, filters)),
        );
    }

    cambiarEstado(id: number, estado: string): Observable<User> {
        return this.http.patch<UserApiResponse>(`${this.apiUrl}/${id}/estado`, { estado }).pipe(
            map((response: UserApiResponse) => this.getSingleResponsePayload(response)),
        );
    }

    cambiarRol(id: number, rol: string): Observable<User> {
        return this.http.patch<UserApiResponse>(`${this.apiUrl}/${id}/rol`, { rol }).pipe(
            map((response: UserApiResponse) => this.getSingleResponsePayload(response)),
        );
    }

    cambiarClave(id: number, claveActual: string, claveNueva: string): Observable <void> {
        return this.http.patch<void>(`${this.apiUrl}/${id}/clave`, { claveActual, claveNueva});
    }

    private buildParams(filters: UserFilters): HttpParams {
        let params = new HttpParams();

        for (const [key, value] of Object.entries(filters)) {
            const trimmedValue = typeof value === "string" ? value.trim() : value?.toString();
            if (trimmedValue) {
                params = params.set(key, trimmedValue);
            }
        }
        return params.set("_t", Date.now().toString());
    }

    private normalizeUsersResponse(
        response: UsersApiResponse,
        filters: UserFilters,
    ): PaginatedUsers {
        if (
            !Array.isArray(response) &&
            "success" in response &&
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

    private getResponsePayload(response: UsersApiResponse): PaginatedUsers | User [] {
        if (Array.isArray(response)) return response;
        if ("success" in response && "data" in response) return response.data;
        return response;
    }

    private getSingleResponsePayload(response: UserApiResponse): User {
        if ('success' in response && 'data' in response) return response.data;
        return response;
    }

    private toPaginatedResponse(data: User[], filters: UserFilters): PaginatedUsers {
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
        payload: PaginatedUsers,
        filters: UserFilters,
    ): PaginatedUsers {
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