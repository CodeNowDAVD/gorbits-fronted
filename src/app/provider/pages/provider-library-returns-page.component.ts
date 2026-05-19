import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { LibraryStockReturnListItemResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-library-returns-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-library-returns-page.component.html',
})
export class ProviderLibraryReturnsPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);

  readonly rows = signal<LibraryStockReturnListItemResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.inventory.listLibraryStockReturns().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las devoluciones.');
        this.loading.set(false);
      },
    });
  }

  formatDateTime(iso: string): string {
    if (!iso?.trim()) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
