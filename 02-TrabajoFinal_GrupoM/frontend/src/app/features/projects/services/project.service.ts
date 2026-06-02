import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, ProjectListResponse } from '../models/project.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getAll(filters: { estado?: string; nombre?: string; clientId?: number | string | null; page?: number; limit?: number } = {}): Observable<Project[]> {
    return this.http.get<{ success: boolean; data: ProjectListResponse }>(this.apiUrl, {
      params: this.buildParams(filters),
    }).pipe(
      map(res => res.data.data)
    );
  }

  getOne(id: number): Observable<Project> {
    return this.http.get<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  create(payload: { name: string; clientId?: number | null; endDate?: string | null }): Observable<Project> {
    return this.http.post<{ success: boolean; data: Project }>(this.apiUrl, payload).pipe(
      map(res => res.data)
    );
  }

  update(
    id: number,
    payload: { name?: string; status?: string; clientId?: number | null; endDate?: string | null },
  ): Observable<Project> {
    return this.http.patch<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  remove(id: number): Observable<Project> {
    return this.http.delete<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  private buildParams(filters: { estado?: string; nombre?: string; clientId?: number | string | null; page?: number; limit?: number }): HttpParams {
    let params = new HttpParams()
      .set('page', (filters.page ?? 1).toString())
      .set('limit', (filters.limit ?? 6).toString());

    for (const [key, value] of Object.entries(filters)) {
      if (key === 'page' || key === 'limit') continue;

      const trimmedValue = typeof value === 'string' ? value.trim() : value?.toString();
      if (trimmedValue) {
        params = params.set(key, trimmedValue);
      }
    }

    return params.set('_t', Date.now().toString());
  }
}
