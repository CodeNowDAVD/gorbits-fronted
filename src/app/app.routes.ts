import { Routes } from '@angular/router';
import { adminGuard } from './admin/admin.guard';
import { adminChildRoutes } from './admin/admin.routes';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { legacyCatalogRedirectGuard, roleDefaultRedirectGuard } from './core/role-redirect';
import { providerGuard } from './provider/provider.guard';
import { providerChildRoutes } from './provider/provider.routes';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [roleDefaultRedirectGuard],
        children: [],
      },
      {
        path: 'home',
        canActivate: [roleDefaultRedirectGuard],
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'catalog',
        canActivate: [legacyCatalogRedirectGuard],
        children: [],
      },
      {
        path: 'proveedor',
        canActivate: [providerGuard],
        loadComponent: () =>
          import('./provider/provider-shell.component').then((m) => m.ProviderShellComponent),
        children: providerChildRoutes,
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./admin/admin-shell.component').then((m) => m.AdminShellComponent),
        children: adminChildRoutes,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
