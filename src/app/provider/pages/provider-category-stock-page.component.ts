import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { CategoryStockSummaryResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-category-stock-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-category-stock-page.component.html',
})
export class ProviderCategoryStockPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);

  readonly rows = signal<CategoryStockSummaryResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.inventory.stockByCategory().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el stock por categoría.');
        this.loading.set(false);
      },
    });
  }
}
