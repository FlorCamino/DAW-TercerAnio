import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../../../core/services/auth.service';
import { PaginatedUsers, User, UserFilters } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

interface UserEditForm {
    id: number | null;
    nombre: string;
    rol: string;
    clave: string;
    confirmarClave: string;
}

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
    listaUsuarios: User[] = [];

    totalUsuarios = 0;
    paginaActual = 1;
    cantidadPorPagina = 6;
    totalPaginas = 0;

    estadoDropdownAbierto = false;
    editando = false;
    guardando = false;

    mensaje = '';
    error = '';
    cambiandoEstadoId: number | null = null;

    filtros: UserFilters = {
        estado: '',
        nombre: '',
    };

    usuarioEditado: UserEditForm = this.crearUsuarioEditadoVacio();

    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
        private readonly cdr: ChangeDetectorRef,
    ) { }

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
        this.filtros = {
            estado: '',
            nombre: '',
        };

        this.paginaActual = 1;
        this.cargar();
    }

    obtenerTextoEstado(estado: string): string {
        if (estado === 'activo') {
            return 'Activo';
        }

        if (estado === 'baja') {
            return 'Baja';
        }

        return 'Todos los estados';
    }

    obtenerTextoRol(rol: string): string {
        if (rol === 'administrador') {
            return 'Administrador';
        }

        return 'Usuario';
    }

    editar(usuario: User): void {
        if (!this.esAdmin()) {
            return;
        }

        if (usuario.estado === 'baja') {
            this.mensaje = '';
            this.error = 'No se puede editar un usuario en estado baja.';
            this.cdr.detectChanges();
            return;
        }

        this.usuarioEditado = {
            id: usuario.id,
            nombre: usuario.nombre,
            rol: usuario.rol,
            clave: '',
            confirmarClave: '',
        };

        this.editando = true;
        this.mensaje = '';
        this.error = '';
        this.cdr.detectChanges();

        setTimeout(() => {
            document.querySelector('.management-edit-card')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        });
    }

    guardar(): void {
        if (!this.usuarioEditado.id) {
            this.error = 'No se encontró el usuario seleccionado.';
            this.mensaje = '';
            return;
        }

        if (this.usuarioEditado.clave || this.usuarioEditado.confirmarClave) {
            if (this.usuarioEditado.clave !== this.usuarioEditado.confirmarClave) {
                this.error = 'Las claves ingresadas no coinciden.';
                this.mensaje = '';
                return;
            }

            if (this.usuarioEditado.clave.length < 6) {
                this.error = 'La nueva clave debe tener al menos 6 caracteres.';
                this.mensaje = '';
                return;
            }
        }

        this.guardando = true;
        this.error = '';
        this.mensaje = '';

        const payload: {
            rol: string;
            clave?: string;
        } = {
            rol: this.usuarioEditado.rol,
        };

        if (this.usuarioEditado.clave.trim()) {
            payload.clave = this.usuarioEditado.clave;
        }

        this.usersService.actualizarUsuario(this.usuarioEditado.id, payload).subscribe({
            next: (usuarioActualizado: User) => {
                this.listaUsuarios = this.listaUsuarios.map((usuario) =>
                    usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario,
                );

                this.mensaje = `Usuario "${usuarioActualizado.nombre}" actualizado correctamente.`;
                this.guardando = false;
                this.limpiar();
                this.cdr.detectChanges();
            },
            error: () => {
                this.error = 'No se pudo actualizar el usuario.';
                this.mensaje = '';
                this.guardando = false;
                this.cdr.detectChanges();
            },
        });
    }

    limpiar(): void {
        this.usuarioEditado = this.crearUsuarioEditadoVacio();
        this.editando = false;
        this.guardando = false;
        this.cdr.detectChanges();
    }

    cambiarEstado(usuario: User, nuevoEstado: string): void {
        if (!this.esAdmin() || usuario.estado === nuevoEstado) {
            return;
        }

        this.cambiandoEstadoId = usuario.id;
        this.mensaje = '';
        this.error = '';

        this.usersService.cambiarEstado(usuario.id, nuevoEstado).subscribe({
            next: (usuarioActualizado: User) => {
                this.listaUsuarios = this.listaUsuarios.map((item) =>
                    item.id === usuarioActualizado.id ? usuarioActualizado : item,
                );

                this.mensaje = `Estado de "${usuario.nombre}" actualizado correctamente.`;
                this.cambiandoEstadoId = null;

                if (this.usuarioEditado.id === usuarioActualizado.id && nuevoEstado === 'baja') {
                    this.limpiar();
                }

                this.cdr.detectChanges();
            },
            error: () => {
                this.error = 'No se pudo cambiar el estado del usuario.';
                this.cambiandoEstadoId = null;
                this.cdr.detectChanges();
            },
        });
    }

    hayFiltrosActivos(): boolean {
        return !!(this.filtros.estado || this.filtros.nombre?.trim());
    }

    cambiarCantidadPorPagina(): void {
        this.paginaActual = 1;
        this.cargar();
    }

    paginaAnterior(): void {
        if (this.paginaActual > 1) {
            this.paginaActual--;
            this.cargar();
        }
    }

    paginaSiguiente(): void {
        if (this.paginaActual < this.totalPaginas) {
            this.paginaActual++;
            this.cargar();
        }
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
                this.totalUsuarios = 0;
                this.totalPaginas = 0;
                this.cdr.detectChanges();
            },
        });
    }

    private crearUsuarioEditadoVacio(): UserEditForm {
        return {
            id: null,
            nombre: '',
            rol: 'usuario',
            clave: '',
            confirmarClave: '',
        };
    }
}