import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private API_URL = 'http://localhost:3000/clients'; 

  constructor(private http: HttpClient) { }

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  crearCliente(cliente: any): Observable<any> {
    if (cliente.id) {
      return this.http.patch(`${this.API_URL}/${cliente.id}`, cliente);
    }
    return this.http.post(this.API_URL, cliente);
  }

  cambiarEstado(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}