export type Role = 'ADMIN' | 'PROVEEDOR';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  role: Role;
}

export interface MeResponse {
  id: number;
  username: string;
  role: Role;
}
