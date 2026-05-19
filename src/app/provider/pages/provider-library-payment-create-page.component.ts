import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { CampaignResponse } from '../services/provider-commercial.types';

@Component({
  selector: 'app-provider-library-payment-create-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-library-payment-create-page.component.html',
})
export class ProviderLibraryPaymentCreatePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryProviderApiService);
  private readonly commercial = inject(CommercialProviderApiService);
  private readonly router = inject(Router);

  readonly campaigns = signal<CampaignResponse[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    amount: [null as unknown as number, [Validators.required, Validators.min(0.01)]],
    paidOn: ['', Validators.required],
    note: [''],
    campaignId: [null as number | null],
  });

  ngOnInit(): void {
    this.commercial.listCampaigns().subscribe({
      next: (c) => this.campaigns.set(c),
      error: () => this.campaigns.set([]),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.inventory
      .createLibraryPayment({
        amount: Number(v.amount),
        paidOn: v.paidOn,
        note: v.note.trim() ? v.note.trim() : null,
        campaignId: v.campaignId != null ? Number(v.campaignId) : null,
      })
      .subscribe({
        next: (p) => void this.router.navigate(['/proveedor/pagos', p.id]),
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo registrar el pago.');
        },
      });
  }
}
