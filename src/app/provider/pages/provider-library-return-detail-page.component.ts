import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { LibraryStockReturnDetailResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-library-return-detail-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-library-return-detail-page.component.html',
})
export class ProviderLibraryReturnDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly inventory = inject(InventoryProviderApiService);

  readonly detail = signal<LibraryStockReturnDetailResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('returnId'));
    if (!Number.isFinite(id)) {
      this.error.set('Devolución no válida.');
      this.loading.set(false);
      return;
    }
    this.inventory.getLibraryStockReturn(id).subscribe({
      next: (d) => {
        this.detail.set(d);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la devolución.');
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
