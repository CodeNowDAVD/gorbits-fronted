import { Component, inject, OnInit, signal } from '@angular/core';
import { InventoryProviderApiService } from '../../provider/services/inventory-provider-api.service';
import { WarehouseAdminApiService } from '../services/warehouse-admin-api.service';
import type { WarehouseStockRowResponse } from '../../provider/services/provider-inventory.types';

@Component({
  selector: 'app-admin-warehouse-page',
  standalone: true,
  templateUrl: './admin-warehouse-page.component.html',
})
export class AdminWarehousePageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);
  private readonly warehouseAdmin = inject(WarehouseAdminApiService);

  readonly rows = signal<WarehouseStockRowResponse[]>([]);
  readonly qtyDraft = signal<Record<number, number>>({});
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly savingId = signal<number | null>(null);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.inventory.listWarehouseStock().subscribe({
      next: (r) => {
        const d: Record<number, number> = {};
        for (const row of r) {
          d[row.bookId] = row.quantity;
        }
        this.qtyDraft.set(d);
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el almacén.');
        this.loading.set(false);
      },
    });
  }

  patchQty(bookId: number, ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    if (!Number.isFinite(v)) return;
    this.qtyDraft.update((m) => ({ ...m, [bookId]: v }));
  }

  saveRow(bookId: number): void {
    const q = this.qtyDraft()[bookId];
    if (!Number.isFinite(q) || q < 0) return;
    this.savingId.set(bookId);
    this.warehouseAdmin.setBookQuantity(bookId, Math.floor(q)).subscribe({
      next: () => {
        this.savingId.set(null);
        this.reload();
      },
      error: () => {
        this.savingId.set(null);
      },
    });
  }
}
