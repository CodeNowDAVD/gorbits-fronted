import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { InventoryMovementResponse, InventoryMovementType } from '../services/provider-inventory.types';

const MOVEMENT_LABELS: Record<InventoryMovementType, string> = {
  WAREHOUSE_ADJUSTMENT: 'Ajuste almacén (admin)',
  WITHDRAWAL_TO_FIELD: 'Retiro (legacy)',
  LIBRARY_INVOICE_ENTRY: 'Factura librería',
  LIBRARY_STOCK_RETURN: 'Devolución a librería',
  CLIENT_RETURN: 'Devolución cliente',
  GUIDE_SALE: 'Venta (contrato)',
};

@Component({
  selector: 'app-provider-inventory-movements-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-inventory-movements-page.component.html',
})
export class ProviderInventoryMovementsPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);

  readonly rows = signal<InventoryMovementResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.inventory.listMovements().subscribe({
      next: (m) => {
        this.rows.set(m);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los movimientos.');
        this.loading.set(false);
      },
    });
  }

  movementLabel(type: InventoryMovementType): string {
    return MOVEMENT_LABELS[type] ?? type;
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
