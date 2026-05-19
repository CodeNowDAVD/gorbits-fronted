import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryProviderApiService } from '../../provider/services/inventory-provider-api.service';
import type { LibrarySupplyInvoiceDetailResponse } from '../../provider/services/provider-inventory.types';

@Component({
  selector: 'app-admin-library-invoice-detail-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './admin-library-invoice-detail-page.component.html',
})
export class AdminLibraryInvoiceDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly inventory = inject(InventoryProviderApiService);

  readonly detail = signal<LibrarySupplyInvoiceDetailResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('invoiceId'));
    if (!Number.isFinite(id)) {
      this.error.set('Factura no válida.');
      this.loading.set(false);
      return;
    }
    this.inventory.getLibraryInvoice(id).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la factura.');
        this.loading.set(false);
      },
    });
  }
}
