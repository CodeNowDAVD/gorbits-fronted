import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../catalog/catalog.service';
import type { BookResponse, CategoryResponse } from '../../catalog/catalog.models';
import { CatalogAdminApiService } from '../services/catalog-admin-api.service';

@Component({
  selector: 'app-admin-book-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './admin-book-form-page.component.html',
})
export class AdminBookFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalog = inject(CatalogService);
  private readonly catalogAdmin = inject(CatalogAdminApiService);

  readonly categories = signal<CategoryResponse[]>([]);
  readonly unitarioBooks = signal<BookResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    categoryId: [null as unknown as number, Validators.required],
    title: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    bookType: ['UNITARIO' as 'UNITARIO' | 'PAQUETE', Validators.required],
    packageNote: [''],
    companionBookId: [null as number | null],
  });

  private editId: number | null = null;

  ngOnInit(): void {
    this.catalog.listCategories().subscribe({
      next: (c) => this.categories.set(c),
      error: () => this.categories.set([]),
    });
    this.catalog.listBooks(null).subscribe({
      next: (b) => this.unitarioBooks.set(b.filter((x) => x.bookType === 'UNITARIO')),
      error: () => this.unitarioBooks.set([]),
    });

    const raw = this.route.snapshot.paramMap.get('bookId');
    const id = raw ? Number(raw) : NaN;
    if (Number.isFinite(id)) {
      this.editId = id;
      this.catalog.getBook(id).subscribe({
        next: (b) => this.patchFromBook(b),
        error: () => {
          this.error.set('Libro no encontrado.');
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  isPaquete(): boolean {
    return this.form.controls.bookType.value === 'PAQUETE';
  }

  private patchFromBook(b: BookResponse): void {
    this.form.patchValue({
      categoryId: b.categoryId,
      title: b.title,
      price: b.price,
      bookType: b.bookType,
      packageNote: b.packageNote ?? '',
      companionBookId: b.companionBookId,
    });
    this.loading.set(false);
  }

  isEdit(): boolean {
    return this.editId != null;
  }

  editBookId(): number | null {
    return this.editId;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body = {
      categoryId: Number(v.categoryId),
      title: v.title.trim(),
      price: Number(v.price),
      bookType: v.bookType,
      packageNote: v.packageNote.trim() ? v.packageNote.trim() : null,
      companionBookId: v.bookType === 'PAQUETE' ? Number(v.companionBookId) : null,
      companionLinePrice: null,
    };
    this.saving.set(true);
    this.error.set(null);
    if (this.editId != null) {
      this.catalogAdmin.updateBook(this.editId, body).subscribe({
        next: () => void this.router.navigate(['/admin/libros']),
        error: (e) => {
          this.saving.set(false);
          this.error.set(e?.error?.message ?? 'No se pudo guardar.');
        },
      });
    } else {
      this.catalogAdmin.createBook(body).subscribe({
        next: () => void this.router.navigate(['/admin/libros']),
        error: (e) => {
          this.saving.set(false);
          this.error.set(e?.error?.message ?? 'No se pudo crear.');
        },
      });
    }
  }
}
