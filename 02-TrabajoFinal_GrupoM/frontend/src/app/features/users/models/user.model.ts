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
    nombre?: string;
    rol?: string;
    page?: number;
    limit?: number;
}

export interface UserFormData {
    id?: number | null;
    nombre: string;
    clave?: string;
    estado?: UserStatus;
    rol?: UserRole;
}

export interface PaginatedUsers {
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
