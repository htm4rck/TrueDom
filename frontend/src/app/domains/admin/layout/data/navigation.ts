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
    id: 'operaciones',
    label: 'Operaciones DLP',
    children: [
      {
        id: 'governance-center',
        label: 'Centro de Gobierno',
        icon: 'shield-check',
        route: '/admin/dashboard',
      },
      {
        id: 'cargas',
        label: 'Cargas mensuales',
        icon: 'cloud-upload',
        route: '/admin/carga-lote',
      },
      {
        id: 'lotes',
        label: 'Procesamiento',
        icon: 'database-zap',
        route: '/admin/lotes',
      },
    ],
  },
  {
    id: 'validacion-riesgo',
    label: 'Validación y Riesgo',
    children: [
      {
        id: 'dominios-pendientes',
        label: 'Dominios pendientes',
        icon: 'globe-lock',
        route: '/admin/dominios-pendientes',
      },
      {
        id: 'destinatarios-pendientes',
        label: 'Destinatarios pendientes',
        icon: 'mail-question-mark',
        route: '/admin/destinatarios-pendientes',
      },
      {
        id: 'inconsistencias',
        label: 'Inconsistencias críticas',
        icon: 'badge-alert',
        route: '/admin/inconsistencias',
      },
    ],
  },
  {
    id: 'gobierno',
    label: 'Gobierno',
    children: [
      {
        id: 'catalogo-seguro',
        label: 'Catálogo seguro',
        icon: 'shield-plus',
        route: '/admin/listas-dominios',
      },
      {
        id: 'catalogo-restringido',
        label: 'Catálogo restringido',
        icon: 'shield-x',
        route: '/admin/listas-destinatarios',
      },
      {
        id: 'auditoria',
        label: 'Auditoría y evidencias',
        icon: 'scroll-text',
        route: '/admin/auditoria',
      },
    ],
  },
  {
    id: 'analitica',
    label: 'Analítica',
    children: [
      {
        id: 'reportes',
        label: 'Reportes ejecutivos',
        icon: 'chart-column',
        route: '/admin/reportes',
      },
    ],
  },
];
