export interface GuideStatusSummary {
  activa: number;
  cerrada: number;
  devuelta: number;
}

export interface BookSalesRankItem {
  bookId: number;
  title: string;
  units: number;
}

export interface AdminDashboardResponse {
  guidesByStatus: GuideStatusSummary;
  totalWarehouseUnits: number;
  totalFieldStockUnits: number;
  totalLibraryPurchasedUnits: number;
  topBooksClosedGuides: BookSalesRankItem[];
}

export interface AdminUpdateProviderRequest {
  username: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  career: string;
}

export interface AdminCreateProviderRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string;
  career: string;
}

export interface ProviderAccountResponse {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  dni: string | null;
  phone: string | null;
  email: string | null;
  career: string | null;
  zoneId: number | null;
  zoneName: string | null;
}

export interface UserAccountSummaryResponse {
  id: number;
  username: string;
  role: 'ADMIN' | 'PROVEEDOR';
  enabled: boolean;
}
