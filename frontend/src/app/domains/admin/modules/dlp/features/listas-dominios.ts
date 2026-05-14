import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { DlpApiService, CatalogoDominio } from '../services/dlp-api.service';

@Component({
  selector: 'dlp-listas-dominios',
  imports: [FormsModule, MatButtonModule, MatCardModule, MatIconModule, MatInputModule, MatTabsModule],
  template: `
    <div class="mx-auto flex w-full max-w-7xl flex-auto flex-col gap-5 p-6 lg:p-8">
      <div class="text-2xl font-semibold tracking-tight">Listas de dominios</div>

      <mat-tab-group>
        <mat-tab label="Lista blanca">
          <div class="flex gap-3 p-4">
            <mat-form-field appearance="outline"><mat-label>Dominio</mat-label><input matInput [(ngModel)]="nuevoDominio" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Justificacion</mat-label><input matInput [(ngModel)]="nuevaJustificacion" /></mat-form-field>
            <button matButton="filled" [disabled]="!nuevoDominio || !nuevaJustificacion" (click)="agregar(true)">
              <mat-icon svgIcon="plus" />Agregar
            </button>
          </div>
          <table class="w-full text-left text-sm">
            <thead class="text-neutral-500"><tr><th class="px-6 py-3">Dominio</th><th>Activo</th><th>Justificacion</th><th>Creado por</th><th></th></tr></thead>
            <tbody>
              @for (d of blancos(); track d.id) {
                <tr class="border-t">
                  <td class="px-6 py-4 font-medium">{{ d.dominio }}</td>
                  <td>{{ d.activo ? 'Si' : 'No' }}</td>
                  <td>{{ d.justificacion }}</td>
                  <td>{{ d.creadoPor }}</td>
                  <td class="flex gap-1">
                    <button matButton="tonal" (click)="toggle(d.id, true)">{{ d.activo ? 'Desactivar' : 'Activar' }}</button>
                    <button matButton="tonal" class="text-red-600" (click)="eliminar(d.id, true)">Eliminar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </mat-tab>
        <mat-tab label="Lista negra">
          <div class="flex gap-3 p-4">
            <mat-form-field appearance="outline"><mat-label>Dominio</mat-label><input matInput [(ngModel)]="nuevoDominio" /></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Justificacion</mat-label><input matInput [(ngModel)]="nuevaJustificacion" /></mat-form-field>
            <button matButton="filled" [disabled]="!nuevoDominio || !nuevaJustificacion" (click)="agregar(false)">
              <mat-icon svgIcon="plus" />Agregar
            </button>
          </div>
          <table class="w-full text-left text-sm">
            <thead class="text-neutral-500"><tr><th class="px-6 py-3">Dominio</th><th>Activo</th><th>Justificacion</th><th>Creado por</th><th></th></tr></thead>
            <tbody>
              @for (d of negros(); track d.id) {
                <tr class="border-t">
                  <td class="px-6 py-4 font-medium">{{ d.dominio }}</td>
                  <td>{{ d.activo ? 'Si' : 'No' }}</td>
                  <td>{{ d.justificacion }}</td>
                  <td>{{ d.creadoPor }}</td>
                  <td class="flex gap-1">
                    <button matButton="tonal" (click)="toggle(d.id, false)">{{ d.activo ? 'Desactivar' : 'Activar' }}</button>
                    <button matButton="tonal" class="text-red-600" (click)="eliminar(d.id, false)">Eliminar</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export default class ListasDominiosPage {
  private api = inject(DlpApiService);
  protected blancos = signal<CatalogoDominio[]>([]);
  protected negros = signal<CatalogoDominio[]>([]);
  protected nuevoDominio = '';
  protected nuevaJustificacion = '';

  constructor() {
    this.cargar();
  }

  private cargar() {
    this.api.getDominiosBlancos().subscribe((d) => this.blancos.set(d));
    this.api.getDominiosNegros().subscribe((d) => this.negros.set(d));
  }

  agregar(blanco: boolean) {
    const obs = blanco
      ? this.api.agregarDominioBlanco(this.nuevoDominio, this.nuevaJustificacion, 'admin')
      : this.api.agregarDominioNegro(this.nuevoDominio, this.nuevaJustificacion, 'admin');
    obs.subscribe(() => {
      this.nuevoDominio = '';
      this.nuevaJustificacion = '';
      this.cargar();
    });
  }

  toggle(id: number, blanco: boolean) {
    this.api.toggleDominio(id, blanco, 'admin').subscribe(() => this.cargar());
  }

  eliminar(id: number, blanco: boolean) {
    if (!confirm('¿Eliminar este dominio del catálogo?')) return;
    const obs = blanco ? this.api.eliminarDominioBlanco(id, 'admin') : this.api.eliminarDominioNegro(id, 'admin');
    obs.subscribe(() => this.cargar());
  }
}
