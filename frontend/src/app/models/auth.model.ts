export interface LoginRequest {
  email: string;
  tenantSlug: string;
  password: string;
}

export interface RegisterRequest {
  tenantName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: { id: number; email: string; role: string };
  tenant: { id: number; name: string; slug: string };
}

export interface DecodedToken {
  id: number;
  email: string;
  role: string;
  tenant_id: number;
  exp: number;
}