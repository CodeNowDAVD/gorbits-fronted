import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { BillingProviderApiService } from '../services/billing-provider-api.service';

@Component({
  selector: 'app-provider-modo-cobranza-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, ProviderModoNavComponent],
  templateUrl: './provider-modo-cobranza-page.component.html',
})
export class ProviderModoCobranzaPageComponent implements OnInit {
  private readonly billing = inject(BillingProviderApiService);

  readonly loading = signal(true);
  readonly pending = signal(0);
  readonly pastDue = signal(0);
  readonly totalPending = signal(0);

  ngOnInit(): void {
    this.billing.billingSummary(null).subscribe({
      next: (s) => {
        this.pending.set(s.pendingInstallmentCount);
        this.pastDue.set(s.pastDueInstallmentCount);
        this.totalPending.set(s.totalPending);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
