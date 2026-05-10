import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MeasurementService {
  private apiUrl = 'http://localhost:3000';
  private socket: Socket;

  constructor(private http: HttpClient) {
    this.socket = io(this.apiUrl);
    
    // Debug socket connection
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });
    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  getLatestMeasurement() {
    return this.http.get(`${this.apiUrl}/measurements/latest`);
  }

  onNewMeasurement(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('new-measurement', (data) => {
        console.log('Received via socket:', data); // debug
        observer.next(data);
      });
      
      // Handle cleanup
      return () => {
        this.socket.off('new-measurement');
      };
    });
  }

  getMeasurementHistory() {
    return this.http.get<any[]>(`${this.apiUrl}/measurements/history`);
  }

  getAlerts() {
    return this.http.get<any[]>(`${this.apiUrl}/alerts`);
  }

  onNewAlert(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('new-alert', (data) => observer.next(data));
      return () => this.socket.off('new-alert');
    });
  }
}