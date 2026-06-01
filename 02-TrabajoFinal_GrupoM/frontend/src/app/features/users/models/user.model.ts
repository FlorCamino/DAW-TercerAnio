export type UserStatus = "activo" | "baja";
export type UserRole = "administrador" | "usuario";

export interface User {
    id: number;
    nombre: string;
    estado: UserStatus;
    rol: UserRole;
}

export interface UserFilters {
    estado?: string;
    busqueda?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedUsers {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}