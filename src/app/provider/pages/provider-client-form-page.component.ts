import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProviderModoNavComponent } from '../components/provider-modo-nav.component';
import { CommercialProviderApiService } from '../services/commercial-provider-api.service';

@Component({
  selector: 'app-provider-client-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ProviderModoNavComponent],
  templateUrl: './provider-client-form-page.component.html',
})
export class ProviderClientFormPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly commercial = inject(CommercialProviderApiService);

  readonly isEdit = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly saveError = signal<string | null>(null);
  private clientId: number | null = null;

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(200)]],
    phone: [''],
    addressNote: [''],
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('clientId');
    if (rawId != null && rawId !== 'nuevo') {
      const id = Number(rawId);
      if (Number.isFinite(id)) {
        this.clientId = id;
        this.isEdit.set(true);
        this.loading.set(true);
        this.commercial.getClient(id).subscribe({
          next: (c) => {
            this.form.patchValue({
              fullName: c.fullName,
              phone: c.phone ?? '',
              addressNote: c.addressNote ?? '',
            });
            this.loading.set(false);
          },
          error: () => {
            this.loadError.set('Cliente no encontrado.');
            this.loading.set(false);
          },
        });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body = {
      fullName: v.fullName.trim(),
      phone: v.phone.trim() ? v.phone.trim() : null,
      addressNote: v.addressNote.trim() ? v.addressNote.trim() : null,
    };
    this.saving.set(true);
    this.saveError.set(null);
    const req = this.isEdit()
      ? this.commercial.updateClient(this.clientId!, body)
      : this.commercial.createClient(body);
    req.subscribe({
      next: () => void this.router.navigate(['/proveedor/clientes']),
      error: () => {
        this.saving.set(false);
        this.saveError.set('No se pudo guardar.');
      },
    });
  }
}
