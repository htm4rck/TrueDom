import { Component, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DlpApiService, PendienteDestinatario } from '../services/dlp-api.service';
import { ValidacionDialogComponent } from './validacion-dialog';

@Component({
  selector: 'dlp-destinatarios-pendientes',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatDialogModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="flex items-end gap-4">
        <div>
          <div class="text-2xl font-semibold tracking-tight">Bandeja de destinatarios pendientes</div>
          <div class="mt-1 text-sm text-neutral-500">Validaciones asignadas al usuario Alicorp responsable.</div>
        </div>
        <div class="flex-auto"></div>
        <mat-form-field appearance="outline" class="w-72">
          <mat-label>Correo usuario Alicorp</mat-label>
          <input matInput [value]="correo()" (input)="correo.set($any($event.target).value)" (keyup.enter)="buscar()" />
        </mat-form-field>
        <button matButton="filled" (click)="buscar()"><mat-icon svgIcon="search" />Buscar</button>
      </div>

      @if (totalItems() > 0) {
        <div class="text-sm text-neutral-500">{{ totalItems() }} pendientes. Página {{ page() + 1 }} de {{ totalPages() }}.</div>
      }

      <mat-card appearance="filled">
        <mat-card-content class="overflow-auto p-0">
          <table class="w-full min-w-140 text-left text-sm">
            <thead class="bg-neutral-50 text-neutral-500 dark:bg-neutral-800/50">
              <tr>
                <th class="px-5 py-3">Destinatario</th>
                <th>Dominio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (item of paginatedItems(); track item.id) {
                <tr class="border-t">
                  <td class="px-5 py-3 font-medium">{{ item.destinatario }}</td>
                  <td>{{ item.dominio }}</td>
                  <td class="flex gap-2 py-2">
                    <button matButton="filled" class="!bg-emerald-600" (click)="validar(item, 'SEGURO')">Seguro</button>
                    <button matButton="filled" class="!bg-red-600" (click)="validar(item, 'NO_SEGURO')">No seguro</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="3" class="px-5 py-12 text-center text-neutral-400">
                  @if (!correo()) { Ingresa tu correo corporativo para consultar pendientes. }
                  @else { Sin destinatarios pendientes para {{ correo() }}. }
                </td></tr>
              }
            </tbody>
          </table>
        </mat-card-content>
      </mat-card>

      @if (totalPages() > 1) {
        <div class="flex items-center justify-center gap-2">
          <button matButton="tonal" [disabled]="page() === 0" (click)="page.set(page() - 1)">
            <mat-icon svgIcon="chevron-left" />Anterior
          </button>
          <span class="text-sm text-neutral-500">{{ page() + 1 }} / {{ totalPages() }}</span>
          <button matButton="tonal" [disabled]="page() >= totalPages() - 1" (click)="page.set(page() + 1)">
            Siguiente<mat-icon svgIcon="chevron-right" />
          </button>
        </div>
      }
    </div>
  `,
})
export default class DestinatariosPendientesPage {
  private api = inject(DlpApiService);
  private dialog = inject(MatDialog);
  protected correo = signal('');
  private allItems = signal<PendienteDestinatario[]>([]);
  protected page = signal(0);
  private pageSize = 20;

  protected totalItems = computed(() => this.allItems().length);
  protected totalPages = computed(() => Math.max(1, Math.ceil(this.allItems().length / this.pageSize)));
  protected paginatedItems = computed(() => {
    const start = this.page() * this.pageSize;
    return this.allItems().slice(start, start + this.pageSize);
  });

  buscar() {
    const c = this.correo();
    if (c) {
      this.page.set(0);
      this.api.getMisPendientes(c).subscribe((data) => this.allItems.set(data));
    }
  }

  validar(item: PendienteDestinatario, decision: string) {
    const ref = this.dialog.open(ValidacionDialogComponent, {
      data: { titulo: `Marcar ${item.destinatario} como ${decision}`, decision },
      width: '400px',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.api.validarDestinatario(item.id, decision, result.justificacion, result.usuario).subscribe(() => this.buscar());
      }
    });
  }
}
