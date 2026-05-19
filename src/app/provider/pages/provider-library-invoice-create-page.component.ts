import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CatalogService } from '../../catalog/catalog.service';
import type { BookResponse } from '../../catalog/catalog.models';
import { InventoryProviderApiService } from '../services/inventory-provider-api.service';
import {
  bookCatalogLabel,
  companionBook,
  hasCompanionConfigured,
  libraryInclusionHint,
  libraryLineAmount,
  libraryUnitPriceLabel,
  validatePackagePairQuantities,
} from '../services/library-invoice-line.util';

@Component({
  selector: 'app-provider-library-invoice-create-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe, ProviderModoNavComponent],
  templateUrl: './provider-library-invoice-create-page.component.html',
})
export class ProviderLibraryInvoiceCreatePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryProviderApiService);
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  readonly books = signal<BookResponse[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly catalogLabel = bookCatalogLabel;
  readonly unitPriceLabel = libraryUnitPriceLabel;

  readonly form = this.fb.nonNullable.group({
    invoiceNumber: ['', Validators.required],
    issuedOn: ['', Validators.required],
    note: [''],
    lines: this.fb.array([this.lineGroup()]),
  });

  ngOnInit(): void {
    this.catalog.listBooks(null).subscribe({
      next: (b) => this.books.set(b),
      error: () => this.books.set([]),
    });
  }

  get lines(): FormArray {
    return this.form.controls.lines;
  }

  private lineGroup() {
    return this.fb.nonNullable.group({
      bookId: [null as unknown as number, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      discountPercent: [null as number | null],
    });
  }

  bookById(id: number | null): BookResponse | undefined {
    if (id == null) return undefined;
    return this.books().find((b) => b.id === id);
  }

  inclusionHint(book: BookResponse | undefined): string | null {
    return libraryInclusionHint(book, this.books());
  }

  canAddIncludedLine(i: number): boolean {
    const row = this.lines.at(i).getRawValue();
    const book = this.bookById(row.bookId);
    if (!hasCompanionConfigured(book) || !book) return false;
    return !this.lines.controls.some((c) => c.value.bookId === book.companionBookId);
  }

  includedTitle(i: number): string {
    const book = this.bookById(this.lines.at(i).value.bookId);
    return book?.companionBookTitle ?? 'libro incluido';
  }

  addIncludedLine(i: number): void {
    const row = this.lines.at(i).getRawValue();
    const book = this.bookById(row.bookId);
    const incl = book ? companionBook(this.books(), book) : undefined;
    if (!incl) return;
    this.lines.push(
      this.fb.nonNullable.group({
        bookId: incl.id,
        quantity: row.quantity,
        discountPercent: row.discountPercent,
      }),
    );
  }

  /** Si cambia la cantidad del título **, actualiza la línea del incluido para que sigan iguales. */
  onQuantityChange(lineIndex: number): void {
    const row = this.lines.at(lineIndex).getRawValue();
    const book = this.bookById(row.bookId);
    if (!hasCompanionConfigured(book) || !book?.companionBookId) return;
    const qty = Number(row.quantity);
    for (let j = 0; j < this.lines.length; j++) {
      if (j === lineIndex) continue;
      if (this.lines.at(j).value.bookId === book.companionBookId) {
        this.lines.at(j).patchValue({ quantity: qty });
      }
    }
  }

  lineAmount(i: number): number {
    const row = this.lines.at(i).getRawValue();
    const book = this.bookById(row.bookId);
    if (!book) return 0;
    return libraryLineAmount(book, Number(row.quantity), Number(row.discountPercent ?? 0));
  }

  invoiceTotal(): number {
    let t = 0;
    for (let i = 0; i < this.lines.length; i++) {
      t += this.lineAmount(i);
    }
    return roundMoney(t);
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
    const pairErr = validatePackagePairQuantities(
      v.lines.map((l) => ({ bookId: l.bookId, quantity: Number(l.quantity) })),
      this.books(),
    );
    if (pairErr) {
      this.error.set(pairErr);
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.inventory
      .createLibraryInvoice({
        invoiceNumber: v.invoiceNumber.trim(),
        issuedOn: v.issuedOn,
        note: v.note.trim() ? v.note.trim() : null,
        lines: v.lines.map((l) => ({
          bookId: Number(l.bookId),
          quantity: Number(l.quantity),
          discountPercent:
            l.discountPercent != null && l.discountPercent > 0 ? Number(l.discountPercent) : null,
        })),
      })
      .subscribe({
        next: (created) => {
          void this.router.navigate(['/proveedor/facturas', created.id]);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo crear la factura (revisa número único y líneas).');
        },
      });
  }
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}
