import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminApiService } from '../services/admin-api.service';
import type { UserAccountSummaryResponse } from '../services/admin.types';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './admin-users-page.component.html',
})
export class AdminUsersPageComponent implements OnInit {
  private readonly admin = inject(AdminApiService);
  private readonly auth = inject(AuthService);

  readonly rows = signal<UserAccountSummaryResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busyUserId = signal<number | null>(null);
  readonly roleErr = signal<string | null>(null);
  readonly roleOk = signal<string | null>(null);

  /** Modal de contraseña: formulario → éxito o error. */
  readonly passwordModal = signal<{ id: number; username: string } | null>(null);
  readonly pwdModalBusy = signal(false);
  readonly pwdModalErr = signal<string | null>(null);
  readonly pwdModalSuccess = signal<{ username: string; password: string } | null>(null);
  readonly showPwdPlain = signal(false);
  pwdDraft = '';

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.admin.listUsers().subscribe({
      next: (r) => {
        this.rows.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  currentUserId(): number | null {
    return this.auth.session()?.id ?? null;
  }

  roleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrador' : 'Embajador';
  }

  openPasswordModal(u: UserAccountSummaryResponse): void {
    this.passwordModal.set({ id: u.id, username: u.username });
    this.pwdModalBusy.set(false);
    this.pwdModalErr.set(null);
    this.pwdModalSuccess.set(null);
    this.showPwdPlain.set(false);
    this.pwdDraft = '';
  }

  closePasswordModal(): void {
    this.passwordModal.set(null);
    this.pwdModalBusy.set(false);
    this.pwdModalErr.set(null);
    this.pwdModalSuccess.set(null);
    this.pwdDraft = '';
  }

  submitPasswordModal(event: Event): void {
    event.preventDefault();
    const modal = this.passwordModal();
    if (!modal) {
      return;
    }
    const p = this.pwdDraft.trim();
    if (p.length < 8) {
      this.pwdModalSuccess.set(null);
      this.pwdModalErr.set('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.pwdModalBusy.set(true);
    this.pwdModalErr.set(null);
    this.pwdModalSuccess.set(null);
    this.admin.resetPassword(modal.id, p).subscribe({
      next: (updated) => {
        this.pwdModalBusy.set(false);
        this.pwdModalSuccess.set({
          username: updated?.username ?? modal.username,
          password: p,
        });
        this.pwdDraft = '';
      },
      error: (err: HttpErrorResponse) => {
        this.pwdModalBusy.set(false);
        const apiMsg = typeof err.error?.error === 'string' ? err.error.error : null;
        if (err.status === 404) {
          this.pwdModalErr.set(
            'El servidor no respondió (404). Reinicia GOrbitS con el código nuevo y vuelve a intentar.',
          );
          return;
        }
        this.pwdModalErr.set(apiMsg ?? `Error del servidor (${err.status}). No se guardó la contraseña.`);
      },
    });
  }

  changeRole(u: UserAccountSummaryResponse, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newRole = select.value as 'ADMIN' | 'PROVEEDOR';
    if (newRole === u.role) {
      return;
    }
    const newLabel = this.roleLabel(newRole);
    const oldLabel = this.roleLabel(u.role);
    if (
      !confirm(
        `¿Cambiar el rol de «${u.username}» de ${oldLabel} a ${newLabel}?\n\n` +
          (newRole === 'PROVEEDOR'
            ? 'Podrá usar la app como embajador (proveedor).'
            : 'Tendrá acceso al panel de administración.'),
      )
    ) {
      select.value = u.role;
      return;
    }
    this.roleErr.set(null);
    this.roleOk.set(null);
    this.busyUserId.set(u.id);
    this.admin.setRole(u.id, newRole).subscribe({
      next: (updated) => {
        this.rows.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
        this.busyUserId.set(null);
        this.roleOk.set(
          `Rol de «${updated.username}» actualizado a ${this.roleLabel(updated.role)}.`,
        );
      },
      error: (err: HttpErrorResponse) => {
        select.value = u.role;
        this.busyUserId.set(null);
        const apiMsg = typeof err.error?.error === 'string' ? err.error.error : null;
        if (err.status === 404) {
          this.roleErr.set(
            'No se encontró el servicio de cambio de rol. Reinicia el backend (GOrbitS) y vuelve a intentar.',
          );
          return;
        }
        this.roleErr.set(apiMsg ?? 'No se pudo cambiar el rol.');
      },
    });
  }

  toggleEnabled(u: UserAccountSummaryResponse): void {
    const me = this.currentUserId();
    if (me != null && u.id === me) {
      return;
    }
    this.busyUserId.set(u.id);
    this.admin.setEnabled(u.id, !u.enabled).subscribe({
      next: (updated) => {
        this.rows.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
        this.busyUserId.set(null);
      },
      error: () => {
        this.busyUserId.set(null);
      },
    });
  }
}
