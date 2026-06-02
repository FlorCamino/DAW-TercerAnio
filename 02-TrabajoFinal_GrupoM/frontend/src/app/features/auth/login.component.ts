import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { LoginDto } from "../../../core/models/auth.models";

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

    usuariosSeed = [
        {
            label: "micazalazar - Admin",
            nombre: "micazalazar",
            clave: "mica123456"
        },
        {
            label: "usuariotest - Usuario",
            nombre: "usuariotest",
            clave: "usuariotest123"
        }
    ];

    usuarioSeleccionado = "";

    credenciales: LoginDto = {
        nombre: "",
        clave: ""
    };

    errorMessage: string | null = null;
    loading: boolean = false;

    seleccionarUsuario(nombre: string) {
        this.usuarioSeleccionado = nombre;
        const usuario = this.usuariosSeed.find((item) => item.nombre === nombre);

        if (!usuario) {
            this.credenciales = {
                nombre: "",
                clave: ""
            };
            return;
        }

        this.credenciales = {
            nombre: usuario.nombre,
            clave: usuario.clave
        };
        this.errorMessage = null;
    }

    iniciarSesion() {
        if (!this.credenciales.nombre || !this.credenciales.clave) {
            this.errorMessage = "Todos los campos son obligatorios";
            return;
        }

        this.loading = true;
        this.errorMessage = null;

        this.authService.login(this.credenciales).subscribe({
            next: () => {
                this.loading = false;
                this.router.navigate(["/"]);
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = err.error?.message || "Usuario o contraseña inválidas";
            }
        });
    }
}
