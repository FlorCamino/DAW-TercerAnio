import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private readonly apiUrl = 'http://localhost:3000/api/clients';

  constructor(private http: HttpClient) { }

 getClientes(): Observable<any[]> {
  return this.http.get<any>(this.apiUrl).pipe(
    map((response: any) => {
      return response.data;
    })
  );
}

  crearCliente(cliente: any): Observable<any> {
    if (cliente.id) {
      return this.http.patch(`${this.apiUrl}/${cliente.id}`, cliente);
    }
    return this.http.post(this.apiUrl, cliente);
  }

  cambiarEstado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
