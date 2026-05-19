import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';

@Component({
  selector: 'app-provider-modo-carga-page',
  standalone: true,
  imports: [RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-modo-carga-page.component.html',
})
export class ProviderModoCargaPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);

  readonly totalUnits = signal(0);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.inventory.listMyStock().subscribe({
      next: (rows) => {
        this.totalUnits.set(rows.reduce((s, r) => s + r.available, 0));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
