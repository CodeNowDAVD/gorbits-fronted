import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { LibrarySupplyInvoiceListItemResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-library-invoices-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, ProviderModoNavComponent],
  templateUrl: './provider-library-invoices-page.component.html',
})
export class ProviderLibraryInvoicesPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);

  readonly rows = signal<LibrarySupplyInvoiceListItemResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.inventory.listLibraryInvoices().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las facturas.');
        this.loading.set(false);
      },
    });
  }
}
