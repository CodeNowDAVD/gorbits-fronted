import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type { CampaignResponse } from '../services/provider-commercial.types';
import type { ProviderBookStockRowResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-library-return-create-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-library-return-create-page.component.html',
})
export class ProviderLibraryReturnCreatePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryProviderApiService);
  private readonly commercial = inject(CommercialProviderApiService);
  private readonly router = inject(Router);

  readonly stock = signal<ProviderBookStockRowResponse[]>([]);
  readonly campaigns = signal<CampaignResponse[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    campaignId: [null as number | null],
    note: [''],
    lines: this.fb.array([this.lineGroup()]),
  });

  ngOnInit(): void {
    this.inventory.listMyStock().subscribe({
      next: (rows) => this.stock.set(rows.filter((r) => r.available > 0)),
      error: () => this.stock.set([]),
    });
    this.commercial.listCampaigns().subscribe({
      next: (c) => this.campaigns.set(c),
      error: () => this.campaigns.set([]),
    });
  }

  get lines(): FormArray {
    return this.form.controls.lines;
  }

  private lineGroup() {
    return this.fb.nonNullable.group({
      bookId: [null as unknown as number, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  availableFor(bookId: number | null): number {
    if (bookId == null) return 0;
    return this.stock().find((s) => s.bookId === bookId)?.available ?? 0;
  }

  addLine(): void {
    this.lines.push(this.lineGroup());
  }

  removeLine(i: number): void {
    if (this.lines.length > 1) this.lines.removeAt(i);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    for (const l of v.lines) {
      const bookId = Number(l.bookId);
      const qty = Number(l.quantity);
      const max = this.availableFor(bookId);
      if (qty > max) {
        this.error.set(`Cantidad mayor al disponible (${max}) para el libro seleccionado.`);
        return;
      }
    }
    this.saving.set(true);
    this.error.set(null);
    this.inventory
      .createLibraryStockReturn({
        campaignId: v.campaignId != null ? Number(v.campaignId) : null,
        note: v.note.trim() ? v.note.trim() : null,
        lines: v.lines.map((l) => ({
          bookId: Number(l.bookId),
          quantity: Number(l.quantity),
        })),
      })
      .subscribe({
        next: (created) => void this.router.navigate(['/proveedor/devoluciones', created.id]),
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo registrar la devolución.');
        },
      });
  }
}
