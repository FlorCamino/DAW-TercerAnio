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

    login(credenciales: LoginDto): Observable<AuthResponseDto> {
        return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, credenciales).pipe(
            tap(respuesta => {
                if (respuesta && respuesta.accessToken) {
                    localStorage.setItem("token_session", respuesta.accessToken);
                }
            })
        );
    }

    logout(): Observable<any> {
        return this.http.delete(`${this.apiUrl}/logout`).pipe(
            tap(() => {
                localStorage.removeItem("token_session");
            })
        );
    }

    obtenerToken(): string | null {
        return localStorage.getItem("token_session");
    }

    estaLogueado(): boolean {
        return !!localStorage.getItem("token_session");
    }
}