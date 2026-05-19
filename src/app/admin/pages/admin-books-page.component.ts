import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../catalog/catalog.service';
import type { BookResponse, CategoryResponse } from '../../catalog/catalog.models';
import { CatalogAdminApiService } from '../services/catalog-admin-api.service';

@Component({
  selector: 'app-admin-books-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './admin-books-page.component.html',
})
export class AdminBooksPageComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly catalogAdmin = inject(CatalogAdminApiService);

  readonly categories = signal<CategoryResponse[]>([]);
  readonly rows = signal<BookResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyId = signal<number | null>(null);
  readonly filterCategoryId = signal<number | null>(null);

  ngOnInit(): void {
    this.catalog.listCategories().subscribe({
      next: (list) => this.categories.set(list),
      error: () => this.categories.set([]),
    });
    this.reload();
  }

  onCategoryFilterChange(categoryId: number | null): void {
    this.filterCategoryId.set(categoryId);
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.catalog.listBooks(this.filterCategoryId()).subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los libros.');
        this.loading.set(false);
      },
    });
  }

  remove(id: number): void {
    this.busyId.set(id);
    this.catalogAdmin.deleteBook(id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.reload();
      },
      error: () => {
        this.busyId.set(null);
      },
    });
  }
}
