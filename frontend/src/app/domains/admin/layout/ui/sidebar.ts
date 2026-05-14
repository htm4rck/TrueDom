import { Component } from '@angular/core';
import { Navigation } from '@/app/domains/admin/layout/ui/navigation';
import { User } from '@/app/domains/admin/layout/ui/user';

@Component({
  selector: 'admin-sidebar',
  imports: [Navigation, User],
  host: {
    class: 'flex w-full flex-auto flex-col',
  },
  template: `
    <!-- Header -->
    <div class="relative flex items-center gap-x-3 px-6 pt-6 pb-2">
      <img src="/images/logo/logo.png" alt="TrueDom" class="size-10 rounded-lg object-cover ring-1 ring-[#0F2E46]" />
      <div class="flex flex-col">
        <div class="text-lg leading-none font-bold tracking-wide text-[#E6EDF3]">TrueDom</div>
        <div class="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#2D7FF9]">
          Governance Platform
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="mx-6 mt-4 border-t border-[#0F2E46]"></div>

    <!-- Navigation -->
    <navigation class="mt-4 mb-4 flex-auto" />

    <!-- Spacer -->
    <div class="flex-auto"></div>

    <!-- Footer -->
    <div class="border-t border-[#0F2E46] p-2">
      <user />
    </div>
  `,
})
export class AdminSidebar {}
