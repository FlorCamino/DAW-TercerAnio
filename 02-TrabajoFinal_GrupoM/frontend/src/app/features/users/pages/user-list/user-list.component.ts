import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
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

type AlertType = 'info' | 'error' | 'confirm';

interface UserAlert {
    title: string;
    message: string;
    type: AlertType;
    confirmText: string;
    cancelText?: string;
    confirmDanger?: boolean;
    onConfirm?: () => void;
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
    rolDropdownAbierto = false;
    editando = false;
    guardando = false;

    alerta: UserAlert | null = null;
    cambiandoEstadoId: number | null = null;

    filtros: UserFilters = {
        estado: '',
        nombre: '',
        rol: '',
    };

    usuarioEditado: UserEditForm = this.crearUsuarioEditadoVacio();
    usuarioOriginal: UserEditForm = this.crearUsuarioEditadoVacio();

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
        this.rolDropdownAbierto = false;
        this.paginaActual = 1;
        this.cargar();
    }

    seleccionarRol(rol: string): void {
        this.filtros.rol = rol;
        this.estadoDropdownAbierto = false;
        this.rolDropdownAbierto = false;
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
            rol: '',
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

        if (rol === '') {
            return 'Todos los roles';
        }

        return 'Usuario';
    }

    editar(usuario: User): void {
        if (!this.esAdmin()) {
            return;
        }

        if (usuario.estado === 'baja') {
            this.mostrarError('No se puede editar', 'No se puede editar un usuario en estado baja.');
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
        this.usuarioOriginal = { ...this.usuarioEditado };

        this.editando = true;
        this.cerrarAlerta();
        this.cdr.detectChanges();

        setTimeout(() => {
            document.querySelector('.management-edit-card')?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        });
    }

    guardar(): void {
        if (!this.formularioEdicionValido || !this.hayCambiosEdicion) {
            return;
        }

        if (!this.usuarioEditado.id) {
            this.mostrarError('Usuario no seleccionado', 'No se encontró el usuario seleccionado.');
            return;
        }

        if (this.usuarioEditado.clave || this.usuarioEditado.confirmarClave) {
            if (this.usuarioEditado.clave !== this.usuarioEditado.confirmarClave) {
                this.mostrarError('Claves inválidas', 'Las claves ingresadas no coinciden.');
                return;
            }

            if (this.usuarioEditado.clave.length < 6) {
                this.mostrarError('Clave demasiado corta', 'La nueva clave debe tener al menos 6 caracteres.');
                return;
            }
        }

        this.guardando = true;
        this.cerrarAlerta();

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

                this.mostrarInfo(
                    'Usuario actualizado',
                    `Usuario "${usuarioActualizado.nombre}" actualizado correctamente.`,
                );
                this.guardando = false;
                this.limpiar();
                this.cdr.detectChanges();
            },
            error: (error: HttpErrorResponse) => {
                this.mostrarError(
                    'No se pudo actualizar',
                    this.obtenerMensajeError(error, 'No se pudo actualizar el usuario.'),
                );
                this.guardando = false;
                this.cdr.detectChanges();
            },
        });
    }

    limpiar(): void {
        this.usuarioEditado = this.crearUsuarioEditadoVacio();
        this.usuarioOriginal = this.crearUsuarioEditadoVacio();
        this.editando = false;
        this.guardando = false;
        this.cdr.detectChanges();
    }

    get formularioEdicionValido(): boolean {
        if (!this.usuarioEditado.id) {
            return false;
        }

        if (this.usuarioEditado.clave || this.usuarioEditado.confirmarClave) {
            return (
                this.usuarioEditado.clave === this.usuarioEditado.confirmarClave &&
                this.usuarioEditado.clave.length >= 6
            );
        }

        return true;
    }

    get hayCambiosEdicion(): boolean {
        return (
            this.usuarioEditado.rol !== this.usuarioOriginal.rol ||
            Boolean(this.usuarioEditado.clave || this.usuarioEditado.confirmarClave)
        );
    }

    cambiarEstado(usuario: User, nuevoEstado: string): void {
        if (!this.esAdmin() || usuario.estado === nuevoEstado) {
            return;
        }

        this.alerta = {
            title: 'Confirmar cambio de estado',
            message: `Esta seguro que desea cambiar el estado de "${usuario.nombre}" a "${this.obtenerTextoEstado(nuevoEstado)}"?`,
            type: 'confirm',
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            confirmDanger: nuevoEstado === 'baja',
            onConfirm: () => this.actualizarEstadoUsuario(usuario, nuevoEstado),
        };
        this.cdr.detectChanges();
    }

    confirmarAlerta(): void {
        if (!this.alerta) {
            return;
        }

        if (this.alerta.type !== 'confirm') {
            this.cerrarAlerta();
            return;
        }

        const onConfirm = this.alerta.onConfirm;
        this.cerrarAlerta();
        onConfirm?.();
    }

    private actualizarEstadoUsuario(usuario: User, nuevoEstado: string): void {
        this.cambiandoEstadoId = usuario.id;

        this.usersService.cambiarEstado(usuario.id, nuevoEstado).subscribe({
            next: (usuarioActualizado: User) => {
                this.listaUsuarios = this.listaUsuarios.map((item) =>
                    item.id === usuarioActualizado.id ? usuarioActualizado : item,
                );

                const titulo = nuevoEstado === 'baja' ? 'Usuario dado de baja' : 'Estado actualizado';
                const mensaje =
                    nuevoEstado === 'baja'
                        ? `Usuario "${usuario.nombre}" dado de baja correctamente.`
                        : `Estado de "${usuario.nombre}" actualizado correctamente.`;

                this.mostrarInfo(titulo, mensaje);
                this.cambiandoEstadoId = null;

                if (this.usuarioEditado.id === usuarioActualizado.id && nuevoEstado === 'baja') {
                    this.limpiar();
                }

                this.cdr.detectChanges();
            },
            error: (error: HttpErrorResponse) => {
                this.mostrarError(
                    'No se pudo cambiar el estado',
                    this.obtenerMensajeError(error, 'No se pudo cambiar el estado del usuario.'),
                );
                this.cambiandoEstadoId = null;
                this.cdr.detectChanges();
            },
        });
    }

    cerrarAlerta(): void {
        this.alerta = null;
    }

    hayFiltrosActivos(): boolean {
        return !!(this.filtros.estado || this.filtros.rol || this.filtros.nombre?.trim());
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
            error: (error: HttpErrorResponse) => {
                this.listaUsuarios = [];
                this.totalUsuarios = 0;
                this.totalPaginas = 0;
                this.mostrarError(
                    'No se pudieron cargar los usuarios',
                    this.obtenerMensajeError(error, 'Intente nuevamente en unos instantes.'),
                );
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

    private mostrarInfo(title: string, message: string): void {
        this.alerta = {
            title,
            message,
            type: 'info',
            confirmText: 'Salir',
        };
    }

    private mostrarError(title: string, message: string): void {
        this.alerta = {
            title,
            message,
            type: 'error',
            confirmText: 'Salir',
        };
    }

    private obtenerMensajeError(error: HttpErrorResponse, mensajePorDefecto: string): string {
        const backendMessage = error.error?.message;

        if (Array.isArray(backendMessage)) {
            return backendMessage.join(' ');
        }

        if (typeof backendMessage === 'string' && backendMessage.trim()) {
            return backendMessage;
        }

        if (typeof error.error === 'string' && error.error.trim()) {
            return error.error;
        }

        return mensajePorDefecto;
    }
}
