import { Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive, type IsActiveMatchOptions } from '@angular/router';
import {
  PROVIDER_MODO_NAV,
  type ProviderModoId,
  type ProviderModoNavTab,
} from './provider-modo-nav.config';

@Component({
  selector: 'app-provider-modo-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './provider-modo-nav.component.html',
})
export class ProviderModoNavComponent {
  readonly mode = input.required<ProviderModoId>();
  readonly backLink = input<string | null>(null);
  readonly backLabel = input('← Inicio');
  readonly showTabs = input(true);

  readonly config = computed(() => PROVIDER_MODO_NAV[this.mode()]);

  private readonly subsetMatch: IsActiveMatchOptions = {
    paths: 'subset',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };

  tabMatch(tab: ProviderModoNavTab): IsActiveMatchOptions {
    if (tab.exact) {
      return { paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored' };
    }
    return this.subsetMatch;
  }
}
