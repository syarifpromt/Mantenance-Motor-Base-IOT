/**
 * Utilitas kalkulasi status servis
 * Berdasarkan PRD bagian 8: Aturan Status Servis
 */

/**
 * Hitung sisa km dan status servis
 * sisa_km = (km_servis_terakhir + interval_km) - odometer_saat_ini
 * 
 * Status:
 * - Aman: sisa_km > 20% dari interval
 * - Segera: 0 < sisa_km <= 20% dari interval
 * - Terlewat: sisa_km <= 0
 */
export function calculateServiceStatus(item, currentOdometerKm) {
  const { interval_km, last_service_km, warn_percent = 20 } = item;
  const nextServiceKm = last_service_km + interval_km;
  const sisaKm = nextServiceKm - currentOdometerKm;
  const threshold = (warn_percent / 100) * interval_km;
  const usedKm = currentOdometerKm - last_service_km;
  const progressPercent = Math.min(Math.max((usedKm / interval_km) * 100, 0), 115);
  const sisaPercent = Math.max((sisaKm / interval_km) * 100, 0);

  let status;
  if (sisaKm <= 0) {
    status = 'terlewat';
  } else if (sisaKm <= threshold) {
    status = 'segera';
  } else {
    status = 'aman';
  }

  return {
    sisaKm,
    nextServiceKm,
    usedKm,
    progressPercent,
    sisaPercent: Math.round(sisaPercent * 10) / 10,
    status,
  };
}

/**
 * Format angka KM dengan pemisah titik (format Indonesia)
 */
export function formatKm(value) {
  return new Intl.NumberFormat('id-ID').format(Math.round(value));
}

/**
 * Format meter ke KM
 */
export function metersToKm(meters) {
  return meters / 1000;
}

/**
 * Format angka meter presisi
 */
export function formatMetersPrecise(meters) {
  return new Intl.NumberFormat('id-ID').format(meters);
}

/**
 * Format Rupiah
 */
export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format tanggal Indonesia
 */
export function formatTanggal(dateStr) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

/**
 * Format waktu relatif
 */
export function formatRelativeTime(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatTanggal(dateStr);
}

/**
 * Generate UUID sederhana
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Hitung total biaya dari riwayat servis di tahun tertentu
 */
export function calculateYearlyCost(logs, year) {
  return logs
    .filter(log => new Date(log.performed_at).getFullYear() === year)
    .reduce((total, log) => total + (log.cost || 0), 0);
}

/**
 * Hitung jumlah servis di tahun tertentu
 */
export function countYearlyServices(logs, year) {
  return logs.filter(log => new Date(log.performed_at).getFullYear() === year).length;
}
