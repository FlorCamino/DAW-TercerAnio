import { Routes } from '@angular/router';
import { ClientesListComponent } from './features/clients/components/clientes-list/clientes-list.component';
import { HomeComponent } from './features/home/components/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'clientes', component: ClientesListComponent },
];
