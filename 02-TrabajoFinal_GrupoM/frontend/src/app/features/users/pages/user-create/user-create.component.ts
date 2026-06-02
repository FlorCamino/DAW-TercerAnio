import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { UsersService } from "../../services/users.service";
import { UserRole } from "../../models/user.model";

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

    error = "";
    success = "";
    guardando = false;

    constructor(
        private readonly usersService: UsersService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    guardar(): void {
        this.error = "";
        this.success = "";

        if(!this.usuario.nombre.trim()) {
            this.error = "El nombre de usuario es obligatorio";
            return;
        }

        if (!this.usuario.clave || this.usuario.clave.length < 6) {
            this.error = "La clave debe tener entre 6 o más caracteres";
            return;
        }

        this.guardando = true;

        this.usersService.crearUsuario(this.usuario).subscribe({
            next: () => {
                this.guardando = false;
                this.success = "Usuario creado exitosamente";
                this.cdr.detectChanges();

                setTimeout(() => {
                    this.router.navigate(["/usuarios"]);
                }, 2000);
            },
            error: (err: HttpErrorResponse) => {
                this.guardando = false;
                this.error = err.error?.message || "No se puedo crear el usuario";
                this.cdr.detectChanges();
            },
        });
    }
}
