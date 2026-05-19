export interface AdminNavItem {
  label: string;
  link: string;
  exact?: boolean;
}

export interface AdminNavGroup {
  title?: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    items: [{ label: 'Reporte', link: '/admin/dashboard', exact: true }],
  },
  {
    title: 'Cuentas',
    items: [
      { label: 'Embajadores', link: '/admin/proveedores' },
      { label: 'Usuarios', link: '/admin/usuarios' },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Categorías', link: '/admin/categorias' },
      { label: 'Libros', link: '/admin/libros' },
    ],
  },
  {
    title: 'Operación',
    items: [
      { label: 'Almacén', link: '/admin/almacen' },
      { label: 'Facturas librería', link: '/admin/facturas-libreria' },
    ],
  },
];
