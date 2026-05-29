import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project, ProjectListResponse } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly apiUrl = '/api/projects';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Project[]> {
    return this.http.get<{ success: boolean; data: ProjectListResponse }>(this.apiUrl).pipe(
      map(res => res.data.data)
    );
  }

  getOne(id: number): Observable<Project> {
    return this.http.get<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }

  create(payload: { name: string; clientId?: number | null }): Observable<Project> {
    return this.http.post<{ success: boolean; data: Project }>(this.apiUrl, payload).pipe(
      map(res => res.data)
    );
  }

  update(id: number, payload: { name?: string; status?: string; clientId?: number | null }): Observable<Project> {
    return this.http.put<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => res.data)
    );
  }

  remove(id: number): Observable<Project> {
    return this.http.delete<{ success: boolean; data: Project }>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data)
    );
  }
}