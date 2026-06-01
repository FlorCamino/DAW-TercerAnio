import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { LoginDto, AuthResponseDto } from "../models/auth.models";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: "root"
})

export class AuthService {
    private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/auth`;

    login(credenciales: LoginDto): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credenciales).pipe(
            tap(respuesta => {
                const data = respuesta?.data ?? respuesta;
                if (data?.accessToken) {
                    localStorage.setItem("token_session", data.accessToken);
                    localStorage.setItem("user_rol", data.rol ?? "usuario");
                    localStorage.setItem("user_nombre", data.nombre ?? "");
                }
            })
        );
    }

    logout(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/logout`).pipe(
            tap(() => {
                localStorage.removeItem("token_session");
                localStorage.removeItem("user_rol");
                localStorage.removeItem("user_nombre");
            })
        );
    }

    registrar(datos: { nombre: string; clave: string; rol?: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/registrar`, datos);
    }

    obtenerToken(): string | null {
        return localStorage.getItem("token_session");
    }

    estaLogueado(): boolean {
        return !!localStorage.getItem("token_session");
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
}