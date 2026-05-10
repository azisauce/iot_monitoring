import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart,
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Filler, Tooltip, Legend
} from 'chart.js';
import { MeasurementService } from '../services/measurement.service';
import { AuthService } from '../services/auth.service';

Chart.register(
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, Filler, Tooltip, Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  measurement: any;
  alerts: any[] = [];

  labels: string[] = [];
  tempData: number[] = [];
  humidityData: number[] = [];

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        borderColor: '#E2603A',
        backgroundColor: 'rgba(226,96,58,0.08)',
        pointBackgroundColor: '#E2603A',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        yAxisID: 'yTemp',
      },
      {
        label: 'Humidity (%)',
        data: [],
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29,158,117,0.08)',
        pointBackgroundColor: '#1D9E75',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
        yAxisID: 'yHumidity',
      },
    ],
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#ccc',
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#888', font: { size: 11 }, maxRotation: 45, autoSkip: true, maxTicksLimit: 10 },
      },
      yTemp: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#E2603A', font: { size: 11 }, callback: (v) => `${v}°` },
      },
      yHumidity: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#1D9E75', font: { size: 11 }, callback: (v) => `${v}%` },
      },
    },
  };

  constructor(
    private measurementService: MeasurementService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
    this.loadAlerts();

    this.measurementService.onNewMeasurement().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.measurement = data;
          this.pushPoint(data);
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Socket error:', err),
    });

    this.measurementService.onNewAlert().subscribe({
      next: (alert) => {
        this.ngZone.run(() => {
          this.alerts.unshift(alert); // newest first
          this.alerts = this.alerts.slice(0, 10); // keep last 10
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Alert socket error:', err),
    });
  }

  loadAlerts() {
    this.measurementService.getAlerts().subscribe({
      next: (data: any[]) => {
        this.alerts = data.slice(0, 10); // keep last 10
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Alerts error:', err),
    });
  }

  loadHistory() {
    this.measurementService.getMeasurementHistory().subscribe({
      next: (data: any[]) => {
        this.measurement = data[data.length - 1];
        const labels = data.map((m) => this.formatTime(m.created_at));
        const temps = data.map((m) => m.temperature);
        const hums = data.map((m) => m.humidity);

        this.chartData = {
          ...this.chartData,
          labels,
          datasets: [
            { ...this.chartData.datasets[0], data: temps },
            { ...this.chartData.datasets[1], data: hums },
          ],
        };
        this.cdr.detectChanges();
      },
      error: (err) => console.error('History error:', err),
    });
  }

  pushPoint(m: any) {
    const label = this.formatTime(m.created_at ?? new Date().toISOString());
    const maxPoints = 20;

    const labels = [...(this.chartData.labels as string[]), label].slice(-maxPoints);
    const temps = [...this.chartData.datasets[0].data as number[], m.temperature].slice(-maxPoints);
    const hums = [...this.chartData.datasets[1].data as number[], m.humidity].slice(-maxPoints);

    this.chartData = {
      ...this.chartData,
      labels,
      datasets: [
        { ...this.chartData.datasets[0], data: temps },
        { ...this.chartData.datasets[1], data: hums },
      ],
    };
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  get latestTemp() { return this.measurement?.temperature ?? '--'; }
  get latestHumidity() { return this.measurement?.humidity ?? '--'; }
  get deviceId() { return this.measurement?.device_id ?? this.measurement?.deviceId ?? '--'; }

  logout(): void {
    this.auth.logout();
  }
}