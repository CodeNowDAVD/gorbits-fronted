import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventoryProviderApiService } from '../../provider/services/inventory-provider-api.service';
import { AdminApiService } from '../services/admin-api.service';
import type { LibrarySupplyInvoiceListItemResponse } from '../../provider/services/provider-inventory.types';
import type { ProviderAccountResponse } from '../services/admin.types';

@Component({
  selector: 'app-admin-library-invoices-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './admin-library-invoices-page.component.html',
})
export class AdminLibraryInvoicesPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);
  private readonly admin = inject(AdminApiService);

  readonly providers = signal<ProviderAccountResponse[]>([]);
  readonly rows = signal<LibrarySupplyInvoiceListItemResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  filterProviderId: number | null = null;

  ngOnInit(): void {
    this.admin.listProviders().subscribe({
      next: (p) => this.providers.set(p),
      error: () => this.providers.set([]),
    });
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    const pid = this.filterProviderId == null ? null : Number(this.filterProviderId);
    this.inventory.listLibraryInvoices(pid).subscribe({
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

  applyFilter(): void {
    this.reload();
  }
}
