import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ReportSummary {
  totalProjects: number;
  totalClients: number;
  totalTasks: number;
  totalUsers: number;
  activeProjects: number;
  finishedProjects: number;
  pendingTasks: number;
  finishedTasks: number;
  details: {
    totalProjects: ProjectReportItem[];
    totalClients: ClientReportItem[];
    totalTasks: TaskReportItem[];
    totalUsers: UserReportItem[];
    activeProjects: ProjectReportItem[];
    finishedProjects: ProjectReportItem[];
    pendingTasks: TaskReportItem[];
    finishedTasks: TaskReportItem[];
  };
}

export interface ProjectsByStatusReport {
  active: number;
  finished: number;
  inactive: number;
  details: {
    active: ProjectReportItem[];
    finished: ProjectReportItem[];
    inactive: ProjectReportItem[];
  };
}

export interface TasksByStatusReport {
  pending: number;
  finished: number;
  inactive: number;
  details: {
    pending: TaskReportItem[];
    finished: TaskReportItem[];
    inactive: TaskReportItem[];
  };
}

export interface ProjectDeadlineReport {
  id: number;
  name: string;
  client: string | null;
  endDate: string;
  status: string;
  situation: 'vencido' | 'proximo_a_vencer';
  daysToDeadline: number;
  isOverdue: boolean;
  isNearDeadline: boolean;
}

export interface ClientProjectsReport {
  id: number;
  name: string;
  totalProjects: number;
  activeProjects: number;
  finishedProjects: number;
  projects: ProjectReportItem[];
  activeProjectItems: ProjectReportItem[];
  finishedProjectItems: ProjectReportItem[];
}

export interface ProjectReportItem {
  id: number;
  name: string;
  status: string;
  client: string | null;
  endDate: string | null;
}

export interface ClientReportItem {
  id: number;
  name: string;
  status: string;
  email: string | null;
  phone: string | null;
}

export interface TaskReportItem {
  id: number;
  description: string;
  status: string;
  project: string | null;
  projectId: number;
}

export interface UserReportItem {
  id: number;
  name: string;
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly apiUrl = `${environment.apiUrl}/reports`;

  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<ReportSummary> {
    return this.http.get<ApiResponse<ReportSummary>>(`${this.apiUrl}/summary`).pipe(
      map((response) => this.normalizeSummary(response.data)),
    );
  }

  getProjectsByStatus(): Observable<ProjectsByStatusReport> {
    return this.http
      .get<ApiResponse<ProjectsByStatusReport>>(`${this.apiUrl}/projects-by-status`)
      .pipe(map((response) => this.normalizeProjectsByStatus(response.data)));
  }

  getTasksByStatus(projectId?: number | null): Observable<TasksByStatusReport> {
    const params = projectId ? new HttpParams().set('projectId', projectId.toString()) : undefined;

    return this.http
      .get<ApiResponse<TasksByStatusReport>>(`${this.apiUrl}/tasks-by-status`, { params })
      .pipe(map((response) => this.normalizeTasksByStatus(response.data)));
  }

  getProjectDeadlines(): Observable<ProjectDeadlineReport[]> {
    return this.http
      .get<ApiResponse<ProjectDeadlineReport[]>>(`${this.apiUrl}/project-deadlines`)
      .pipe(map((response) => response.data));
  }

  getClientsProjects(): Observable<ClientProjectsReport[]> {
    return this.http
      .get<ApiResponse<ClientProjectsReport[]>>(`${this.apiUrl}/clients-projects`)
      .pipe(map((response) => response.data.map((client) => this.normalizeClientProjects(client))));
  }

  private normalizeSummary(summary: ReportSummary): ReportSummary {
    return {
      ...summary,
      details: {
        totalProjects: summary.details?.totalProjects ?? [],
        totalClients: summary.details?.totalClients ?? [],
        totalTasks: summary.details?.totalTasks ?? [],
        totalUsers: summary.details?.totalUsers ?? [],
        activeProjects: summary.details?.activeProjects ?? [],
        finishedProjects: summary.details?.finishedProjects ?? [],
        pendingTasks: summary.details?.pendingTasks ?? [],
        finishedTasks: summary.details?.finishedTasks ?? [],
      },
    };
  }

  private normalizeProjectsByStatus(report: ProjectsByStatusReport): ProjectsByStatusReport {
    return {
      ...report,
      details: {
        active: report.details?.active ?? [],
        finished: report.details?.finished ?? [],
        inactive: report.details?.inactive ?? [],
      },
    };
  }

  private normalizeTasksByStatus(report: TasksByStatusReport): TasksByStatusReport {
    return {
      ...report,
      details: {
        pending: report.details?.pending ?? [],
        finished: report.details?.finished ?? [],
        inactive: report.details?.inactive ?? [],
      },
    };
  }

  private normalizeClientProjects(client: ClientProjectsReport): ClientProjectsReport {
    return {
      ...client,
      projects: client.projects ?? [],
      activeProjectItems: client.activeProjectItems ?? [],
      finishedProjectItems: client.finishedProjectItems ?? [],
    };
  }
}
