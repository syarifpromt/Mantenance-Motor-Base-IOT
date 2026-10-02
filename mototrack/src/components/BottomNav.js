'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', icon: 'speed', label: 'Dashboard' },
  { href: '/servis', icon: 'build', label: 'Servis', badge: true },
  { href: '/riwayat', icon: 'history', label: 'Riwayat' },
  { href: '/perangkat', icon: 'bluetooth', label: 'Perangkat' },
];

export default function BottomNav({ urgentCount = 0 }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="relative">
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '24px',
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 500"
                      : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {item.icon}
                </span>
                {item.badge && urgentCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-error text-on-error text-[9px] font-bold flex items-center justify-center">
                    {urgentCount}
                  </span>
                )}
              </span>
              <span className="text-label-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
