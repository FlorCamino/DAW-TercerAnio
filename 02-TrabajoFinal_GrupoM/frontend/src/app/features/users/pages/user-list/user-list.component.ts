import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../../../core/services/auth.service";
import { UsersService } from "../../services/users.service";
import { User, PaginatedUsers, UserFilters } from "../../models/user.model";

@Component({
    selector: "app-user-list",
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: "./user-list.component.html",
})

export class UserListComponent implements OnInit {
    listaUsuarios: User[] = [];
    totalUsuarios = 0;
    paginaActual = 1;
    cantidadPorPagina = 6;
    totalPaginas = 0;
    estadoDropdownAbierto = false;
    mensaje = "";
    error = "";

    filtros: UserFilters = { estado: "", busqueda: "" };

    constructor (
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.cargar();
    }

    esAdmin(): boolean {
        return this.authService.esAdmin();
    }

    seleccionarEstado(estado: string): void {
        this.filtros.estado = estado;
        this.estadoDropdownAbierto = false;
        this.paginaActual = 1;
        this.cargar();
    }

    buscar(): void {
        this.paginaActual = 1;
        this.cargar();
    }

    limpiarFiltros(): void {
        this.filtros = { estado: "", busqueda: "" };
        this.paginaActual = 1;
        this.cargar()
    }

    obtenerTextoEstado(estado: string): string {
        if (estado === "activo") return "Activo";
        if (estado === "baja") return "Baja";
        return "Todos los estados";
    }

    hayFiltrosActivos(): boolean {
        return !!(this.filtros.estado || this.filtros.busqueda?.trim());
    }

    cambiarCantidadPorPagina(): void {
        this.paginaActual = 1;
        this.cargar();
    }

    paginaAnterior(): void {
        if (this.paginaActual > 1) { this.paginaActual--; this.cargar(); }
    }

    paginaSiguiente(): void {
        if (this.paginaActual < this.totalPaginas) { this.paginaActual++; this.cargar(); }
    }

    private cargar(): void {
        this.usersService.getUsuariosPaginados({
            ...this.filtros,
            page: this.paginaActual,
            limit: this.cantidadPorPagina,
        }).subscribe({
            next: (response: PaginatedUsers) => {
                this.listaUsuarios = response.data;
                this.totalUsuarios = response.total;
                this.paginaActual = response.page;
                this.totalPaginas = response.totalPages;
                this.cdr.detectChanges();
            },
            error: () => {
                this.listaUsuarios = [];
                this.cdr.detectChanges();
            },
        });
    }
}