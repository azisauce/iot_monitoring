import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Device, CreateDeviceRequest } from '../models/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly API = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.API}/devices`);
  }

  createDevice(payload: CreateDeviceRequest): Observable<Device> {
    return this.http.post<Device>(`${this.API}/devices`, payload);
  }

  updateStatus(id: number, status: string): Observable<Device> {
    return this.http.patch<Device>(`${this.API}/devices/${id}/status`, { status });
  }

  deleteDevice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/devices/${id}`);
  }
}