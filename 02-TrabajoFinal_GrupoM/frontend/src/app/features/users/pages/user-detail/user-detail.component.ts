import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../../../core/services/auth.service";
import { UsersService } from "../../services/users.service";
import { User } from "../../models/user.model";

@Component({
    selector: "app-user-detail",
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: "./user-detail.component.html",
})

export class UserDetailComponent implements OnInit {
    usuario = signal<User | null>(null);
    loading = signal(true);
    error = signal("");
    mensaje = "";
    errorAction = "";
    cambiando = false;

    clave = { actual: "", nueva: "", confirmar: ""};
    cambiandoClave = false;
    mensajeClave = "";
    errorClave = "";
    esMiUsuario = false;

    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly route: ActivatedRoute,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.cargar();
    }

    esAdmin(): boolean {
        return this.authService.esAdmin();
    }

    cambiarEstado(nuevoEstado: string): void {
        const usuario = this.usuario();
        if (!usuario || usuario.estado === nuevoEstado) return;

        this.cambiando = true;
        this.usersService.cambiarEstado(usuario.id, nuevoEstado).subscribe({
            next: (cambiado: User) => {
                this.usuario.set(cambiado);
                this.mensaje = `Estado cambiado a "${nuevoEstado}"`;
                this.errorAction = "";
                this.cambiando = false;
            },
            error: () => {
                this.errorAction = "No se pudo cambiar el estado";
                this.cambiando = false;
            },
        });
    }

    cambiarRol(nuevoRol: string): void {
        const usuario = this.usuario();
        if (!usuario || usuario.rol === nuevoRol) return;

        this.cambiando = true;
        this.usersService.cambiarRol(usuario.id, nuevoRol).subscribe({
            next: (cambiado: User) => {
                this.usuario.set(cambiado);
                this.mensaje = `Rol cambiado a "${nuevoRol}"`;
                this.errorAction = "";
                this.cambiando = false;
            },
            error: () => {
                this.errorAction = "No se puedo cambiar el rol";
                this.cambiando = false;
            },
        });
    }

    guardarClave(): void {
        this.errorClave = "";
        this.mensajeClave = "";

        if (!this.clave.actual) {
            this.errorClave = "Ingresa tu contraseña actual";
            return;
        }

        if (!this.clave.nueva || this.clave.nueva.length < 6) {
            this.errorClave = "La contraseña debe tener entre 6 o más caracteres";
            return;
        }

        if (this.clave.nueva !== this.clave.confirmar) {
            this.errorClave = "Las claves nuevas no coinciden";
            return;
        }

        this.cambiandoClave = true;
        const id = this.usuario()!.id;

        this.usersService.cambiarClave(id, this.clave.actual, this.clave.nueva).subscribe({
            next: () => {
                this.mensajeClave = "Contraseña cambiada exitosamente";
                this.clave = { actual: "", nueva: "", confirmar: "" };
                this.cambiandoClave = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.errorClave = err.error?.message || "No se puedo cambiar la contrseña";
                this.cambiandoClave = false;
                this.cdr.detectChanges();
            },
        });
    }

    private cargar(): void {
        const id = Number(this.route.snapshot.paramMap.get("id"));

        if (!id) {
            this.error.set("No se encontró el usuario");
            this.loading.set(false);
            return;
        }

        this.usersService.getUsuarioPorId(id).subscribe({
            next: (data: User) => {
                this.usuario.set(data);
                this.esMiUsuario = data.nombre === this.authService.obtenerNombre();
                this.loading.set(false);

            },
            error: () => {
                this.error.set("No se puedo cargar la información de usuario");
                this.loading.set(false);
            },
        });
    }
}