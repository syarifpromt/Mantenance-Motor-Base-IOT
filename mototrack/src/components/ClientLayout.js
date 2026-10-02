'use client';

import { StoreProvider, useStore } from '@/lib/store';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { calculateServiceStatus, metersToKm } from '@/lib/utils';
import { usePathname } from 'next/navigation';

function LayoutInner({ children }) {
  const pathname = usePathname();
  const { serviceItems, telemetry } = useStore();

  const currentOdoKm = telemetry?.odometer_m ? metersToKm(telemetry.odometer_m) : 0;
  
  // Calculate urgent items count (terlewat or segera)
  const urgentCount = serviceItems.filter(item => {
    const stat = calculateServiceStatus(item, currentOdoKm);
    return stat.status === 'terlewat' || stat.status === 'segera';
  }).length;

  const pageTitles = {
    '/': 'Dashboard',
    '/servis': 'Servis',
    '/riwayat': 'Riwayat',
    '/perangkat': 'Perangkat',
  };

  const title = pageTitles[pathname] || 'MotoTrack';

  return (
    <div suppressHydrationWarning className="flex flex-col min-h-screen bg-surface font-sans text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Header title={title} />
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav urgentCount={urgentCount} />
    </div>
  );
}

export default function ClientLayout({ children }) {
  return (
    <StoreProvider>
      <LayoutInner>{children}</LayoutInner>
    </StoreProvider>
  );
}
