import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BillingProviderApiService } from '../services/billing-provider-api.service';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';

@Component({
  selector: 'app-provider-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './provider-home-page.component.html',
})
export class ProviderHomePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly commercial = inject(CommercialProviderApiService);
  private readonly billing = inject(BillingProviderApiService);

  readonly zoneName = signal<string | null>(null);
  readonly campaignLabel = signal<string | null>(null);
  readonly alertCount = signal(0);

  readonly username = () => this.auth.session()?.username ?? 'Proveedor';

  ngOnInit(): void {
    forkJoin({
      profile: this.commercial.getProviderProfile(),
      campaigns: this.commercial.listCampaigns(),
      billing: this.billing.billingSummary(null),
      pastDue: this.billing.pastDueCollections(null),
    }).subscribe({
      next: ({ profile, campaigns, billing, pastDue }) => {
        this.zoneName.set(profile.zoneName);
        this.campaignLabel.set(campaigns[0]?.name ?? null);
        this.alertCount.set(
          billing.pastDueInstallmentCount > 0
            ? billing.pastDueInstallmentCount
            : pastDue.length > 0
              ? pastDue.length
              : 0,
        );
      },
      error: () => {
        this.zoneName.set(null);
        this.campaignLabel.set(null);
      },
    });
  }
}
