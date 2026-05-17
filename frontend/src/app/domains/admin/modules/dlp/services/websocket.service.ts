import { Injectable, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '@/environments/environment';

export interface ProgresoLote {
  loteId: number;
  fase: string;
  registrosLeidos: number;
  totalEstimado: number;
  porcentaje: number;
  dominiosEncontrados: number;
  destinatariosEncontrados: number;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: Client | null = null;
  private wsUrl = environment.apiUrl.replace('/api', '/ws');
  private subscription: any = null;
  private activeLoteId: number | null = null;

  /** Persisted progress signal — survives navigation */
  progreso = signal<ProgresoLote | null>(null);

  connect() {
    if (this.client?.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        // Re-subscribe if there was an active lote
        if (this.activeLoteId != null) {
          this.doSubscribe(this.activeLoteId);
        }
      },
    });

    this.client.activate();
  }

  subscribeLote(loteId: number) {
    this.activeLoteId = loteId;
    this.connect();

    if (this.client?.connected) {
      this.doSubscribe(loteId);
    }
  }

  private doSubscribe(loteId: number) {
    // Unsubscribe previous if any
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    this.subscription = this.client!.subscribe(`/topic/lotes/${loteId}/progreso`, (msg: IMessage) => {
      const data = JSON.parse(msg.body) as ProgresoLote;
      this.progreso.set(data);

      // Clear active tracking when done
      if (data.fase === 'COMPLETADO' || data.fase === 'ERROR') {
        this.activeLoteId = null;
      }
    });
  }

  /** Whether there's an active upload in progress */
  get isActive(): boolean {
    const p = this.progreso();
    return p != null && p.fase !== 'COMPLETADO' && p.fase !== 'ERROR';
  }

  clear() {
    this.progreso.set(null);
    this.activeLoteId = null;
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  disconnect() {
    this.clear();
    this.client?.deactivate();
    this.client = null;
  }
}
