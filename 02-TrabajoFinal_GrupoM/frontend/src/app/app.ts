import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

interface ApiInfoResponse {
  success: boolean;
  data?: {
    message?: string;
    version?: string;
    timestamp?: string;
  };
  message?: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly apiUrl = environment.apiUrl;
  protected readonly apiStatus = signal<'checking' | 'online' | 'offline'>('checking');
  protected readonly apiMessage = signal('Comprobando conexion con el backend...');

  ngOnInit(): void {
    this.http.get<ApiInfoResponse>(this.apiUrl).subscribe({
      next: (response) => {
        this.apiStatus.set('online');
        this.apiMessage.set(response.data?.message ?? response.message ?? 'Backend disponible');
      },
      error: () => {
        this.apiStatus.set('offline');
        this.apiMessage.set('No se pudo conectar con el backend. Revisa que Nest este levantado en el puerto 3000.');
      },
    });
  }
}
