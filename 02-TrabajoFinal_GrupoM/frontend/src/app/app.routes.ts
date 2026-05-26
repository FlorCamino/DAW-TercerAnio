import { Routes } from '@angular/router';
import { ClientesListComponent } from './features/clients/components/clientes-list/clientes-list.component';
import { HomeComponent } from './features/home/components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'clientes', component: ClientesListComponent },
  {
    path: 'projects',
    loadComponent: () =>
      import('../features/projects/pages/project-list/project-list.component').then(m => m.ProjectListPageComponent),
  },
  {
    path: 'projects/create',
    loadComponent: () =>
      import('../features/projects/pages/project-create/project-create.component').then(m => m.ProjectCreateComponent),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('../features/projects/pages/project-detail/project-detail.component').then(m => m.ProjectDetailPageComponent),
  },
  {
    path: 'projects/:id/edit',
    loadComponent: () =>
      import('../features/projects/pages/project-edit/project-edit.component').then(m => m.ProjectEditComponent),
  },
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
];

