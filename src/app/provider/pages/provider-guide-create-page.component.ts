import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CatalogService } from '../../catalog/catalog.service';
import type { BookResponse } from '../../catalog/catalog.models';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import type {
  CampaignResponse,
  ClientResponse,
  SalesContractTagResponse,
} from '../services/provider-commercial.types';
import type { ProviderBookStockRowResponse } from '../services/provider-inventory.types';

@Component({
  selector: 'app-provider-guide-create-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-guide-create-page.component.html',
})
export class ProviderGuideCreatePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly commercial = inject(CommercialProviderApiService);
  private readonly inventory = inject(InventoryProviderApiService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  readonly campaigns = signal<CampaignResponse[]>([]);
  readonly clients = signal<ClientResponse[]>([]);
  readonly books = signal<BookResponse[]>([]);
  readonly stock = signal<ProviderBookStockRowResponse[]>([]);
  readonly tags = signal<SalesContractTagResponse[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    campaignId: [null as unknown as number, Validators.required],
    clientId: [null as unknown as number, Validators.required],
    contractNumber: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    orderDate: [new Date().toISOString().slice(0, 10), Validators.required],
    tagIds: [[] as number[]],
    note: [''],
    lines: this.fb.array([this.lineGroup()]),
  });

  ngOnInit(): void {
    this.commercial.listCampaigns().subscribe({
      next: (c) => this.campaigns.set(c),
      error: () => this.campaigns.set([]),
    });
    this.commercial.listClients().subscribe({
      next: (c) => this.clients.set(c),
      error: () => this.clients.set([]),
    });
    this.commercial.listSalesContractTags().subscribe({
      next: (t) => this.tags.set(t),
      error: () => this.tags.set([]),
    });
    this.catalog.listBooks(null).subscribe({
      next: (b) => this.books.set(b),
      error: () => this.books.set([]),
    });
    this.inventory.listMyStock().subscribe({
      next: (s) => this.stock.set(s),
      error: () => this.stock.set([]),
    });
  }

  get lines(): FormArray {
    return this.form.controls.lines;
  }

  private lineGroup() {
    return this.fb.nonNullable.group({
      bookId: [null as unknown as number, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [null as unknown as number, [Validators.required, Validators.min(0.01)]],
    });
  }

  availableFor(bookId: number | null): number {
    if (bookId == null) return 0;
    return this.stock().find((s) => s.bookId === bookId)?.available ?? 0;
  }

  toggleTag(tagId: number, checked: boolean): void {
    const current = [...this.form.controls.tagIds.value];
    if (checked && !current.includes(tagId)) {
      this.form.controls.tagIds.setValue([...current, tagId]);
    } else if (!checked) {
      this.form.controls.tagIds.setValue(current.filter((id) => id !== tagId));
    }
  }

  isTagSelected(tagId: number): boolean {
    return this.form.controls.tagIds.value.includes(tagId);
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
    this.saving.set(true);
    this.error.set(null);
    this.commercial
      .createGuide({
        campaignId: Number(v.campaignId),
        clientId: Number(v.clientId),
        contractNumber: v.contractNumber.trim(),
        orderDate: v.orderDate,
        status: 'ACTIVA',
        note: v.note.trim() ? v.note.trim() : null,
        tagIds: v.tagIds.length ? v.tagIds : null,
        lines: v.lines.map((l) => ({
          bookId: Number(l.bookId),
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
        })),
      })
      .subscribe({
        next: (g) => void this.router.navigate(['/proveedor/guias', g.id]),
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo crear el contrato (revisa stock disponible y datos).');
        },
      });
  }
}
