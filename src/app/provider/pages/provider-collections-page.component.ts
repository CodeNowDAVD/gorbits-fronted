import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { BillingProviderApiService } from '../services/billing-provider-api.service';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import type { CampaignResponse } from '../services/provider-commercial.types';
import type {
  PastDueCollectionItemResponse,
  ProviderBillingTotalsResponse,
} from '../services/provider-billing.types';

@Component({
  selector: 'app-provider-collections-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-collections-page.component.html',
})
export class ProviderCollectionsPageComponent implements OnInit {
  private readonly billing = inject(BillingProviderApiService);
  private readonly commercial = inject(CommercialProviderApiService);

  readonly campaigns = signal<CampaignResponse[]>([]);
  selectedCampaignId: number | null = null;
  readonly summary = signal<ProviderBillingTotalsResponse | null>(null);
  readonly pastDue = signal<PastDueCollectionItemResponse[]>([]);
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
    const cid = this.selectedCampaignId;
    this.billing.billingSummary(cid).subscribe({
      next: (s) => this.summary.set(s),
      error: () => this.summary.set(null),
    });
    this.billing.pastDueCollections(cid).subscribe({
      next: (rows) => {
        this.pastDue.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la cobranza.');
        this.pastDue.set([]);
        this.loading.set(false);
      },
    });
  }

  onCampaignChange(): void {
    this.reload();
  }
}
