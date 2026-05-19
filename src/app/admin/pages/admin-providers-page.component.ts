import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../services/admin-api.service';
import type { AdminCreateProviderRequest, AdminUpdateProviderRequest, ProviderAccountResponse } from '../services/admin.types';

@Component({
  selector: 'app-admin-providers-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-providers-page.component.html',
})
export class AdminProvidersPageComponent implements OnInit {
  private readonly admin = inject(AdminApiService);
  private readonly fb = inject(FormBuilder);

  readonly rows = signal<ProviderAccountResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showCreate = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly creating = signal(false);
  readonly saving = signal(false);
  readonly createMsg = signal<string | null>(null);
  readonly createErr = signal<string | null>(null);
  readonly createValidationErr = signal<string | null>(null);
  readonly saveErr = signal<string | null>(null);

  readonly createForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    phone: ['', [Validators.required, Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    career: ['', [Validators.required, Validators.maxLength(120)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dni: ['', [Validators.required, Validators.maxLength(20)]],
    phone: ['', [Validators.required, Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    career: ['', [Validators.required, Validators.maxLength(120)]],
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.admin.listProviders().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los embajadores.');
        this.loading.set(false);
      },
    });
  }

  displayFirstName(p: ProviderAccountResponse): string {
    const v = p.firstName?.trim();
    return v || '—';
  }

  displayLastName(p: ProviderAccountResponse): string {
    const v = p.lastName?.trim();
    return v || '—';
  }

  toggleCreate(): void {
    this.showCreate.update((v) => !v);
    this.editingId.set(null);
    this.createErr.set(null);
    this.createValidationErr.set(null);
    this.saveErr.set(null);
  }

  showFieldError(form: FormGroup, name: string): boolean {
    const c = form.get(name);
    return !!(c && c.invalid && c.touched);
  }

  fieldErrorMessage(form: FormGroup, name: string): string {
    const c = form.get(name);
    if (!c?.errors) {
      return '';
    }
    if (c.errors['required']) {
      return 'Campo obligatorio.';
    }
    if (c.errors['minlength']) {
      return `Mínimo ${c.errors['minlength'].requiredLength} caracteres.`;
    }
    if (c.errors['email']) {
      return 'Correo no válido.';
    }
    if (c.errors['maxlength']) {
      return 'Texto demasiado largo.';
    }
    return 'Valor no válido.';
  }

  startEdit(p: ProviderAccountResponse): void {
    this.showCreate.set(false);
    this.editingId.set(p.id);
    this.saveErr.set(null);
    this.editForm.setValue({
      username: p.username,
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      dni: p.dni ?? '',
      phone: p.phone ?? '',
      email: p.email ?? '',
      career: p.career ?? '',
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.saveErr.set(null);
  }

  createProvider(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.createValidationErr.set('Revisa los campos marcados antes de continuar.');
      this.createErr.set(null);
      return;
    }
    this.createValidationErr.set(null);
    const v = this.createForm.getRawValue();
    const body: AdminCreateProviderRequest = {
      username: v.username.trim(),
      password: v.password,
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      dni: v.dni.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      career: v.career.trim(),
    };
    const initialPassword = v.password;
    this.creating.set(true);
    this.createErr.set(null);
    this.createMsg.set(null);
    this.admin.createProvider(body).subscribe({
      next: () => {
        this.creating.set(false);
        this.createMsg.set(
          `Embajador creado. Usuario «${body.username}». Contraseña inicial (comunícasela al usuario): «${initialPassword}»`,
        );
        this.createForm.reset();
        this.showCreate.set(false);
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        const apiMsg = typeof err.error?.error === 'string' ? err.error.error : null;
        this.createErr.set(
          apiMsg ?? 'No se pudo crear (usuario o DNI duplicado, o datos inválidos).',
        );
      },
    });
  }

  saveEdit(): void {
    const id = this.editingId();
    if (id == null || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.saveErr.set('Completa todos los campos obligatorios antes de guardar.');
      return;
    }
    const v = this.editForm.getRawValue();
    const body: AdminUpdateProviderRequest = {
      username: v.username.trim(),
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      dni: v.dni.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      career: v.career.trim(),
    };
    this.saving.set(true);
    this.saveErr.set(null);
    this.admin.updateProvider(id, body).subscribe({
      next: () => {
        this.saving.set(false);
        this.editingId.set(null);
        this.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        const apiMsg = typeof err.error?.error === 'string' ? err.error.error : null;
        this.saveErr.set(apiMsg ?? 'No se pudo guardar (usuario o DNI duplicado, o datos inválidos).');
      },
    });
  }
}
