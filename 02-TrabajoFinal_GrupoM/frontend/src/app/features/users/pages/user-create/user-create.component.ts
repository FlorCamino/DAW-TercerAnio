import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { UserRole } from "../../models/user.model";
import { UsersService } from "../../services/users.service";

type AlertType = "info" | "error";

interface UserAlert {
    title: string;
    message: string;
    type: AlertType;
    confirmText: string;
    onClose?: () => void;
}

@Component({
    selector: "app-user-create",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: "./user-create.component.html",
})
export class UserCreateComponent {
    usuario = {
        nombre: "",
        clave: "",
        rol: "usuario" as UserRole,
    };

    alerta: UserAlert | null = null;
    guardando = false;

    constructor(
        private readonly usersService: UsersService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef,
    ) { }

    guardar(): void {
        this.cerrarAlerta();

        if (!this.usuario.nombre.trim()) {
            this.mostrarError("Nombre obligatorio", "El nombre de usuario es obligatorio.");
            return;
        }

        if (!this.usuario.clave || this.usuario.clave.length < 6) {
            this.mostrarError("Contraseña inválida", "La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        this.guardando = true;

        this.usersService.crearUsuario(this.usuario).subscribe({
            next: () => {
                this.guardando = false;
                this.alerta = {
                    title: "Usuario creado",
                    message: `Usuario "${this.usuario.nombre}" creado correctamente.`,
                    type: "info",
                    confirmText: "Salir",
                    onClose: () => this.router.navigate(["/usuarios"]),
                };
                this.cdr.detectChanges();
            },
            error: (err: HttpErrorResponse) => {
                this.guardando = false;
                this.mostrarError("No se pudo crear", this.obtenerMensajeError(err, "No se pudo crear el usuario."));
                this.cdr.detectChanges();
            },
        });
    }

    cerrarAlerta(): void {
        const onClose = this.alerta?.onClose;
        this.alerta = null;

        if (onClose) {
            onClose();
        }
    }

    private mostrarError(title: string, message: string): void {
        this.alerta = {
            title,
            message,
            type: "error",
            confirmText: "Salir",
        };
    }

    private obtenerMensajeError(error: HttpErrorResponse, mensajePorDefecto: string): string {
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

        return mensajePorDefecto;
    }
}
