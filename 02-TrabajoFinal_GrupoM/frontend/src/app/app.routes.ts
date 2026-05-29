import { Routes } from '@angular/router';
import { ClienteCreateComponent } from './features/clients/components/cliente-create/cliente-create.component';
import { ClientesListComponent } from './features/clients/components/clientes-list/clientes-list.component';
import { HomeComponent } from './features/home/components/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'clientes',
    component: ClientesListComponent,
  },
  {
    path: 'clientes/crear',
    component: ClienteCreateComponent,
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
    path: 'projects/:id/edit',
    loadComponent: () =>
      import('./features/projects/pages/project-edit/project-edit.component').then(
        (m) => m.ProjectEditComponent,
      ),
  },
];
