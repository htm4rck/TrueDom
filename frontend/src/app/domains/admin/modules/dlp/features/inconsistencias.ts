import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DlpApiService, Inconsistencia } from '../services/dlp-api.service';
import { ValidacionDialogComponent } from './validacion-dialog';

@Component({
  selector: 'dlp-inconsistencias',
  imports: [MatButtonModule, MatCardModule, MatDialogModule, MatIconModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="text-2xl font-semibold tracking-tight">Inconsistencias</div>
      <div class="text-sm text-neutral-500">Decisiones contradictorias y resolucion administrativa.</div>

      <mat-card appearance="filled">
        <mat-card-content class="overflow-auto p-0">
          <table class="w-full min-w-140 text-left text-sm">
            <thead class="text-neutral-500">
              <tr><th class="px-6 py-3">Destinatario</th><th>Dominio</th><th>Estado</th><th>Decision final</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              @for (item of items(); track item.id) {
                <tr class="border-t">
                  <td class="px-6 py-4 font-medium">{{ item.destinatario }}</td>
                  <td>{{ item.dominio }}</td>
                  <td>{{ item.estado }}</td>
                  <td>{{ item.decisionFinal || '-' }}</td>
                  <td class="px-6 py-3">
                    @if (item.estado === 'ABIERTA') {
                      <button matButton="tonal" (click)="resolver(item)"><mat-icon svgIcon="gavel" />Resolver</button>
                    } @else {
                      <span class="text-neutral-400">{{ item.resueltoPor }}</span>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="px-6 py-8 text-center text-neutral-400">Sin inconsistencias abiertas</td></tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export default class InconsistenciasPage {
  private api = inject(DlpApiService);
  private dialog = inject(MatDialog);
  protected items = signal<Inconsistencia[]>([]);

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.api.getInconsistencias().subscribe((data) => this.items.set(data));
  }

  resolver(item: Inconsistencia) {
    const ref = this.dialog.open(ValidacionDialogComponent, {
      data: { titulo: `Resolver inconsistencia: ${item.destinatario}`, decision: 'RESOLVER' },
      width: '400px',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.api.resolverInconsistencia(item.id, 'SEGURO', result.justificacion, result.usuario).subscribe(() => this.cargar());
      }
    });
  }
}
