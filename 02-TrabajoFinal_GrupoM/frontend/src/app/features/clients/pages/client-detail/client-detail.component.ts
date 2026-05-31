import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Client, ClientProjectSummary } from '../../models/client.model';
import { ClientsService } from '../../services/clients.service';

@Component({
    selector: 'app-client-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './client-detail.component.html'
})
export class ClientDetailComponent implements OnInit {
    cliente = signal<Client | null>(null);
    loading = signal(true);
    error = signal('');

    constructor(
        private readonly clientsService: ClientsService,
        private readonly route: ActivatedRoute,
    ) { }

    ngOnInit(): void {
        this.loadClient();
    }

    get proyectosAsociados(): ClientProjectSummary[] {
        return this.cliente()?.proyectos ?? [];
    }

    private loadClient(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (!id) {
            this.error.set('No se encontró el cliente solicitado.');
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.error.set('');

        this.clientsService.getClientePorId(id).subscribe({
            next: (data: Client) => {
                this.cliente.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.cliente.set(null);
                this.error.set('No se pudo cargar la información del cliente.');
                this.loading.set(false);
            },
        });
    }

    estaDeBaja(estado: string): boolean {
        return String(estado ?? '').toLowerCase() === 'baja';
    }

    obtenerEstado(estado: string): string {
        return this.estaDeBaja(estado) ? 'Baja' : 'Activo';
    }

    obtenerEstadoProyecto(estado: string): string {
        const estadoNormalizado = String(estado ?? '').toLowerCase();

        if (estadoNormalizado === 'active' || estadoNormalizado === 'activo') {
            return 'Activo';
        }

        if (estadoNormalizado === 'finished' || estadoNormalizado === 'finalizado') {
            return 'Finalizado';
        }

        if (estadoNormalizado === 'baja' || estadoNormalizado === 'inactive') {
            return 'Baja';
        }

        return estado || 'Sin estado';
    }

    esProyectoFinalizado(estado: string): boolean {
        const estadoNormalizado = String(estado ?? '').toLowerCase();

        return estadoNormalizado === 'finished' || estadoNormalizado === 'finalizado';
    }

    esProyectoBaja(estado: string): boolean {
        const estadoNormalizado = String(estado ?? '').toLowerCase();

        return estadoNormalizado === 'baja' || estadoNormalizado === 'inactive';
    }
}
