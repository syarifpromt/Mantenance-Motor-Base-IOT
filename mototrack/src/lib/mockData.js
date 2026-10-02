/**
 * Mock data untuk demo tanpa perangkat ESP32
 * Simulasi data BLE, GPS, dan telemetri
 */

// Data kendaraan
export const MOCK_VEHICLE = {
  name: 'Honda Vario 160',
  plate: 'B 4821 KTF',
  deviceId: 'MotorTracker-A49F',
  mac: 'E4:65:B8:2A:A4:9F',
  firmwareVersion: 'v0.1-beta',
};

// Data odometer & telemetri
export const MOCK_TELEMETRY = {
  odometer_m: 14852320, // 14.852,320 km dalam meter
  trip_today_m: 24600,  // 24,6 km hari ini
  gps: {
    fix: '3D',
    satellites: 9,
    hdop: 1.2,
  },
  battery: {
    voltage_mv: 12600, // 12.6V
    acc: true,
    status: 'Normal',
  },
  nvs: {
    status: 'Aman',
    interval: '500m',
  },
  ble: {
    connected: true,
    rssi: -62,
    quality: 'Sangat Baik (~1.5 m)',
  },
  lastSync: new Date().toISOString(),
};

// Item servis default dengan data contoh
export const MOCK_SERVICE_ITEMS = [
  {
    id: '1',
    name: 'Filter Udara',
    description: 'Saringan hisap karbu/injeksi',
    icon: 'air_filter',
    interval_km: 6000,
    last_service_km: 8000,
    warn_percent: 20,
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Oli Mesin',
    description: 'MPX2 / Castrol Power1 10W-30',
    icon: 'oil_barrel',
    interval_km: 2000,
    last_service_km: 13000,
    warn_percent: 20,
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: '3',
    name: 'Kampas Rem Depan',
    description: 'Brake pad set ceramic',
    icon: 'brake_alert',
    interval_km: 8310,
    last_service_km: 6852,
    warn_percent: 20,
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: '4',
    name: 'Oli Gardan / Gear Oil',
    description: 'Transmisi matic 120ml',
    icon: 'settings',
    interval_km: 4000,
    last_service_km: 12000,
    warn_percent: 20,
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: '5',
    name: 'Busi (Spark Plug)',
    description: 'NGK MR9C-9N Nickel',
    icon: 'electric_bolt',
    interval_km: 8000,
    last_service_km: 10052,
    warn_percent: 20,
    created_at: '2025-06-15T00:00:00Z',
  },
  {
    id: '6',
    name: 'Roller & V-Belt CVT',
    description: 'Sabuk penggerak transmisi',
    icon: 'sync_alt',
    interval_km: 20000,
    last_service_km: 0,
    warn_percent: 20,
    created_at: '2025-06-15T00:00:00Z',
  },
];

// Riwayat servis
export const MOCK_SERVICE_LOGS = [
  {
    id: '1',
    service_item_id: '2',
    service_name: 'Ganti Oli Mesin & Filter Oli',
    odometer_km: 13000,
    performed_at: '2026-01-18T00:00:00Z',
    notes: 'Menggunakan Oli SPX2 10W-30 0.8L, kondisi oli lama agak hitam pekat.',
    cost: 85000,
    workshop: 'AHASS Kalimalang',
    tags: ['Oli'],
    reset_info: 'Reset Interval 4.000 km Selesai',
  },
  {
    id: '2',
    service_item_id: '3',
    service_name: 'Ganti Kampas Rem Depan & Minyak Rem',
    odometer_km: 11500,
    performed_at: '2025-11-20T00:00:00Z',
    notes: 'Kampas ori diganti karena sudah tipis berdecit.',
    cost: 75000,
    workshop: 'Planet Ban Pondok Gede',
    tags: ['Pengereman'],
    extra: 'Oli Rem DOT4 Baru',
  },
  {
    id: '3',
    service_item_id: '6',
    service_name: 'Servis CVT + Ganti Roller + Oli Gardan',
    odometer_km: 10000,
    performed_at: '2025-10-10T00:00:00Z',
    notes: 'Pembersihan debu CVT dan ganti roller 11gr rata.',
    cost: 210000,
    workshop: 'Bengkel Mandiri Motor',
    tags: ['Transmisi'],
    extra: 'V-Belt Diinspeksi Layak',
  },
  {
    id: '4',
    service_item_id: '5',
    service_name: 'Ganti Busi Standar NGK',
    odometer_km: 8000,
    performed_at: '2025-08-14T00:00:00Z',
    notes: 'Penggantian rutin busi tipe CPR9EA-9.',
    cost: 25000,
    workshop: 'Servis Mandiri',
    tags: ['Oli'],
    extra: 'Elektroda Bersih',
  },
];

/**
 * Simulasi pembacaan BLE dengan delay
 */
export function simulateBleRead() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...MOCK_TELEMETRY,
        odometer_m: MOCK_TELEMETRY.odometer_m + Math.floor(Math.random() * 500),
        lastSync: new Date().toISOString(),
      });
    }, 1500);
  });
}
