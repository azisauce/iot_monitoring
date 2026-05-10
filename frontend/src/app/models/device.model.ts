export interface Device {
  id: number;
  device_id: string;
  name: string;
  zone: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  tenant_id: number;
  device_key: string;
  qr_secret: string;
  last_seen: string | null;
  created_at: string;
}

export interface CreateDeviceRequest {
  name: string;
  zone?: string;
}