import type { Routes } from '@angular/router';

export const providerChildRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./pages/provider-home-page.component').then((m) => m.ProviderHomePageComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('../pages/catalog/catalog-page.component').then((m) => m.CatalogPageComponent),
  },
  {
    path: 'modo/campo',
    loadComponent: () =>
      import('./pages/provider-modo-campo-page.component').then((m) => m.ProviderModoCampoPageComponent),
  },
  {
    path: 'modo/cobranza',
    loadComponent: () =>
      import('./pages/provider-modo-cobranza-page.component').then((m) => m.ProviderModoCobranzaPageComponent),
  },
  {
    path: 'modo/carga',
    loadComponent: () =>
      import('./pages/provider-modo-carga-page.component').then((m) => m.ProviderModoCargaPageComponent),
  },
  {
    path: 'modo/caja',
    loadComponent: () =>
      import('./pages/provider-modo-caja-page.component').then((m) => m.ProviderModoCajaPageComponent),
  },
  {
    path: 'facturas',
    loadComponent: () =>
      import('./pages/provider-library-invoices-page.component').then(
        (m) => m.ProviderLibraryInvoicesPageComponent,
      ),
  },
  {
    path: 'facturas/nueva',
    loadComponent: () =>
      import('./pages/provider-library-invoice-create-page.component').then(
        (m) => m.ProviderLibraryInvoiceCreatePageComponent,
      ),
  },
  {
    path: 'facturas/:invoiceId',
    loadComponent: () =>
      import('./pages/provider-library-invoice-detail-page.component').then(
        (m) => m.ProviderLibraryInvoiceDetailPageComponent,
      ),
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('./pages/provider-library-payments-page.component').then(
        (m) => m.ProviderLibraryPaymentsPageComponent,
      ),
  },
  {
    path: 'pagos/nueva',
    loadComponent: () =>
      import('./pages/provider-library-payment-create-page.component').then(
        (m) => m.ProviderLibraryPaymentCreatePageComponent,
      ),
  },
  {
    path: 'pagos/:paymentId',
    loadComponent: () =>
      import('./pages/provider-library-payment-detail-page.component').then(
        (m) => m.ProviderLibraryPaymentDetailPageComponent,
      ),
  },
  {
    path: 'conciliacion',
    loadComponent: () =>
      import('./pages/provider-reconciliation-page.component').then(
        (m) => m.ProviderReconciliationPageComponent,
      ),
  },
  {
    path: 'devoluciones',
    loadComponent: () =>
      import('./pages/provider-library-returns-page.component').then(
        (m) => m.ProviderLibraryReturnsPageComponent,
      ),
  },
  {
    path: 'devoluciones/nueva',
    loadComponent: () =>
      import('./pages/provider-library-return-create-page.component').then(
        (m) => m.ProviderLibraryReturnCreatePageComponent,
      ),
  },
  {
    path: 'devoluciones/:returnId',
    loadComponent: () =>
      import('./pages/provider-library-return-detail-page.component').then(
        (m) => m.ProviderLibraryReturnDetailPageComponent,
      ),
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/provider-clients-page.component').then((m) => m.ProviderClientsPageComponent),
  },
  {
    path: 'clientes/nuevo',
    loadComponent: () =>
      import('./pages/provider-client-form-page.component').then((m) => m.ProviderClientFormPageComponent),
  },
  {
    path: 'clientes/:clientId',
    loadComponent: () =>
      import('./pages/provider-client-form-page.component').then((m) => m.ProviderClientFormPageComponent),
  },
  {
    path: 'guias',
    loadComponent: () =>
      import('./pages/provider-guides-page.component').then((m) => m.ProviderGuidesPageComponent),
  },
  {
    path: 'guias/nueva',
    loadComponent: () =>
      import('./pages/provider-guide-create-page.component').then((m) => m.ProviderGuideCreatePageComponent),
  },
  {
    path: 'guias/:guideId',
    loadComponent: () =>
      import('./pages/provider-guide-detail-page.component').then((m) => m.ProviderGuideDetailPageComponent),
  },
  {
    path: 'calendario-cuotas',
    loadComponent: () =>
      import('./pages/provider-billing-calendar-page.component').then(
        (m) => m.ProviderBillingCalendarPageComponent,
      ),
  },
  {
    path: 'cobranza',
    loadComponent: () =>
      import('./pages/provider-collections-page.component').then((m) => m.ProviderCollectionsPageComponent),
  },
  {
    path: 'movimientos',
    loadComponent: () =>
      import('./pages/provider-inventory-movements-page.component').then(
        (m) => m.ProviderInventoryMovementsPageComponent,
      ),
  },
  {
    path: 'mi-stock',
    loadComponent: () =>
      import('./pages/provider-my-stock-page.component').then((m) => m.ProviderMyStockPageComponent),
  },
  {
    path: 'stock-categorias',
    loadComponent: () =>
      import('./pages/provider-category-stock-page.component').then((m) => m.ProviderCategoryStockPageComponent),
  },
  {
    path: 'informe-cierre',
    loadComponent: () =>
      import('./pages/provider-campaign-close-report-page.component').then(
        (m) => m.ProviderCampaignCloseReportPageComponent,
      ),
  },
  {
    path: 'devoluciones-guias',
    loadComponent: () =>
      import('./pages/provider-guide-returns-page.component').then((m) => m.ProviderGuideReturnsPageComponent),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/provider-profile-page.component').then((m) => m.ProviderProfilePageComponent),
  },
];
