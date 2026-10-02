'use client';

import { useStore } from '@/lib/store';

export default function Header({ title = 'Dashboard' }) {
  const { telemetry } = useStore();
  const bleConnected = telemetry?.ble?.connected;
  const deviceShort = telemetry?.ble?.connected ? 'A49F' : null;

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl" style={{ boxShadow: '0 1px 8px rgba(11,28,48,0.04)' }}>
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
              two_wheeler
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-headline-sm text-primary tracking-tight truncate" style={{ fontSize: '17px' }}>MotoTrack</span>
            <span className="text-label-sm text-on-surface-variant leading-none truncate">{title}</span>
          </div>
        </div>

        {/* BLE Status + Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest" style={{ boxShadow: '0 1px 4px rgba(11,28,48,0.06)' }}>
            {bleConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '15px' }}>bluetooth_connected</span>
                <span className="text-label-sm text-on-surface truncate max-w-[90px]">{deviceShort || '8F2B'}</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '15px' }}>bluetooth_disabled</span>
                <span className="text-label-sm text-outline">Offline</span>
              </>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0" style={{ boxShadow: '0 1px 4px rgba(11,28,48,0.06)' }}>
            <span className="material-symbols-outlined text-on-primary-fixed-variant" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
