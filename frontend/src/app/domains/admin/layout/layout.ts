import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Media } from '@/app/core/media';
import { LanguageSwitcher } from '@/app/domains/admin/layout/ui/language-switcher';
import { Notifications } from '@/app/domains/admin/layout/ui/notifications';
import { SchemeSwitcher } from '@/app/domains/admin/layout/ui/scheme-switcher';
import { AdminSidebar } from '@/app/domains/admin/layout/ui/sidebar';

@Component({
  selector: 'admin-layout',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    AdminSidebar,
    SchemeSwitcher,
    Notifications,
    LanguageSwitcher,
  ],
  template: `
    <mat-sidenav-container>
      <mat-sidenav
        class="w-70 border-r border-[#0F2E46] bg-[#071B2A] text-[#E6EDF3]"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        [disableClose]="!isMobile()"
        fixedInViewport
        #sidenav="matSidenav"
      >
        <admin-sidebar />
      </mat-sidenav>

      <mat-sidenav-content>
        <!-- Toolbar -->
        <div class="flex items-center border-b border-neutral-200 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-[#071B2A]">
          <button
            matIconButton
            (click)="sidenav.toggle()"
          >
            <mat-icon svgIcon="panel-left" />
          </button>

          <!-- Spacer -->
          <div class="ml-3 flex min-w-0 flex-col">
            <div class="truncate text-sm font-semibold text-[#071B2A] dark:text-[#E6EDF3]">DLP Governance Center</div>
            <div class="truncate text-[10px] font-medium uppercase tracking-wider text-[#8FA3B8]">
              Security Risk & Compliance
            </div>
          </div>

          <div class="flex-auto"></div>

          <div class="flex items-center gap-x-2">
            <language-switcher />
            <scheme-switcher />
            <notifications />
          </div>
        </div>

        <!-- Content -->
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export class AdminLayout {
  // Dependencies
  private media = inject(Media);

  // State
  protected isMobile = computed(() =>
    this.media.match(`(max-width: 1023px)`)()
  );
}
