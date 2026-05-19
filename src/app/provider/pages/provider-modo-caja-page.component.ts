import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';

@Component({
  selector: 'app-provider-modo-caja-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, ProviderModoNavComponent],
  templateUrl: './provider-modo-caja-page.component.html',
})
export class ProviderModoCajaPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);

  readonly loading = signal(true);
  readonly invoiced = signal(0);
  readonly deposits = signal(0);
  readonly balance = signal(0);

  ngOnInit(): void {
    this.inventory.libraryReconciliationSummary(null).subscribe({
      next: (s) => {
        this.invoiced.set(s.totalInvoicedAmount);
        this.deposits.set(s.totalDepositsToLibrary);
        this.balance.set(s.netBalanceOwedToLibrary);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
