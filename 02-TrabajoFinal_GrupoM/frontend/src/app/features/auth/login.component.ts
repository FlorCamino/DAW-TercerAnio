import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { LoginDto } from "../../../core/models/auth.models";
import { AuthService } from "../../../core/services/auth.service";

@Component({
    selector: "app-login",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    usuariosSeed = [
        {
            label: "micazalazar - Admin",
            username: "micazalazar",
            password: "mica123456"
        },
        {
            label: "usuariotest - Usuario",
            username: "usuariotest",
            password: "usuariotest123"
        }
    ];

    usuarioSeleccionado = "";

    credenciales: LoginDto = {
        username: "",
        password: ""
    };

    errorMessage: string | null = null;
    loading = false;
    showPassword = false;

    seleccionarUsuario(username: string): void {
        this.usuarioSeleccionado = username;

        const usuario = this.usuariosSeed.find((item) => item.username === username);

        if (!usuario) {
            this.credenciales = {
                username: "",
                password: ""
            };

            this.errorMessage = null;
            this.cdr.detectChanges();
            return;
        }

        this.credenciales = {
            username: usuario.username,
            password: usuario.password
        };

        this.errorMessage = null;
        this.cdr.detectChanges();
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
        this.cdr.detectChanges();
    }

    iniciarSesion(): void {
        if (this.loading) {
            return;
        }

        this.errorMessage = null;

        const username = this.credenciales.username.trim();
        const password = this.credenciales.password.trim();

        if (!username || !password) {
            this.errorMessage = "Todos los campos son obligatorios";
            this.cdr.detectChanges();
            return;
        }

        if (password.length < 6) {
            this.errorMessage = "La contraseña debe tener al menos 6 caracteres";
            this.cdr.detectChanges();
            return;
        }

        this.loading = true;
        this.cdr.detectChanges();

        const loginPayload: LoginDto = {
            username,
            password
        };

        this.authService.login(loginPayload).pipe(
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: () => {
                this.router.navigate(["/"]);
            },
            error: (err: HttpErrorResponse) => {
                this.errorMessage = this.obtenerMensajeError(err);
                this.cdr.detectChanges();
            }
        });
    }

    private obtenerMensajeError(error: HttpErrorResponse): string {
        const backendMessage = error.error?.message;

        if (Array.isArray(backendMessage)) {
            return backendMessage.join(" ");
        }

        if (typeof backendMessage === "string" && backendMessage.trim()) {
            return backendMessage;
        }

        if (typeof error.error === "string" && error.error.trim()) {
            return error.error;
        }

        if (error.status === 401) {
            return "Usuario o contraseña inválidas";
        }

        return "No se pudo iniciar sesión. Intente nuevamente.";
    }
}