import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { ProviderBookStockRowResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-my-stock-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-my-stock-page.component.html',
})
export class ProviderMyStockPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);

  readonly rows = signal<ProviderBookStockRowResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.inventory.listMyStock().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el stock disponible.');
        this.loading.set(false);
      },
    });
  }

  totalAvailable(): number {
    return this.rows().reduce((s, r) => s + r.available, 0);
  }
}
