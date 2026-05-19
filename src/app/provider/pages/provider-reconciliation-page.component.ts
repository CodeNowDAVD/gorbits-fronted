import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { CampaignResponse } from '../services/provider-commercial.types';
import type { LibraryReconciliationSummaryResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-reconciliation-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-reconciliation-page.component.html',
  styleUrl: './provider-reconciliation-page.component.scss',
})
export class ProviderReconciliationPageComponent implements OnInit {
  private readonly inventory = inject(InventoryProviderApiService);
  private readonly commercial = inject(CommercialProviderApiService);

  readonly campaigns = signal<CampaignResponse[]>([]);
  /** null = sin filtro de campaña */
  selectedCampaignId: number | null = null;
  readonly summary = signal<LibraryReconciliationSummaryResponse | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.commercial.listCampaigns().subscribe({
      next: (c) => this.campaigns.set(c),
      error: () => this.campaigns.set([]),
    });
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.inventory.libraryReconciliationSummary(this.selectedCampaignId).subscribe({
      next: (s) => {
        this.summary.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la conciliación.');
        this.loading.set(false);
      },
    });
  }

  onCampaignChange(): void {
    this.reload();
  }
}
