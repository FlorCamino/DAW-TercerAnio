import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../../services/clients.service';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-list.component.html'
})
export class ClientesListComponent implements OnInit {
  listaClientes: any[] = [];
  searchTerm: string = '';
  nuevoCliente: any = { id: null, nombre: '', email: '', telefono: '' };
  editando = false;

  constructor(private api: ClientsService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.getClientes().subscribe(data => this.listaClientes = data);
  }

  get clientesFiltrados() {
    return this.listaClientes.filter(c => 
      c.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  guardar() {
    this.api.crearCliente(this.nuevoCliente).subscribe(() => {
      this.cargar();
      this.limpiar();
    });
  }

  editar(c: any) {
    this.nuevoCliente = { ...c };
    this.editando = true;
  }

  eliminar(id: number) {
    if(confirm('¿Desea dar de baja a este cliente?')) {
      this.api.cambiarEstado(id).subscribe(() => this.cargar());
    }
  }

  limpiar() {
    this.nuevoCliente = { id: null, nombre: '', email: '', telefono: '' };
    this.editando = false;
  }
}