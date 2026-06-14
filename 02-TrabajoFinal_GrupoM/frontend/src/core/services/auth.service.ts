import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, finalize, map, tap } from "rxjs";
import { AuthResponseDto, LoginDto } from "../models/auth.models";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/auth`;

    login(credenciales: LoginDto): Observable<AuthResponseDto> {
        return this.http
            .post<AuthResponseDto | { data: AuthResponseDto }>(`${this.apiUrl}/login`, credenciales)
            .pipe(
                map((respuesta) => this.getAuthPayload(respuesta)),
                tap((respuesta) => {
                    if (respuesta?.accessToken) {
                        localStorage.setItem("token_session", respuesta.accessToken);
                        localStorage.setItem("user_rol", respuesta.role ?? "usuario");
                        localStorage.setItem("user_nombre", respuesta.name ?? "");
                    }
                }),
            );
    }

    logout(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/logout`).pipe(
            finalize(() => this.clearSession()),
        );
    }

    clearSession(): void {
        localStorage.removeItem("token_session");
        localStorage.removeItem("user_rol");
        localStorage.removeItem("user_nombre");
    }

    obtenerToken(): string | null {
        return localStorage.getItem("token_session");
    }

    estaLogueado(): boolean {
        return !!this.obtenerToken();
    }

    obtenerRol(): string | null {
        return localStorage.getItem("user_rol");
    }

    esAdmin(): boolean {
        return this.obtenerRol() === "administrador";
    }

    obtenerNombre(): string | null {
        return localStorage.getItem("user_nombre");
    }

    private getAuthPayload(response: AuthResponseDto | { data: AuthResponseDto }): AuthResponseDto {
        if ("data" in response) {
            return response.data;
        }

        return response;
    }
}