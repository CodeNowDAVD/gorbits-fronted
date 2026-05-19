import type { Routes } from '@angular/router';

export const adminChildRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/admin-dashboard-page.component').then((m) => m.AdminDashboardPageComponent),
  },
  {
    path: 'proveedores',
    loadComponent: () =>
      import('./pages/admin-providers-page.component').then((m) => m.AdminProvidersPageComponent),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/admin-users-page.component').then((m) => m.AdminUsersPageComponent),
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./pages/admin-categories-page.component').then((m) => m.AdminCategoriesPageComponent),
  },
  {
    path: 'libros/nuevo',
    loadComponent: () =>
      import('./pages/admin-book-form-page.component').then((m) => m.AdminBookFormPageComponent),
  },
  {
    path: 'libros/:bookId',
    loadComponent: () =>
      import('./pages/admin-book-form-page.component').then((m) => m.AdminBookFormPageComponent),
  },
  {
    path: 'libros',
    loadComponent: () =>
      import('./pages/admin-books-page.component').then((m) => m.AdminBooksPageComponent),
  },
  {
    path: 'almacen',
    loadComponent: () =>
      import('./pages/admin-warehouse-page.component').then((m) => m.AdminWarehousePageComponent),
  },
  {
    path: 'facturas-libreria/nueva',
    loadComponent: () =>
      import('./pages/admin-library-invoice-create-page.component').then(
        (m) => m.AdminLibraryInvoiceCreatePageComponent,
      ),
  },
  {
    path: 'facturas-libreria/:invoiceId',
    loadComponent: () =>
      import('./pages/admin-library-invoice-detail-page.component').then(
        (m) => m.AdminLibraryInvoiceDetailPageComponent,
      ),
  },
  {
    path: 'facturas-libreria',
    loadComponent: () =>
      import('./pages/admin-library-invoices-page.component').then(
        (m) => m.AdminLibraryInvoicesPageComponent,
      ),
  },
];
