import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../../services/clients.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css',
})
export class ClientesListComponent implements OnInit {
  listaClientes: any[] = [];
  searchTerm = '';
  nuevoCliente: any = { id: null, nombre: '', email: '', telefono: '' };
  editando = false;

  constructor(private api: ClientsService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.api.getClientes().subscribe((data) => this.listaClientes = data);
  }

  get clientesFiltrados(): any[] {
    const term = this.searchTerm.toLowerCase();

    return this.listaClientes.filter((cliente) =>
      (cliente.nombre ?? '').toLowerCase().includes(term) ||
      (cliente.email ?? '').toLowerCase().includes(term)
    );
  }

  guardar(): void {
    this.api.crearCliente(this.nuevoCliente).subscribe(() => {
      this.cargar();
      this.limpiar();
    });
  }

  editar(cliente: any): void {
    this.nuevoCliente = { ...cliente };
    this.editando = true;
  }

  eliminar(id: number): void {
    if (confirm('Desea dar de baja a este cliente?')) {
      this.api.cambiarEstado(id).subscribe(() => this.cargar());
    }
  }

  limpiar(): void {
    this.nuevoCliente = { id: null, nombre: '', email: '', telefono: '' };
    this.editando = false;
  }
}
