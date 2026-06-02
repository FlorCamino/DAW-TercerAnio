import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import { User, UserFilters, PaginatedUsers, UserFormData } from "../models/user.model";

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
        const normalizedFilters = this.withDefaultPagination(filters);

        return this.http
            .get<UsersApiResponse>(this.apiUrl, {
                params: this.buildParams(normalizedFilters),
            }).pipe(
                map((response: UsersApiResponse) => this.normalizeUsersResponse(response, normalizedFilters)),
            );
    }

    crearUsuario(usuario: UserFormData): Observable<User> {
        const { id, estado, ...nuevoUsuario } = usuario;
        return this.http.post<UserApiResponse>(this.apiUrl, nuevoUsuario).pipe(
            map((response: UserApiResponse) => this.getSingleResponsePayload(response)),
        );
    }

    actualizarUsuario(
        id: number,
        payload: {
            rol?: string;
            estado?: string;
            clave?: string;
        },
    ): Observable<User> {
        return this.http.patch<{ success: boolean; data: User }>(
            `${this.apiUrl}/${id}`,
            payload,
        ).pipe(
            map((response) => response.data),
        );
    }

    cambiarEstado(id: number, estado: string): Observable<User> {
        return this.actualizarUsuario(id, { estado });
    }

    cambiarRol(id: number, rol: string): Observable<User> {
        return this.actualizarUsuario(id, { rol: rol as UserFormData["rol"] });
    }

    cambiarClave(id: number, _claveActual: string, claveNueva: string): Observable<User> {
        return this.actualizarUsuario(id, { clave: claveNueva });
    }

    private withDefaultPagination(filters: UserFilters): UserFilters {
        return {
            ...filters,
            page: filters.page ?? 1,
            limit: filters.limit ?? 6,
        };
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

    private getResponsePayload(response: UsersApiResponse): PaginatedUsers | User[] {
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
