import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import type { BookResponse } from '../../catalog/catalog.models';
import { CatalogService } from '../../catalog/catalog.service';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './catalog-page.component.html',
})
export class CatalogPageComponent implements OnInit {
  private readonly catalog = inject(CatalogService);

  readonly categories = signal<{ id: number; name: string }[]>([]);
  readonly books = signal<BookResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** null = todas las categorías */
  readonly selectedCategoryId = signal<number | null>(null);

  ngOnInit(): void {
    this.catalog.listCategories().subscribe({
      next: (list) => this.categories.set(list),
      error: () => this.categories.set([]),
    });
    this.loadBooks();
  }

  onCategoryFilterChange(event: Event): void {
    const raw = (event.target as HTMLSelectElement).value;
    this.selectedCategoryId.set(raw === '' ? null : Number(raw));
    this.loadBooks();
  }

  loadBooks(): void {
    this.loading.set(true);
    this.error.set(null);
    const cat = this.selectedCategoryId();
    this.catalog.listBooks(cat).subscribe({
      next: (list) => {
        this.books.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.books.set([]);
        this.loading.set(false);
        this.error.set('No se pudo cargar el catálogo.');
      },
    });
  }
}
