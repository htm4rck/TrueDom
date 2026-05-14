import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '@/environments/environment';

@Component({
  selector: 'dlp-auditoria',
  imports: [DatePipe, MatCardModule, MatIconModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div>
        <div class="text-2xl font-semibold tracking-tight">Auditoria</div>
        <div class="mt-1 text-sm text-neutral-500">Trazabilidad de cargas, validaciones, listas y resoluciones.</div>
      </div>

      <mat-card appearance="filled">
        <mat-card-content class="overflow-auto p-0">
          <table class="w-full min-w-160 text-left text-sm">
            <thead class="text-neutral-500">
              <tr><th class="px-6 py-3">Fecha</th><th>Usuario</th><th>Entidad</th><th>Accion</th><th>Detalle</th></tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr class="border-t">
                  <td class="px-6 py-4">{{ item.fechaEvento | date:'short' }}</td>
                  <td>{{ item.usuario }}</td>
                  <td class="font-medium">{{ item.entidad }}</td>
                  <td>{{ item.accion }}</td>
                  <td class="max-w-60 truncate text-xs text-neutral-500">{{ item.detalle }}</td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="px-6 py-8 text-center text-neutral-400">Sin registros de auditoria</td></tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export default class AuditoriaPage {
  private http = inject(HttpClient);
  protected items = signal<any[]>([]);

  constructor() {
    this.http.get<any>(`${environment.apiUrl}/auditoria`).subscribe((res) => this.items.set(res.data || []));
  }
}
