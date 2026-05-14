import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { DlpApiService, CatalogoDestinatario } from '../services/dlp-api.service';

@Component({
  selector: 'dlp-listas-destinatarios',
  imports: [MatButtonModule, MatCardModule, MatTabsModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="text-2xl font-semibold tracking-tight">Listas de destinatarios</div>

      <mat-tab-group>
        <mat-tab label="Lista blanca">
          <table class="w-full text-left text-sm">
            <thead class="text-neutral-500"><tr><th class="px-6 py-3">Destinatario</th><th>Usuario Alicorp</th><th>Activo</th><th>Justificacion</th><th></th></tr></thead>
            <tbody>
              @for (d of blancos(); track d.id) {
                <tr class="border-t">
                  <td class="px-6 py-4 font-medium">{{ d.destinatario }}</td>
                  <td>{{ d.correoUsuarioAlicorp }}</td>
                  <td>{{ d.activo ? 'Si' : 'No' }}</td>
                  <td>{{ d.justificacion }}</td>
                  <td><button matButton="tonal" class="text-red-600" (click)="eliminar(d.id, true)">Eliminar</button></td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="px-6 py-8 text-center text-neutral-400">Sin registros</td></tr>
              }
            </tbody>
          </table>
        </mat-tab>
        <mat-tab label="Lista negra">
          <table class="w-full text-left text-sm">
            <thead class="text-neutral-500"><tr><th class="px-6 py-3">Destinatario</th><th>Usuario Alicorp</th><th>Activo</th><th>Justificacion</th><th></th></tr></thead>
            <tbody>
              @for (d of negros(); track d.id) {
                <tr class="border-t">
                  <td class="px-6 py-4 font-medium">{{ d.destinatario }}</td>
                  <td>{{ d.correoUsuarioAlicorp }}</td>
                  <td>{{ d.activo ? 'Si' : 'No' }}</td>
                  <td>{{ d.justificacion }}</td>
                  <td><button matButton="tonal" class="text-red-600" (click)="eliminar(d.id, false)">Eliminar</button></td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="px-6 py-8 text-center text-neutral-400">Sin registros</td></tr>
              }
            </tbody>
          </table>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export default class ListasDestinatariosPage {
  private api = inject(DlpApiService);
  protected blancos = signal<CatalogoDestinatario[]>([]);
  protected negros = signal<CatalogoDestinatario[]>([]);

  constructor() {
    this.api.getDestinatariosBlancos().subscribe((d) => this.blancos.set(d));
    this.api.getDestinatariosNegros().subscribe((d) => this.negros.set(d));
  }

  eliminar(id: number, blanco: boolean) {
    if (!confirm('¿Eliminar este destinatario del catálogo?')) return;
    const obs = blanco ? this.api.eliminarDestinatarioBlanco(id, 'admin') : this.api.eliminarDestinatarioNegro(id, 'admin');
    obs.subscribe(() => {
      this.api.getDestinatariosBlancos().subscribe((d) => this.blancos.set(d));
      this.api.getDestinatariosNegros().subscribe((d) => this.negros.set(d));
    });
  }
}
