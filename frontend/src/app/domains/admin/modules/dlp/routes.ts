import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard'),
  },
  {
    path: 'carga-lote',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'upload' },
  },
  {
    path: 'lotes',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'lots' },
  },
  {
    path: 'dominios-pendientes',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'domains' },
  },
  {
    path: 'destinatarios-pendientes',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'recipients' },
  },
  {
    path: 'listas-dominios',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'domainLists' },
  },
  {
    path: 'listas-destinatarios',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'recipientLists' },
  },
  {
    path: 'inconsistencias',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'inconsistencies' },
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'reports' },
  },
  {
    path: 'auditoria',
    loadComponent: () => import('./features/operation-page').then((m) => m.OperationPage),
    data: { view: 'audit' },
  },
];

export default routes;
