export interface LoginDto {
    username: string;
    password: string;
}

export interface AuthResponseDto {
    accessToken: string;
    role: "administrador" | "usuario";
    name: string;
    expiresAt?: string;
}
