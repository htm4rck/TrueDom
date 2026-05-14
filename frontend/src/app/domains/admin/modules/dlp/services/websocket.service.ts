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

  progreso = signal<ProgresoLote | null>(null);

  connect() {
    if (this.client?.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      debug: () => {},
    });

    this.client.activate();
  }

  subscribeLote(loteId: number, callback: (p: ProgresoLote) => void): () => void {
    this.connect();

    let subscription: any = null;

    const doSubscribe = () => {
      subscription = this.client!.subscribe(`/topic/lotes/${loteId}/progreso`, (msg: IMessage) => {
        const data = JSON.parse(msg.body) as ProgresoLote;
        this.progreso.set(data);
        callback(data);
      });
    };

    if (this.client!.connected) {
      doSubscribe();
    } else {
      this.client!.onConnect = () => doSubscribe();
    }

    // Return unsubscribe function
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }

  disconnect() {
    this.client?.deactivate();
    this.client = null;
  }
}
