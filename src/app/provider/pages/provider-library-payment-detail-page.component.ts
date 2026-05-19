import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { LibraryPaymentDetailResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-library-payment-detail-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, ProviderModoNavComponent],
  templateUrl: './provider-library-payment-detail-page.component.html',
})
export class ProviderLibraryPaymentDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly inventory = inject(InventoryProviderApiService);

  readonly detail = signal<LibraryPaymentDetailResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('paymentId'));
    if (!Number.isFinite(id)) {
      this.error.set('Pago no válido.');
      this.loading.set(false);
      return;
    }
    this.inventory.getLibraryPayment(id).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el pago.');
        this.loading.set(false);
      },
    });
  }
}
