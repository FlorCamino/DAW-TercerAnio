import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Project } from '../../../projects/models/project.model';
import { ProjectService } from '../../../projects/services/project.service';
import {
  ClientProjectsReport,
  ClientReportItem,
  ProjectDeadlineReport,
  ProjectReportItem,
  ProjectsByStatusReport,
  ReportsService,
  ReportSummary,
  TaskReportItem,
  TasksByStatusReport,
  UserReportItem,
} from '../../services/reports.service';

type ReportType =
  | 'summary'
  | 'projectsByStatus'
  | 'tasksByStatus'
  | 'projectDeadlines'
  | 'clientsProjects';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  summary: ReportSummary | null = null;
  projectsByStatus: ProjectsByStatusReport | null = null;
  tasksByStatus: TasksByStatusReport | null = null;
  projectDeadlines: ProjectDeadlineReport[] = [];
  clientsProjects: ClientProjectsReport[] = [];
  projects: Project[] = [];

  loading = false;
  error = '';
  selectedReport: ReportType = 'summary';
  selectedProjectId: number | null = null;

  constructor(
    private readonly reportsService: ReportsService,
    private readonly projectService: ProjectService,
  ) { }

  ngOnInit(): void {
    this.loadSelectedReport();
    this.loadProjects();
  }

  loadReports(): void {
    this.loadSelectedReport();
  }

  loadSelectedReport(): void {
    this.loading = true;
    this.error = '';

    switch (this.selectedReport) {
      case 'summary':
        this.loadSummary();
        break;
      case 'projectsByStatus':
        this.loadProjectsByStatus();
        break;
      case 'tasksByStatus':
        this.loadTasksByStatus();
        break;
      case 'projectDeadlines':
        this.loadProjectDeadlines();
        break;
      case 'clientsProjects':
        this.loadClientsProjects();
        break;
    }
  }

  loadTasksByStatus(): void {
    this.loading = true;
    this.error = '';

    this.reportsService.getTasksByStatus(this.selectedProjectId).pipe(
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: (tasksByStatus) => {
        this.tasksByStatus = tasksByStatus;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el reporte de tareas por estado.';
      },
    });
  }

  onProjectFilterChange(projectId: string): void {
    this.selectedProjectId = projectId ? Number(projectId) : null;
    this.loadTasksByStatus();
  }

  onReportChange(): void {
    this.loadSelectedReport();
  }

  printPdf(): void {
    const printWindow = window.open('', '_blank', 'width=1100,height=800');

    if (!printWindow) {
      this.error = 'No se pudo abrir la ventana de impresion.';
      return;
    }

    printWindow.document.write(this.buildPrintableHtml());
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  exportCsv(): void {
    const rows = this.buildCsvRows();
    const csvContent = rows
      .map((row) => row.map((value) => this.escapeCsvValue(value)).join(','))
      .join('\n');
    const blob = new Blob([`\ufeff${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${this.toFileName(this.reportTitle)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  get reportTitle(): string {
    const titles: Record<ReportType, string> = {
      summary: 'Resumen general',
      projectsByStatus: 'Proyectos por estado',
      tasksByStatus: 'Tareas por estado',
      projectDeadlines: 'Proyectos vencidos o proximos a finalizar',
      clientsProjects: 'Clientes con proyectos asociados',
    };

    return titles[this.selectedReport];
  }

  formatSituation(situation: ProjectDeadlineReport['situation']): string {
    return situation === 'vencido' ? 'Vencido' : 'Proximo a vencer';
  }

  projectDetail(project: ProjectReportItem): string {
    const client = project.client ? `Cliente: ${project.client}` : 'Sin cliente';
    const endDate = project.endDate ? `Finalizacion: ${project.endDate}` : 'Sin fecha de finalizacion';

    return `${project.name} - ${client} - ${endDate}`;
  }

  taskDetail(task: TaskReportItem): string {
    const project = task.project ? `Proyecto: ${task.project}` : 'Sin proyecto';

    return `${task.description} - ${project}`;
  }

  clientDetail(client: ClientReportItem): string {
    const email = client.email ? `Email: ${client.email}` : 'Sin email';
    const phone = client.phone ? `Telefono: ${client.phone}` : 'Sin telefono';

    return `${client.name} - ${email} - ${phone}`;
  }

  userDetail(user: UserReportItem): string {
    return `${user.name} - Rol: ${user.role} - Estado: ${user.status}`;
  }

  retryLoad(): void {
    this.loadSelectedReport();
  }

  private loadSummary(): void {
    this.reportsService.getSummary().pipe(
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: () => this.handleLoadError(),
    });
  }

  private loadProjectsByStatus(): void {
    this.reportsService.getProjectsByStatus().pipe(
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: (projectsByStatus) => {
        this.projectsByStatus = projectsByStatus;
        this.loading = false;
      },
      error: () => this.handleLoadError(),
    });
  }

  private loadProjectDeadlines(): void {
    this.reportsService.getProjectDeadlines().pipe(
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: (projectDeadlines) => {
        this.projectDeadlines = projectDeadlines;
        this.loading = false;
      },
      error: () => this.handleLoadError(),
    });
  }

  private loadClientsProjects(): void {
    this.reportsService.getClientsProjects().pipe(
      finalize(() => {
        this.loading = false;
      }),
    ).subscribe({
      next: (clientsProjects) => {
        this.clientsProjects = clientsProjects;
        this.loading = false;
      },
      error: () => this.handleLoadError(),
    });
  }

  private loadProjects(): void {
    this.projectService.getAll({ limit: 1000 }).subscribe({
      next: (projects) => {
        this.projects = projects;
      },
      error: () => {
        this.projects = [];
      },
    });
  }

  private handleLoadError(): void {
    this.error = 'No se pudieron cargar los reportes.';
  }

  private buildPrintableHtml(): string {
    const content = this.buildPrintableContent();

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${this.escapeHtml(this.reportTitle)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #12211d; padding: 28px; }
            h1 { margin: 0 0 8px; }
            p { color: #5b7078; margin: 0 0 20px; }
            .details { margin: 8px 0 0 18px; padding: 0; color: #5b7078; font-size: 12px; }
            .details li { margin: 3px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px 12px; border: 1px solid #d9e4df; text-align: left; }
            th { background: #eef6f3; color: #177d63; text-transform: uppercase; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${this.escapeHtml(this.reportTitle)}</h1>
          <p>Generado desde el modulo de reportes.</p>
          ${content}
        </body>
      </html>
    `;
  }

  private buildPrintableContent(): string {
    switch (this.selectedReport) {
      case 'summary':
        return this.buildSummaryCards();
      case 'projectsByStatus':
        return this.buildProjectStatusRows([
          ['Activo', this.projectsByStatus?.active ?? 0, this.projectsByStatus?.details.active ?? []],
          ['Finalizado', this.projectsByStatus?.finished ?? 0, this.projectsByStatus?.details.finished ?? []],
          ['Baja', this.projectsByStatus?.inactive ?? 0, this.projectsByStatus?.details.inactive ?? []],
        ]);
      case 'tasksByStatus':
        return this.buildTaskStatusRows([
          ['Pendiente', this.tasksByStatus?.pending ?? 0, this.tasksByStatus?.details.pending ?? []],
          ['Finalizada', this.tasksByStatus?.finished ?? 0, this.tasksByStatus?.details.finished ?? []],
          ['Baja', this.tasksByStatus?.inactive ?? 0, this.tasksByStatus?.details.inactive ?? []],
        ]);
      case 'projectDeadlines':
        return this.buildDeadlineRows();
      case 'clientsProjects':
        return this.buildClientProjectRows();
    }
  }

  private buildCsvRows(): string[][] {
    switch (this.selectedReport) {
      case 'summary':
        return this.buildSummaryCsvRows();
      case 'projectsByStatus':
        return this.buildProjectStatusCsvRows();
      case 'tasksByStatus':
        return this.buildTaskStatusCsvRows();
      case 'projectDeadlines':
        return this.buildDeadlinesCsvRows();
      case 'clientsProjects':
        return this.buildClientProjectsCsvRows();
    }
  }

  private buildSummaryCsvRows(): string[][] {
    const summaryItems: [string, number, string[]][] = [
      [
        'Total de proyectos',
        this.summary?.totalProjects ?? 0,
        this.summary?.details.totalProjects.map((item) => this.projectDetail(item)) ?? [],
      ],
      [
        'Total de clientes',
        this.summary?.totalClients ?? 0,
        this.summary?.details.totalClients.map((item) => this.clientDetail(item)) ?? [],
      ],
      [
        'Total de tareas',
        this.summary?.totalTasks ?? 0,
        this.summary?.details.totalTasks.map((item) => this.taskDetail(item)) ?? [],
      ],
      [
        'Total de usuarios',
        this.summary?.totalUsers ?? 0,
        this.summary?.details.totalUsers.map((item) => this.userDetail(item)) ?? [],
      ],
      [
        'Proyectos activos',
        this.summary?.activeProjects ?? 0,
        this.summary?.details.activeProjects.map((item) => this.projectDetail(item)) ?? [],
      ],
      [
        'Proyectos finalizados',
        this.summary?.finishedProjects ?? 0,
        this.summary?.details.finishedProjects.map((item) => this.projectDetail(item)) ?? [],
      ],
      [
        'Tareas pendientes',
        this.summary?.pendingTasks ?? 0,
        this.summary?.details.pendingTasks.map((item) => this.taskDetail(item)) ?? [],
      ],
      [
        'Tareas finalizadas',
        this.summary?.finishedTasks ?? 0,
        this.summary?.details.finishedTasks.map((item) => this.taskDetail(item)) ?? [],
      ],
    ];

    return [
      ['Indicador', 'Cantidad', 'Detalle administrativo'],
      ...summaryItems.map(([label, value, details]) => [
        label,
        value.toString(),
        this.joinCsvDetails(details),
      ]),
    ];
  }

  private buildProjectStatusCsvRows(): string[][] {
    return [
      ['Estado', 'Cantidad', 'Detalle'],
      [
        'Activo',
        (this.projectsByStatus?.active ?? 0).toString(),
        this.joinCsvDetails(this.projectsByStatus?.details.active.map((item) => this.projectDetail(item)) ?? []),
      ],
      [
        'Finalizado',
        (this.projectsByStatus?.finished ?? 0).toString(),
        this.joinCsvDetails(this.projectsByStatus?.details.finished.map((item) => this.projectDetail(item)) ?? []),
      ],
      [
        'Baja',
        (this.projectsByStatus?.inactive ?? 0).toString(),
        this.joinCsvDetails(this.projectsByStatus?.details.inactive.map((item) => this.projectDetail(item)) ?? []),
      ],
    ];
  }

  private buildTaskStatusCsvRows(): string[][] {
    return [
      ['Estado', 'Cantidad', 'Detalle'],
      [
        'Pendiente',
        (this.tasksByStatus?.pending ?? 0).toString(),
        this.joinCsvDetails(this.tasksByStatus?.details.pending.map((item) => this.taskDetail(item)) ?? []),
      ],
      [
        'Finalizada',
        (this.tasksByStatus?.finished ?? 0).toString(),
        this.joinCsvDetails(this.tasksByStatus?.details.finished.map((item) => this.taskDetail(item)) ?? []),
      ],
      [
        'Baja',
        (this.tasksByStatus?.inactive ?? 0).toString(),
        this.joinCsvDetails(this.tasksByStatus?.details.inactive.map((item) => this.taskDetail(item)) ?? []),
      ],
    ];
  }

  private buildDeadlinesCsvRows(): string[][] {
    return [
      ['Proyecto', 'Cliente', 'Fecha finalizacion', 'Estado', 'Situacion'],
      ...this.projectDeadlines.map((project) => [
        project.name,
        project.client ?? 'Sin cliente',
        project.endDate,
        project.status,
        this.formatSituation(project.situation),
      ]),
    ];
  }

  private buildClientProjectsCsvRows(): string[][] {
    return [
      ['Cliente', 'Total proyectos', 'Activos', 'Finalizados', 'Detalle'],
      ...this.clientsProjects.map((client) => [
        client.name,
        client.totalProjects.toString(),
        client.activeProjects.toString(),
        client.finishedProjects.toString(),
        this.joinCsvDetails(client.projects.map((project) => this.projectDetail(project))),
      ]),
    ];
  }

  private buildSummaryCards(): string {
    const summaryItems: [string, number, string[]][] = [
      [
        'Total de proyectos',
        this.summary?.totalProjects ?? 0,
        this.summary?.details.totalProjects.map((item) => this.projectDetail(item)) ?? [],
      ],
      [
        'Total de clientes',
        this.summary?.totalClients ?? 0,
        this.summary?.details.totalClients.map((item) => this.clientDetail(item)) ?? [],
      ],
      [
        'Total de tareas',
        this.summary?.totalTasks ?? 0,
        this.summary?.details.totalTasks.map((item) => this.taskDetail(item)) ?? [],
      ],
      [
        'Total de usuarios',
        this.summary?.totalUsers ?? 0,
        this.summary?.details.totalUsers.map((item) => this.userDetail(item)) ?? [],
      ],
      [
        'Proyectos activos',
        this.summary?.activeProjects ?? 0,
        this.summary?.details.activeProjects.map((item) => this.projectDetail(item)) ?? [],
      ],
      [
        'Proyectos finalizados',
        this.summary?.finishedProjects ?? 0,
        this.summary?.details.finishedProjects.map((item) => this.projectDetail(item)) ?? [],
      ],
      [
        'Tareas pendientes',
        this.summary?.pendingTasks ?? 0,
        this.summary?.details.pendingTasks.map((item) => this.taskDetail(item)) ?? [],
      ],
      [
        'Tareas finalizadas',
        this.summary?.finishedTasks ?? 0,
        this.summary?.details.finishedTasks.map((item) => this.taskDetail(item)) ?? [],
      ],
    ];

    return `
      <table>
        <thead>
          <tr><th>Indicador</th><th>Cantidad</th><th>Detalle administrativo</th></tr>
        </thead>
        <tbody>
          ${summaryItems.map(([label, value, details]) => `
            <tr>
              <td>${this.escapeHtml(label)}</td>
              <td>${value}</td>
              <td>${this.buildPrintableList(details)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private buildProjectStatusRows(rows: [string, number, ProjectReportItem[]][]): string {
    return `
      <table>
        <thead><tr><th>Estado</th><th>Cantidad</th><th>Detalle</th></tr></thead>
        <tbody>
          ${rows.map(([label, value, details]) => `
            <tr>
              <td>${this.escapeHtml(label)}</td>
              <td>${value}</td>
              <td>${this.buildPrintableList(details.map((item) => this.projectDetail(item)))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private buildTaskStatusRows(rows: [string, number, TaskReportItem[]][]): string {
    return `
      <table>
        <thead><tr><th>Estado</th><th>Cantidad</th><th>Detalle</th></tr></thead>
        <tbody>
          ${rows.map(([label, value, details]) => `
            <tr>
              <td>${this.escapeHtml(label)}</td>
              <td>${value}</td>
              <td>${this.buildPrintableList(details.map((item) => this.taskDetail(item)))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private buildDeadlineRows(): string {
    return `
      <table>
        <thead>
          <tr><th>Proyecto</th><th>Cliente</th><th>Fecha finalizacion</th><th>Estado</th><th>Situacion</th></tr>
        </thead>
        <tbody>
          ${this.projectDeadlines.map((project) => `
            <tr>
              <td>${this.escapeHtml(project.name)}</td>
              <td>${this.escapeHtml(project.client ?? 'Sin cliente')}</td>
              <td>${this.escapeHtml(project.endDate)}</td>
              <td>${this.escapeHtml(project.status)}</td>
              <td>${this.escapeHtml(this.formatSituation(project.situation))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private buildClientProjectRows(): string {
    return `
      <table>
        <thead>
          <tr><th>Cliente</th><th>Total proyectos</th><th>Activos</th><th>Finalizados</th><th>Detalle</th></tr>
        </thead>
        <tbody>
          ${this.clientsProjects.map((client) => `
            <tr>
              <td>${this.escapeHtml(client.name)}</td>
              <td>${client.totalProjects}</td>
              <td>${client.activeProjects}</td>
              <td>${client.finishedProjects}</td>
              <td>${this.buildPrintableList(client.projects.map((project) => this.projectDetail(project)))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private buildPrintableList(items: string[]): string {
    if (items.length === 0) {
      return '<span>Sin registros</span>';
    }

    return `
      <ul class="details">
        ${items.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('')}
      </ul>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private escapeCsvValue(value: string): string {
    const normalizedValue = value.replace(/\r?\n|\r/g, ' ').trim();

    if (/[",;]/.test(normalizedValue)) {
      return `"${normalizedValue.replace(/"/g, '""')}"`;
    }

    return normalizedValue;
  }

  private joinCsvDetails(items: string[]): string {
    return items.length > 0 ? items.join(' | ') : 'Sin registros';
  }

  private toFileName(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
