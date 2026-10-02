'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import {
  formatKm,
  formatRupiah,
  formatTanggal,
  metersToKm,
  calculateYearlyCost,
} from '@/lib/utils';

export default function RiwayatPage() {
  const { serviceLogs, telemetry, deleteServiceLog, addServiceLog, isLoaded } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [logForm, setLogForm] = useState({
    service_name: '',
    odometer_km: '',
    performed_at: new Date().toISOString().split('T')[0],
    cost: '',
    workshop: '',
    notes: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentYear = new Date().getFullYear();

  // Metrics summary
  const totalCostCurrentYear = useMemo(() => {
    return calculateYearlyCost(serviceLogs, currentYear);
  }, [serviceLogs, currentYear]);

  const totalServicesDone = serviceLogs.length;

  // Filter logs
  const filteredLogs = useMemo(() => {
    return serviceLogs.filter((log) => {
      const matchesSearch =
        searchQuery === '' ||
        log.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.workshop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'all' ||
        (selectedTag === 'oli' &&
          (log.service_name?.toLowerCase().includes('oli') ||
            log.tags?.includes('Oli'))) ||
        (selectedTag === 'pengereman' &&
          (log.service_name?.toLowerCase().includes('rem') ||
            log.tags?.includes('Pengereman'))) ||
        (selectedTag === 'transmisi' &&
          (log.service_name?.toLowerCase().includes('cvt') ||
            log.service_name?.toLowerCase().includes('roller') ||
            log.service_name?.toLowerCase().includes('gardan') ||
            log.tags?.includes('Transmisi')));

      return matchesSearch && matchesTag;
    });
  }, [serviceLogs, searchQuery, selectedTag]);

  // Export to CSV (PRD WEB-11)
  const handleExportCSV = () => {
    if (serviceLogs.length === 0) {
      alert('Belum ada riwayat servis untuk diekspor.');
      return;
    }

    const headers = [
      'ID',
      'Tanggal',
      'Nama Servis',
      'Odometer (KM)',
      'Biaya (IDR)',
      'Bengkel',
      'Catatan',
    ];

    const rows = serviceLogs.map((log) => [
      log.id,
      log.performed_at?.split('T')[0] || '',
      `"${(log.service_name || '').replace(/"/g, '""')}"`,
      log.odometer_km || 0,
      log.cost || 0,
      `"${(log.workshop || '').replace(/"/g, '""')}"`,
      `"${(log.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `MotoTrack_Riwayat_Servis_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('File CSV riwayat servis berhasil diunduh!');
  };

  // Submit manual log
  const handleAddManualLog = (e) => {
    e.preventDefault();
    if (!logForm.service_name) {
      alert('Nama servis harus diisi');
      return;
    }

    addServiceLog({
      service_name: logForm.service_name,
      odometer_km: parseFloat(logForm.odometer_km) || 0,
      performed_at: new Date(logForm.performed_at).toISOString(),
      cost: parseInt(logForm.cost, 10) || 0,
      workshop: logForm.workshop || 'Servis Mandiri',
      notes: logForm.notes,
      tags: [],
    });

    setShowAddLogModal(false);
    setLogForm({
      service_name: '',
      odometer_km: '',
      performed_at: new Date().toISOString().split('T')[0],
      cost: '',
      workshop: '',
      notes: '',
    });
    showToast('Catatan riwayat servis tersimpan!');
  };

  const handleDelete = (id, name) => {
    if (confirm(`Hapus catatan riwayat "${name}"?`)) {
      deleteServiceLog(id);
      showToast('Catatan riwayat berhasil dihapus');
    }
  };


  return (
    <div className="flex flex-col w-full px-4 pb-12 gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg text-body-md flex items-center gap-2 animate-count-up max-w-[90%]">
          <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">
            check_circle
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Visual & Context */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-surface-container-low p-5 border border-surface-container/60 mt-1">
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-bold">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>Sinkronisasi Cloud Aktif</span>
          </div>
          <h2 className="text-headline-sm font-bold text-on-surface mt-1">
            Buku Servis Digital
          </h2>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            Log otomatis via telemetri odometer ESP32 &amp; catatan nota bengkel perawatan motor.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-6 w-36 h-36 opacity-10 pointer-events-none text-primary">
          <span className="material-symbols-outlined text-[150px] leading-none">menu_book</span>
        </div>
      </div>

      {/* Metric Summary Bento Cards (PRD WEB-09 & WEB-11) */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Total Biaya Card */}
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant font-semibold">
              Total Biaya ({currentYear})
            </span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-headline-sm font-extrabold text-on-surface tracking-tight">
              {formatRupiah(totalCostCurrentYear)}
            </span>
            <div className="flex items-center gap-1 mt-1 text-tertiary text-label-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>Terkontrol efisien</span>
            </div>
          </div>
        </div>

        {/* Total Servis Card */}
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant font-semibold">
              Servis Tuntas
            </span>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-headline-sm font-extrabold text-on-surface tracking-tight">
              {totalServicesDone} Kali
            </span>
            <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-label-sm font-medium">
              <span className="material-symbols-outlined text-[14px]">history</span>
              <span>
                {serviceLogs[0]?.odometer_km ? `${formatKm(serviceLogs[0].odometer_km)} km` : 'Tercatat'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action & Export Bar */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary flex-shrink-0"></span>
          <span className="text-label-md text-on-surface font-semibold truncate">
            Semua data terverifikasi BLE
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowAddLogModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-bold text-label-sm transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Catat Manual</span>
          </button>

          {/* Ekspor CSV Button (PRD WEB-11) */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-variant active:scale-95 text-primary font-label-md font-bold text-label-sm transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">table_view</span>
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col gap-2.5 w-full">
        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama servis atau bengkel..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-surface-container-lowest text-on-surface font-body-md placeholder:text-outline shadow-sm border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedTag('all')}
            className={`px-3.5 py-1.5 rounded-full text-label-md font-bold whitespace-nowrap shadow-sm transition-all cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Semua Komponen
          </button>
          <button
            onClick={() => setSelectedTag('oli')}
            className={`px-3.5 py-1.5 rounded-full text-label-md font-bold whitespace-nowrap shadow-sm transition-all cursor-pointer ${
              selectedTag === 'oli'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Oli
          </button>
          <button
            onClick={() => setSelectedTag('pengereman')}
            className={`px-3.5 py-1.5 rounded-full text-label-md font-bold whitespace-nowrap shadow-sm transition-all cursor-pointer ${
              selectedTag === 'pengereman'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Pengereman
          </button>
          <button
            onClick={() => setSelectedTag('transmisi')}
            className={`px-3.5 py-1.5 rounded-full text-label-md font-bold whitespace-nowrap shadow-sm transition-all cursor-pointer ${
              selectedTag === 'transmisi'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            Transmisi / CVT
          </button>
        </div>
      </div>

      {/* Timeline Log Riwayat Servis */}
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between pt-1">
          <span className="text-headline-sm font-bold text-on-surface">Kronologi Servis</span>
          <span className="text-label-sm text-on-surface-variant font-medium">
            Menampilkan {filteredLogs.length} Catatan
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center flex flex-col items-center gap-2 border border-surface-container">
            <span className="material-symbols-outlined text-outline text-4xl">search_off</span>
            <p className="text-body-lg font-bold text-on-surface">Tidak ada catatan servis ditemukan</p>
            <p className="text-label-sm text-secondary">
              Coba sesuaikan kata kunci pencarian atau ganti filter kategori.
            </p>
          </div>
        ) : (
          <div className="relative flex flex-col gap-4 pl-4">
            {/* Vertical Line Tracker */}
            <div className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-surface-container-highest rounded-full"></div>

            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="relative flex flex-col gap-2.5 p-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container/60 hover:shadow-md transition-all ml-2"
              >
                {/* Node Marker */}
                <span className="absolute -left-[23px] top-5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-surface flex items-center justify-center"></span>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-label-sm text-primary font-bold">
                      {formatTanggal(log.performed_at)}
                    </span>
                    <h3 className="text-headline-sm font-bold text-on-surface tracking-tight mt-0.5">
                      {log.service_name}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-surface-container-low text-primary text-body-md font-bold whitespace-nowrap">
                    {formatRupiah(log.cost || 0)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant text-label-md">
                  <div className="inline-flex items-center gap-1 font-mono font-semibold">
                    <span className="material-symbols-outlined text-[17px] text-tertiary">
                      speed
                    </span>
                    <span>{formatKm(log.odometer_km)} km</span>
                  </div>
                  {log.workshop && (
                    <div className="inline-flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[17px] text-primary">
                        storefront
                      </span>
                      <span>{log.workshop}</span>
                    </div>
                  )}
                </div>

                {log.notes && (
                  <p className="text-body-md text-on-surface-variant bg-surface-container-low/60 p-2.5 rounded-xl border border-surface-container/40">
                    {log.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-surface-container/40 text-label-sm">
                  <span className="text-tertiary font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    Terverifikasi
                  </span>
                  <button
                    onClick={() => handleDelete(log.id, log.service_name)}
                    className="text-outline hover:text-error transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Catat Manual */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-count-up max-h-[90vh] overflow-y-auto border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  history_edu
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  Catat Riwayat Servis
                </h3>
              </div>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleAddManualLog} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">
                  Nama Tindakan Servis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ganti Oli Mesin & Filter Udara"
                  value={logForm.service_name}
                  onChange={(e) => setLogForm({ ...logForm, service_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">Tanggal Servis</label>
                  <input
                    type="date"
                    required
                    value={logForm.performed_at}
                    onChange={(e) => setLogForm({ ...logForm, performed_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    Odometer Saat Servis (KM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="14852"
                    value={logForm.odometer_km}
                    onChange={(e) => setLogForm({ ...logForm, odometer_km: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">Total Biaya (Rp)</label>
                  <input
                    type="number"
                    placeholder="85000"
                    value={logForm.cost}
                    onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">Nama Bengkel</label>
                  <input
                    type="text"
                    placeholder="AHASS Kalimalang"
                    value={logForm.workshop}
                    onChange={(e) => setLogForm({ ...logForm, workshop: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">Catatan Servis</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan merk sparepart, nomor nota, dll..."
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2.5 rounded-full text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold shadow-sm"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
