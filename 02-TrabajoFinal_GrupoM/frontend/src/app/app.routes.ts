import { Routes } from '@angular/router';

import { ClientCreateComponent } from './features/clients/pages/client-create/client-create.component';
import { ClientDetailComponent } from './features/clients/pages/client-detail/client-detail.component';
import { ClientListComponent } from './features/clients/pages/client-list/client-list.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: "auth",
    loadComponent: () => import("./layouts/auth-layout/auth-layout.component").then(m => m.AuthLayoutComponent),
    children: [
      {
        path: "login",
        loadComponent: () => import("./features/auth/login.component").then(m => m.LoginComponent),
      },
      { path: "", redirectTo: "login", pathMatch: "full" }
    ]
  },

  {
    path: "",
    canActivate: [authGuard],
    children: [
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
        path: "usuarios",
        loadComponent: () =>
          import("./features/users/pages/user-list/user-list.component").then(m => m.UserListComponent),
      },
      {
        path: "usuarios/crear",
        loadComponent: () =>
          import("./features/users/pages/user-create/user-create.component").then(m => m.UserCreateComponent),
      },
      {
        path: "usuarios/:id",
        loadComponent: () =>
          import("./features/users/pages/user-detail/user-detail.component").then(m => m.UserDetailComponent),
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
