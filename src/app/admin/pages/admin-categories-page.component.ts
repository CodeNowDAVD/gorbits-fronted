import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../catalog/catalog.service';
import type { CategoryResponse } from '../../catalog/catalog.models';
import { CatalogAdminApiService } from '../services/catalog-admin-api.service';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-categories-page.component.html',
})
export class AdminCategoriesPageComponent implements OnInit {
  private readonly catalog = inject(CatalogService);
  private readonly catalogAdmin = inject(CatalogAdminApiService);

  readonly rows = signal<CategoryResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly editName = signal('');
  readonly creating = signal(false);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly createMsg = signal<string | null>(null);
  readonly createErr = signal<string | null>(null);
  readonly saveErr = signal<string | null>(null);
  readonly actionErr = signal<string | null>(null);
  newName = '';

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.actionErr.set(null);
    this.catalog.listCategories().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
        if (this.editingId() !== null && !r.some((c) => c.id === this.editingId())) {
          this.cancelEdit();
        }
      },
      error: () => {
        this.error.set('No se pudieron cargar las categorías.');
        this.loading.set(false);
      },
    });
  }

  create(): void {
    const n = this.newName.trim();
    if (!n) return;
    this.creating.set(true);
    this.createErr.set(null);
    this.createMsg.set(null);
    this.actionErr.set(null);
    this.catalogAdmin.createCategory({ name: n }).subscribe({
      next: () => {
        this.creating.set(false);
        this.newName = '';
        this.createMsg.set(`Categoría «${n}» creada.`);
        this.reload();
      },
      error: () => {
        this.creating.set(false);
        this.createErr.set('No se pudo crear (¿nombre duplicado o vacío?).');
      },
    });
  }

  startEdit(c: CategoryResponse): void {
    this.editingId.set(c.id);
    this.editName.set(c.name);
    this.saveErr.set(null);
    this.actionErr.set(null);
    this.createMsg.set(null);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editName.set('');
    this.saveErr.set(null);
  }

  editDirty(): boolean {
    const id = this.editingId();
    if (id == null) return false;
    const original = this.rows().find((c) => c.id === id)?.name ?? '';
    return this.editName().trim() !== original.trim();
  }

  saveEdit(): void {
    const id = this.editingId();
    if (id == null) return;
    const name = this.editName().trim();
    if (!name) {
      this.saveErr.set('El nombre no puede quedar vacío.');
      return;
    }
    if (!this.editDirty()) {
      this.cancelEdit();
      return;
    }
    this.saving.set(true);
    this.saveErr.set(null);
    this.actionErr.set(null);
    this.catalogAdmin.updateCategory(id, { name }).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingId.set(null);
        this.editName.set('');
        this.reload();
      },
      error: () => {
        this.saving.set(false);
        this.saveErr.set('No se pudo guardar (¿nombre duplicado?).');
      },
    });
  }

  remove(c: CategoryResponse): void {
    if (!confirm(`¿Eliminar la categoría «${c.name}»?\n\nLos libros asociados pueden verse afectados.`)) {
      return;
    }
    this.deletingId.set(c.id);
    this.actionErr.set(null);
    this.createMsg.set(null);
    this.catalogAdmin.deleteCategory(c.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        if (this.editingId() === c.id) {
          this.cancelEdit();
        }
        this.reload();
      },
      error: () => {
        this.deletingId.set(null);
        this.actionErr.set(`No se pudo eliminar «${c.name}» (¿tiene libros asociados?).`);
      },
    });
  }

  rowBusy(id: number): boolean {
    return (this.saving() && this.editingId() === id) || this.deletingId() === id;
  }
}
