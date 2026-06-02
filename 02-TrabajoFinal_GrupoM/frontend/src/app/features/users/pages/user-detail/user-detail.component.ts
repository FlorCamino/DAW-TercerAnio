import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { User } from '../../models/user.model';
import { UsersService } from '../../services/users.service';

@Component({
    selector: 'app-user-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit {
    usuario = signal<User | null>(null);
    loading = signal(true);
    error = signal('');

    constructor(
        private readonly usersService: UsersService,
        private readonly route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.cargar();
    }

    obtenerTextoRol(rol: string): string {
        if (rol === 'administrador') {
            return 'Administrador';
        }

        return 'Usuario';
    }

    obtenerTextoEstado(estado: string): string {
        if (estado === 'baja') {
            return 'Baja';
        }

        return 'Activo';
    }

    private cargar(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (!id) {
            this.error.set('No se encontró el usuario solicitado.');
            this.loading.set(false);
            return;
        }

        this.usersService.getUsuarioPorId(id).subscribe({
            next: (data: User) => {
                this.usuario.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.usuario.set(null);
                this.error.set('No se pudo cargar la información del usuario.');
                this.loading.set(false);
            },
        });
    }
}