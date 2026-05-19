import { Component, input, signal } from '@angular/core';

const DEFAULT_AVATAR_CANDIDATES = [
  '/assets/provider-avatar.jpg',
  '/assets/provider-avatar.png',
  '/assets/provider-avatar.webp',
] as const;

@Component({
  selector: 'app-provider-avatar',
  standalone: true,
  template: `
    @if (currentSrc(); as photo) {
      <img [src]="photo" alt="" (error)="onImageError()" />
    } @else {
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </svg>
    }
  `,
  host: { class: 'provider-avatar' },
})
export class ProviderAvatarComponent {
  /** Ruta personalizada o vacío para usar el avatar por defecto del proyecto. */
  readonly src = input<string>('');

  private readonly candidateIndex = signal(0);
  readonly currentSrc = signal<string | null>(this.resolveInitialSrc());

  private resolveInitialSrc(): string | null {
    const custom = this.src().trim();
    if (custom) {
      return custom;
    }
    return DEFAULT_AVATAR_CANDIDATES[0] ?? null;
  }

  onImageError(): void {
    const custom = this.src().trim();
    if (custom) {
      this.currentSrc.set(null);
      return;
    }
    const next = this.candidateIndex() + 1;
    if (next < DEFAULT_AVATAR_CANDIDATES.length) {
      this.candidateIndex.set(next);
      this.currentSrc.set(DEFAULT_AVATAR_CANDIDATES[next]);
      return;
    }
    this.currentSrc.set(null);
  }
}
