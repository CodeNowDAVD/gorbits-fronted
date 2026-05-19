import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import type { CampaignCloseReportResponse, CampaignResponse } from '../services/provider-commercial.types';

@Component({
  selector: 'app-provider-campaign-close-report-page',
  standalone: true,
  imports: [FormsModule, DecimalPipe, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-campaign-close-report-page.component.html',
})
export class ProviderCampaignCloseReportPageComponent implements OnInit {
  private readonly commercial = inject(CommercialProviderApiService);

  readonly campaigns = signal<CampaignResponse[]>([]);
  selectedCampaignId: number | null = null;
  readonly report = signal<CampaignCloseReportResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.commercial.listCampaigns().subscribe({
      next: (c) => {
        this.campaigns.set(c);
        if (c.length > 0 && this.selectedCampaignId == null) {
          this.selectedCampaignId = c[0].id;
          this.reload();
        }
      },
      error: () => this.campaigns.set([]),
    });
  }

  reload(): void {
    const id = this.selectedCampaignId;
    if (id == null) {
      this.report.set(null);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.commercial.getCampaignCloseReport(id).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el informe de cierre.');
        this.report.set(null);
        this.loading.set(false);
      },
    });
  }

  onCampaignChange(): void {
    this.reload();
  }
}
