import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@/environments/environment';

@Component({
  selector: 'dlp-reportes',
  imports: [JsonPipe, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div>
        <div class="text-2xl font-semibold tracking-tight">Reportes</div>
        <div class="mt-1 text-sm text-neutral-500">Exportacion operativa y ejecutiva para seguimiento DLP.</div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        @for (report of reports; track report.id) {
          <mat-card appearance="filled">
            <mat-card-content class="flex items-start gap-4">
              <div class="rounded-md bg-neutral-100 p-2 dark:bg-neutral-800">
                <mat-icon [svgIcon]="report.icon" />
              </div>
              <div class="min-w-0 flex-auto">
                <div class="font-medium">{{ report.title }}</div>
                <div class="mt-1 text-sm text-neutral-500">{{ report.description }}</div>
                <button class="mt-3" matButton="tonal" (click)="exportar(report.id)">
                  <mat-icon svgIcon="download" />Exportar CSV
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      @if (resumen()) {
        <mat-card appearance="filled">
          <mat-card-header><div class="font-medium">Resumen mensual</div></mat-card-header>
          <mat-card-content>
            <pre class="text-sm">{{ resumen() | json }}</pre>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
})
export default class ReportesPage {
  private http = inject(HttpClient);
  protected resumen = signal<any>(null);
  protected reports = [
    { id: 'mensual', title: 'Resumen mensual', description: 'Totales de carga, procesamiento, pendientes e inconsistencias', icon: 'chart-column' },
    { id: 'dominios', title: 'Reporte por dominio', description: 'Frecuencia, estado, usuarios afectados y clasificacion', icon: 'globe' },
    { id: 'destinatarios', title: 'Reporte por destinatario', description: 'Decisiones por usuario, justificaciones y estado final', icon: 'users' },
    { id: 'usuarios', title: 'Reporte por usuario', description: 'Incidentes, pendientes, aprobaciones y rechazos', icon: 'user' },
  ];

  constructor() {
    this.http.get<any>(`${environment.apiUrl}/dashboard/resumen`).subscribe((res) => this.resumen.set(res.data));
  }

  exportar(tipo: string) {
    this.http.get<any>(`${environment.apiUrl}/dashboard/resumen`).subscribe((res) => {
      const data = res.data;
      const csv = Object.entries(data).map(([k, v]) => `${k},${v}`).join('\n');
      const blob = new Blob(['campo,valor\n' + csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${tipo}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
