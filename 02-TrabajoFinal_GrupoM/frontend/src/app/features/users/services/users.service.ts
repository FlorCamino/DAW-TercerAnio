import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "../../../../environments/environment";
import { User, UserFilters, PaginatedUsers, UserFormData, UserRole, UserStatus } from "../models/user.model";

interface ApiResponse<T> {
    success: boolean;
    data: T
}

interface ApiUser {
    id: number;
    name: string;
    status: UserStatus;
    role: UserRole;
}

interface ApiPaginatedUsers {
    data: ApiUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

type UsersApiResponse = ApiResponse<ApiPaginatedUsers | ApiUser[]> | ApiPaginatedUsers | ApiUser[];
type UserApiResponse = ApiResponse<ApiUser> | ApiUser;

interface UpdateUserPayload {
    rol?: string;
    estado?: string;
    clave?: string;
}

interface ApiUpdateUserPayload {
    role?: string;
    status?: string;
    password?: string;
}

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
            map((response: UserApiResponse) => this.toUser(this.getSingleResponsePayload(response))),
        );
    }

    getUsuariosPaginados(filters: UserFilters = {}): Observable<PaginatedUsers> {
        const normalizedFilters = this.withDefaultPagination(filters);

        return this.http
            .get<UsersApiResponse>(this.apiUrl, {
                params: this.buildParams(this.toApiFilters(normalizedFilters)),
            }).pipe(
                map((response: UsersApiResponse) => this.normalizeUsersResponse(response, normalizedFilters)),
            );
    }

    crearUsuario(usuario: UserFormData): Observable<User> {
        return this.http.post<UserApiResponse>(this.apiUrl, this.toApiCreatePayload(usuario)).pipe(
            map((response: UserApiResponse) => this.toUser(this.getSingleResponsePayload(response))),
        );
    }

    actualizarUsuario(id: number, payload: UpdateUserPayload): Observable<User> {
        return this.http.patch<ApiResponse<ApiUser>>(
            `${this.apiUrl}/${id}`,
            this.toApiUpdatePayload(payload),
        ).pipe(
            map((response) => this.toUser(response.data)),
        );
    }

    cambiarEstado(id: number, estado: string): Observable<User> {
        return this.actualizarUsuario(id, { estado });
    }

    private withDefaultPagination(filters: UserFilters): UserFilters {
        return {
            ...filters,
            page: filters.page ?? 1,
            limit: filters.limit ?? 6,
        };
    }

    private buildParams(filters: Record<string, string | number | undefined>): HttpParams {
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

    private getResponsePayload(response: UsersApiResponse): ApiPaginatedUsers | ApiUser[] {
        if (Array.isArray(response)) return response;
        if ("success" in response && "data" in response) return response.data;
        return response;
    }

    private getSingleResponsePayload(response: UserApiResponse): ApiUser {
        if ('success' in response && 'data' in response) return response.data;
        return response;
    }

    private toPaginatedResponse(data: ApiUser[], filters: UserFilters): PaginatedUsers {
        const limit = filters.limit ?? data.length;
        return {
            data: data.map((user) => this.toUser(user)),
            total: data.length,
            page: filters.page ?? 1,
            limit,
            totalPages: data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0,
        };
    }

    private toPaginatedResponseFromPayload(
        payload: ApiPaginatedUsers,
        filters: UserFilters,
    ): PaginatedUsers {
        const data = Array.isArray(payload.data) ? payload.data : [];
        const limit = payload.limit ?? filters.limit ?? data.length;
        return {
            data: data.map((user) => this.toUser(user)),
            total: payload.total ?? data.length,
            page: payload.page ?? filters.page ?? 1,
            limit,
            totalPages:
                payload.totalPages ??
                (data.length > 0 && limit > 0 ? Math.ceil(data.length / limit) : 0),
        };
    }

    private toUser(user: ApiUser): User {
        return {
            id: user.id,
            nombre: user.name,
            estado: user.status,
            rol: user.role,
        };
    }

    private toApiFilters(filters: UserFilters): Record<string, string | number | undefined> {
        return {
            status: filters.estado,
            name: filters.nombre,
            role: filters.rol,
            page: filters.page,
            limit: filters.limit,
        };
    }

    private toApiCreatePayload(usuario: UserFormData): {
        name: string;
        password?: string;
        role?: UserRole;
    } {
        return {
            name: usuario.nombre,
            password: usuario.clave,
            role: usuario.rol,
        };
    }

    private toApiUpdatePayload(payload: UpdateUserPayload): ApiUpdateUserPayload {
        return {
            role: payload.rol,
            status: payload.estado,
            password: payload.clave,
        };
    }
}
