import { Component, computed, inject, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexLegend, ApexNonAxisChartSeries, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ChartComponent } from 'ng-apexcharts';
import { Theming } from '@/app/core/theming';
import { inconsistencies, kpis, lots, pendingDomains } from '../data/dlp-data';

@Component({
  selector: 'dlp-dashboard',
  imports: [ChartComponent, MatButtonModule, MatCardModule, MatIconModule, MatSelectModule],
  template: `
    <div class="@container mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div class="min-w-0">
          <div class="text-2xl font-semibold tracking-tight">Dashboard DLP TrueDom</div>
          <div class="mt-1 text-sm text-neutral-500">Periodo abril 2026, lote mensual con seguimiento operativo y ejecutivo.</div>
        </div>
        <div class="flex-auto"></div>
        <mat-form-field class="w-full lg:w-48" appearance="outline">
          <mat-label>Periodo</mat-label>
          <mat-select value="2026-04">
            <mat-option value="2026-04">Abril 2026</mat-option>
            <mat-option value="2026-03">Marzo 2026</mat-option>
          </mat-select>
        </mat-form-field>
        <button matButton="filled"><mat-icon svgIcon="download" />Exportar</button>
      </div>

      <div class="grid gap-4 @md:grid-cols-2 @4xl:grid-cols-3">
        @for (item of kpis; track item.label) {
          <mat-card appearance="filled">
            <mat-card-content class="flex items-start gap-4">
              <div class="rounded-md bg-white p-2 shadow-sm dark:bg-neutral-900">
                <mat-icon [class]="item.tone" [svgIcon]="item.icon" />
              </div>
              <div class="min-w-0">
                <div class="text-sm text-neutral-500">{{ item.label }}</div>
                <div class="mt-1 text-3xl font-semibold tracking-tight">{{ item.value }}</div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <mat-card appearance="filled">
          <mat-card-header>
            <div class="flex items-center gap-2 font-medium"><mat-icon class="size-4" svgIcon="chart-column" />Registros por estado</div>
          </mat-card-header>
          <mat-card-content>
            <apx-chart class="block h-80" [chart]="bar.chart" [series]="bar.series" [dataLabels]="bar.dataLabels" [plotOptions]="bar.plotOptions" [xaxis]="bar.xaxis" [tooltip]="tooltip()" />
          </mat-card-content>
        </mat-card>
        <mat-card appearance="filled">
          <mat-card-header>
            <div class="flex items-center gap-2 font-medium"><mat-icon class="size-4" svgIcon="chart-pie" />Clasificacion del lote</div>
          </mat-card-header>
          <mat-card-content>
            <apx-chart class="block h-80" [chart]="donut.chart" [labels]="donut.labels" [legend]="donut.legend" [plotOptions]="donut.plotOptions" [series]="donut.series" [stroke]="donut.stroke" [tooltip]="tooltip()" />
          </mat-card-content>
        </mat-card>
      </div>

      <div class="grid gap-5 lg:grid-cols-2">
        <mat-card appearance="filled">
          <mat-card-header><div class="font-medium">Dominios pendientes criticos</div></mat-card-header>
          <mat-card-content class="overflow-auto p-0">
            <table class="w-full min-w-160 text-left text-sm">
              <thead class="text-neutral-500"><tr><th class="px-6 py-3">Dominio</th><th>Registros</th><th>Usuarios</th><th>Destinatarios</th></tr></thead>
              <tbody>
                @for (row of pendingDomains; track row[0]) {
                  <tr class="border-t"><td class="px-6 py-4 font-medium">{{ row[0] }}</td><td>{{ row[1] }}</td><td>{{ row[2] }}</td><td>{{ row[3] }}</td></tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
        <mat-card appearance="filled">
          <mat-card-header><div class="font-medium">Inconsistencias abiertas</div></mat-card-header>
          <mat-card-content class="overflow-auto p-0">
            <table class="w-full min-w-140 text-left text-sm">
              <thead class="text-neutral-500"><tr><th class="px-6 py-3">Destinatario</th><th>Seguros</th><th>No seguros</th><th>Estado</th></tr></thead>
              <tbody>
                @for (row of inconsistencies; track row[0]) {
                  <tr class="border-t"><td class="px-6 py-4 font-medium">{{ row[0] }}</td><td>{{ row[2] }}</td><td>{{ row[3] }}</td><td>{{ row[4] }}</td></tr>
                }
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card appearance="filled">
        <mat-card-header><div class="font-medium">Ultimos lotes cargados</div></mat-card-header>
        <mat-card-content class="overflow-auto p-0">
          <table class="w-full min-w-180 text-left text-sm">
            <thead class="text-neutral-500"><tr><th class="px-6 py-3">Periodo</th><th>Archivo</th><th>Estado</th><th>Cargados</th><th>Procesados</th><th>Usuario</th></tr></thead>
            <tbody>
              @for (row of lots; track row[0]) {
                <tr class="border-t"><td class="px-6 py-4 font-medium">{{ row[0] }}</td><td>{{ row[1] }}</td><td>{{ row[2] }}</td><td>{{ row[3] }}</td><td>{{ row[4] }}</td><td>{{ row[5] }}</td></tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export default class DlpDashboard {
  private theming = inject(Theming);
  protected kpis = kpis;
  protected lots = lots;
  protected pendingDomains = pendingDomains;
  protected inconsistencies = inconsistencies;
  protected tooltip: Signal<ApexTooltip> = computed(() => ({ theme: this.theming.isDark() ? 'dark' : 'light' }));
  protected bar: { chart: ApexChart; dataLabels: ApexDataLabels; plotOptions: ApexPlotOptions; series: ApexAxisChartSeries; xaxis: ApexXAxis } = {
    chart: { type: 'bar', height: '100%', toolbar: { show: false }, fontFamily: 'inherit' },
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: 4, columnWidth: '45%' } },
    series: [{ name: 'Registros', data: [94820, 12440, 38610, 4218, 338, 7] }],
    xaxis: { categories: ['Dominio seguro', 'Dominio no seguro', 'Dest. seguro', 'Dest. pendiente', 'Dest. no seguro', 'Inconsistente'] },
  };
  protected donut: { chart: ApexChart; labels: string[]; legend: ApexLegend; plotOptions: ApexPlotOptions; series: ApexNonAxisChartSeries; stroke: ApexStroke } = {
    chart: { type: 'donut', height: '100%', toolbar: { show: false }, fontFamily: 'inherit' },
    labels: ['Seguro', 'No seguro', 'Pendiente', 'Inconsistente'],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '68%' } } },
    series: [133430, 12778, 4218, 7],
    stroke: { width: 0 },
  };
}
