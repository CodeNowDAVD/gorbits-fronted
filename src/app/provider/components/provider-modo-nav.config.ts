export type ProviderModoId = 'campo' | 'cobranza' | 'carga' | 'caja';

export interface ProviderModoNavTab {
  label: string;
  link: string;
  exact?: boolean;
}

export interface ProviderModoNavConfig {
  ariaLabel: string;
  tabs: ProviderModoNavTab[];
}

export const PROVIDER_MODO_NAV: Record<ProviderModoId, ProviderModoNavConfig> = {
  campo: {
    ariaLabel: 'Navegación Modo Campo',
    tabs: [
      { label: 'Inicio', link: '/proveedor/modo/campo', exact: true },
      { label: 'Contratos', link: '/proveedor/guias' },
      { label: 'Clientes', link: '/proveedor/clientes' },
      { label: 'Devoluciones', link: '/proveedor/devoluciones-guias' },
    ],
  },
  cobranza: {
    ariaLabel: 'Navegación Modo Cobranza',
    tabs: [
      { label: 'Inicio', link: '/proveedor/modo/cobranza', exact: true },
      { label: 'Cobranza', link: '/proveedor/cobranza' },
      { label: 'Calendario', link: '/proveedor/calendario-cuotas' },
    ],
  },
  carga: {
    ariaLabel: 'Navegación Modo Carga',
    tabs: [
      { label: 'Inicio', link: '/proveedor/modo/carga', exact: true },
      { label: 'Mi stock', link: '/proveedor/mi-stock' },
      { label: 'Categorías', link: '/proveedor/stock-categorias' },
      { label: 'Devoluciones', link: '/proveedor/devoluciones' },
      { label: 'Movimientos', link: '/proveedor/movimientos' },
    ],
  },
  caja: {
    ariaLabel: 'Navegación Modo Caja',
    tabs: [
      { label: 'Inicio', link: '/proveedor/modo/caja', exact: true },
      { label: 'Conciliación', link: '/proveedor/conciliacion' },
      { label: 'Pagos', link: '/proveedor/pagos' },
      { label: 'Facturas', link: '/proveedor/facturas' },
      { label: 'Informe', link: '/proveedor/informe-cierre' },
    ],
  },
};
