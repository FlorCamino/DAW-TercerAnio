import { Routes } from '@angular/router';

import { ClientCreateComponent } from './features/clients/pages/client-create/client-create.component';
import { ClientDetailComponent } from './features/clients/pages/client-detail/client-detail.component';
import { ClientListComponent } from './features/clients/pages/client-list/client-list.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'clientes',
    component: ClientListComponent,
  },
  {
    path: 'clientes/crear',
    component: ClientCreateComponent,
  },
  {
    path: 'clientes/:id',
    component: ClientDetailComponent,
  },
  {
    path: 'clients/create',
    redirectTo: 'clientes/crear',
    pathMatch: 'full',
  },
  {
    path: 'clientes/create',
    redirectTo: 'clientes/crear',
    pathMatch: 'full',
  },
  {
    path: 'tareas',
    loadComponent: () =>
      import('./features/tasks/pages/task-list/task-list.component').then(
        (m) => m.TaskListComponent,
      ),
  },
  {
    path: 'tareas/crear',
    loadComponent: () =>
      import('./features/tasks/pages/task-create/task-create.component').then(
        (m) => m.TaskCreateComponent,
      ),
  },
  {
    path: 'tareas/:id',
    loadComponent: () =>
      import('./features/tasks/pages/task-detail/task-detail.component').then(
        (m) => m.TaskDetailComponent,
      ),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/pages/project-list/project-list.component').then(
        (m) => m.ProjectListComponent,
      ),
  },
  {
    path: 'projects/create',
    loadComponent: () =>
      import('./features/projects/pages/project-create/project-create.component').then(
        (m) => m.ProjectCreateComponent,
      ),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./features/projects/pages/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent,
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];
