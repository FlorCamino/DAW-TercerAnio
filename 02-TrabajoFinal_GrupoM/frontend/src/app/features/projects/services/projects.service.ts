import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private readonly apiUrl = `${environment.apiUrl}/projects`;

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any[]> {

    return this.http.get<any>(this.apiUrl).pipe(

      map((response) => {

        console.log('RESPUESTA API:', response);

        if (Array.isArray(response.data)) {
          return response.data;
        }

        return [response.data];
      })
    );
  }

  createProject(project: any): Observable<any> {
    return this.http.post(this.apiUrl, project);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}