import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { AuthService } from '../../services/auth.service';
import { Device } from '../../models/device.model';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit {
  devices: Device[] = [];
  loading = true;
  error = '';

  showAddModal = false;
  addForm = { name: '', zone: '' };
  addLoading = false;
  addError = '';

  userRole = '';

  constructor(
    private deviceService: DeviceService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUser()?.role || '';
    this.loadDevices();
  }

  loadDevices(): void {
    this.loading = true;
    this.deviceService.getDevices().subscribe({
      next: (devices) => {
        this.devices = devices;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load devices';
        this.loading = false;
      },
    });
  }

  openAddModal(): void {
    this.addForm = { name: '', zone: '' };
    this.addError = '';
    this.showAddModal = true;
  }

  submitAdd(): void {
    if (!this.addForm.name) return;
    this.addLoading = true;
    this.addError = '';

    const payload = {
      name: this.addForm.name,
      ...(this.addForm.zone ? { zone: this.addForm.zone } : {}),
    };

    this.deviceService.createDevice(payload).subscribe({
      next: (device) => {
        this.devices.unshift(device);
        this.showAddModal = false;
        this.addLoading = false;
      },
      error: (err) => {
        this.addError = err.error?.error || 'Failed to add device';
        this.addLoading = false;
      },
    });
  }

  setStatus(device: Device, status: string): void {
    this.deviceService.updateStatus(device.id, status).subscribe({
      next: (updated) => {
        const idx = this.devices.findIndex(d => d.id === device.id);
        if (idx !== -1) this.devices[idx] = updated;
      },
      error: () => alert('Failed to update status'),
    });
  }

  deleteDevice(device: Device): void {
    if (!confirm(`Delete "${device.name}"?`)) return;
    this.deviceService.deleteDevice(device.id).subscribe({
      next: () => {
        this.devices = this.devices.filter(d => d.id !== device.id);
      },
      error: () => alert('Failed to delete device'),
    });
  }

  canManage(): boolean {
    return ['admin', 'technician'].includes(this.userRole);
  }

  getStatusClass(status: string): string {
    return { active: 'status-active', inactive: 'status-inactive', maintenance: 'status-maintenance' }[status] || '';
  }
}