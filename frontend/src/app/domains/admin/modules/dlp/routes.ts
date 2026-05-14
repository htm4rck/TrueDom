import { Routes } from '@angular/router';

const routes: Routes = [
  { path: 'dashboard', loadComponent: () => import('./features/dashboard') },
  { path: 'carga-lote', loadComponent: () => import('./features/carga-lote') },
  { path: 'lotes', loadComponent: () => import('./features/lotes') },
  { path: 'lotes/:id', loadComponent: () => import('./features/lote-detalle') },
  { path: 'lotes/:id/resultado', loadComponent: () => import('./features/procesamiento-resultado') },
  { path: 'dominios-pendientes', loadComponent: () => import('./features/dominios-pendientes') },
  { path: 'destinatarios-pendientes', loadComponent: () => import('./features/destinatarios-pendientes') },
  { path: 'listas-dominios', loadComponent: () => import('./features/listas-dominios') },
  { path: 'listas-destinatarios', loadComponent: () => import('./features/listas-destinatarios') },
  { path: 'inconsistencias', loadComponent: () => import('./features/inconsistencias') },
  { path: 'reportes', loadComponent: () => import('./features/reportes') },
  { path: 'auditoria', loadComponent: () => import('./features/auditoria') },
];

export default routes;
