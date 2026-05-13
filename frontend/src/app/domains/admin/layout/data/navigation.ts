import { IsActiveMatchOptions } from '@angular/router';

export type NavigationItem = {
  id: string;
  label: string;
  description?: string;
  route?: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
  disabled?: boolean;
  expanded?: boolean;
  activeOptions?: { exact: boolean } | IsActiveMatchOptions;
};

export const NAVIGATION: NavigationItem[] = [
  {
    id: 'operacion',
    label: 'Operacion DLP',
    description: 'Carga, procesamiento y validaciones',
    children: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'layout-dashboard',
        route: '/admin/dashboard',
      },
      {
        id: 'lotes',
        label: 'Lotes DLP',
        icon: 'database-zap',
        route: '/admin/lotes',
      },
      {
        id: 'carga',
        label: 'Carga mensual',
        icon: 'upload-cloud',
        route: '/admin/carga-lote',
      },
    ],
  },
  {
    id: 'validacion',
    label: 'Validacion',
    description: 'Dominios, destinatarios e inconsistencias',
    children: [
      {
        id: 'dominios-pendientes',
        label: 'Dominios pendientes',
        icon: 'globe-lock',
        badge: '18',
        route: '/admin/dominios-pendientes',
      },
      {
        id: 'destinatarios-pendientes',
        label: 'Mis destinatarios',
        icon: 'mail-question',
        badge: '42',
        route: '/admin/destinatarios-pendientes',
      },
      {
        id: 'inconsistencias',
        label: 'Inconsistencias',
        icon: 'badge-alert',
        badge: '7',
        route: '/admin/inconsistencias',
      },
    ],
  },
  {
    id: 'catalogos',
    label: 'Catalogos',
    description: 'Listas blancas y negras',
    children: [
      {
        id: 'dominios-listas',
        label: 'Listas de dominios',
        icon: 'shield-check',
        route: '/admin/listas-dominios',
      },
      {
        id: 'destinatarios-listas',
        label: 'Listas de destinatarios',
        icon: 'user-check',
        route: '/admin/listas-destinatarios',
      },
    ],
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    description: 'Reportes y trazabilidad',
    children: [
      {
        id: 'reportes',
        label: 'Reportes',
        icon: 'chart-column',
        route: '/admin/reportes',
      },
      {
        id: 'auditoria',
        label: 'Auditoria',
        icon: 'logs',
        route: '/admin/auditoria',
      },
    ],
  },
];
