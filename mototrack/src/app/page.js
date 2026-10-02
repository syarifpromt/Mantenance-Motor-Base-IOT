'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import {
  calculateServiceStatus,
  formatKm,
  metersToKm,
  formatMetersPrecise,
  formatRelativeTime,
} from '@/lib/utils';

export default function DashboardPage() {
  const {
    vehicle,
    telemetry,
    serviceItems,
    updateTelemetry,
    updateOdometer,
    addServiceLog,
    markServiceDone,
    isLoaded,
  } = useStore();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState('Terakhir sinkron: Baru saja');
  const [showOdoModal, setShowOdoModal] = useState(false);
  const [newOdoInput, setNewOdoInput] = useState('');
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({
    serviceItemId: '',
    odometerKm: '',
    cost: '',
    workshop: '',
    notes: '',
  });
  const [tripTodayKm, setTripTodayKm] = useState(24.6);
  const [toastMessage, setToastMessage] = useState(null);

  if (!vehicle || !telemetry) {
    return null;
  }

  const currentOdoKm = metersToKm(telemetry.odometer_m);

  // Status servis kalkulasi
  const processedItems = serviceItems.map((item) => ({
    ...item,
    statusInfo: calculateServiceStatus(item, currentOdoKm),
  }));

  const urgentItems = processedItems.filter(
    (i) => i.statusInfo.status === 'terlewat' || i.statusInfo.status === 'segera'
  );

  // Quick Toast trigger
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulasi sinkronisasi BLE manual
  const handleSyncBle = () => {
    setIsSyncing(true);
    setSyncFeedback('Menyinkronkan data BLE ke ESP32...');

    setTimeout(() => {
      const addedMeters = Math.floor(Math.random() * 450) + 50;
      const newOdo = telemetry.odometer_m + addedMeters;
      updateOdometer(newOdo);
      setIsSyncing(false);
      setSyncFeedback('Terakhir sinkron: Baru saja (100% OK)');
      showToast(`Sinkronisasi berhasil! Odometer bertambah ${addedMeters} meter`);
    }, 1000);
  };

  // Reset Trip Handler
  const handleResetTrip = () => {
    setTripTodayKm(0);
    showToast('Trip hari ini telah di-reset ke 0.0 km');
  };

  // Simpan Odometer Manual
  const handleSaveOdometer = (e) => {
    e.preventDefault();
    const val = parseFloat(newOdoInput);
    if (isNaN(val) || val < 0) {
      alert('Masukkan nilai odometer yang valid');
      return;
    }
    const valInMeters = Math.round(val * 1000);
    updateOdometer(valInMeters);
    setShowOdoModal(false);
    setNewOdoInput('');
    showToast(`Odometer berhasil diperbarui ke ${formatKm(val)} km`);
  };

  // Simpan Catatan Servis Cepat
  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!recordForm.serviceItemId) {
      alert('Pilih item servis yang dikerjakan');
      return;
    }
    const odoKm = parseFloat(recordForm.odometerKm) || currentOdoKm;
    const cost = parseInt(recordForm.cost, 10) || 0;

    markServiceDone(
      recordForm.serviceItemId,
      odoKm,
      recordForm.notes,
      cost,
      recordForm.workshop
    );

    setShowRecordModal(false);
    setRecordForm({ serviceItemId: '', odometerKm: '', cost: '', workshop: '', notes: '' });
    showToast('Servis berhasil dicatat & interval odometer di-reset!');
  };

  return (
    <div className="flex flex-col w-full px-4 pb-6 gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg text-body-md flex items-center gap-2 animate-count-up max-w-[90%]">
          <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">
            check_circle
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Vehicle & BLE Status Bar */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-4 flex flex-col gap-3 mt-2 border border-surface-container/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-[24px]">two_wheeler</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-headline-sm text-on-surface font-bold truncate">
                  {vehicle.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-label-sm text-secondary font-semibold">
                  {vehicle.plate}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                </span>
                <span className="text-label-sm text-tertiary font-medium truncate">
                  Terhubung: {vehicle.deviceId}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleSyncBle}
            disabled={isSyncing}
            className="flex-shrink-0 px-3.5 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary transition-all active:scale-95 shadow-sm flex items-center gap-1.5 text-label-md font-semibold cursor-pointer disabled:opacity-75"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''
                }`}
            >
              sync
            </span>
            <span>{isSyncing ? 'Proses...' : 'Sinkron'}</span>
          </button>
        </div>
        <div className="flex items-center justify-between pt-2 bg-surface-container-low px-3 py-2 rounded-xl text-on-surface-variant text-label-sm">
          <span className="flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[15px] text-tertiary">verified</span>
            <span>ESP32 BLE v4.2 • Siklus 1 Hz</span>
          </span>
          <span className="text-secondary">{syncFeedback}</span>
        </div>
      </section>

      {/* Giant Odometer Hero Display */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-md p-5 flex flex-col items-center justify-center relative overflow-hidden border border-surface-container/60">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-surface-container-high/60 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-primary-fixed/40 rounded-full blur-xl pointer-events-none"></div>

        <div className="w-full flex items-center justify-between z-10 mb-2">
          <div className="flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px] text-primary">speed</span>
            <span className="text-label-sm uppercase tracking-wider text-secondary font-bold">
              Total Jarak Tempuh
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-label-sm text-primary font-bold">
            Live Aktif
          </span>
        </div>

        {/* Odometer Digits */}
        <div className="flex items-baseline justify-center gap-2 my-2 z-10">
          <span className="text-display-odometer text-on-surface tracking-tight font-extrabold font-mono transition-all">
            {formatKm(currentOdoKm)}
          </span>
          <span className="text-headline-sm text-primary font-black">KM</span>
        </div>
        <span className="text-label-md text-on-surface-variant z-10 font-medium">
          {formatMetersPrecise(telemetry.odometer_m)} meter presisi optik
        </span>

        {/* Divider Pill: Trip */}
        <div className="w-full mt-5 pt-1 bg-surface-container-low rounded-xl p-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">trip_origin</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-secondary">Trip Hari Ini</span>
              <span className="text-headline-sm text-on-surface font-bold">
                +{tripTodayKm.toFixed(1).replace('.', ',')} km
              </span>
            </div>
          </div>
          <button
            onClick={handleResetTrip}
            className="px-3 py-1.5 rounded-full bg-surface-container-lowest text-on-surface hover:bg-surface-container text-label-sm font-semibold shadow-sm transition-colors flex items-center gap-1 active:scale-95 border border-surface-container"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            Reset Trip
          </button>
        </div>
      </section>

      {/* Realtime Telemetry Strip (3 Columns) */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-headline-sm text-on-surface font-bold">Telemetri Perangkat</h2>
          <span className="text-label-sm text-secondary font-medium">Data Realtime</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: GPS */}
          <div className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex flex-col justify-between border border-surface-container/50">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                satellite_alt
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-secondary">Sinyal GPS</span>
              <span className="text-body-lg text-on-surface font-bold">Fix 3D</span>
              <span className="text-label-sm text-tertiary font-semibold mt-0.5">
                {telemetry.gps?.satellites || 9} Satelit
              </span>
            </div>
          </div>

          {/* Card 2: Battery/Aki */}
          <div className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex flex-col justify-between border border-surface-container/50">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-tertiary text-[22px]">
                battery_charging_full
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-secondary">Tegangan Baterai</span>
              <span className="text-body-lg text-on-surface font-bold">
                {(telemetry.battery?.voltage_mv / 1000).toFixed(1)} V
              </span>
              <span className="text-label-sm text-secondary mt-0.5">ACC ON • Normal</span>
            </div>
          </div>

          {/* Card 3: NVS Flash */}
          <div className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex flex-col justify-between border border-surface-container/50">
            <div className="flex items-center justify-between mb-2">
              <span className="material-symbols-outlined text-primary text-[22px]">save</span>
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-sm text-secondary">Memori NVS</span>
              <span className="text-body-lg text-on-surface font-bold">Aman</span>
              <span className="text-label-sm text-secondary mt-0.5">Auto tiap 500m</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sensor Calibration Status Card */}
      <section className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm flex items-center gap-3.5 border border-surface-container/50">
        <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[28px]">speed</span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-body-lg text-on-surface font-bold truncate">
            Kondisi Motor Prima
          </span>
          <span className="text-label-md text-on-surface-variant line-clamp-1">
            Sensor roda optik terkalibrasi akurat pada rasio 2.14.
          </span>
          <span className="text-label-sm text-primary font-semibold mt-0.5">
            Status ECU: Tidak ada kode error
          </span>
        </div>
      </section>

      {/* Ringkasan Pengingat Servis */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-headline-sm text-on-surface font-bold">Jadwal Servis Berkala</h2>
            {urgentItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-bold">
                {urgentItems.length} Segera
              </span>
            )}
          </div>
          <Link
            href="/servis"
            className="text-label-sm text-primary font-bold flex items-center hover:underline"
          >
            Lihat Semua ({serviceItems.length})
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>

        {/* Urgent Attention Alert Banner */}
        {urgentItems.length > 0 && (
          <div className="bg-secondary-container rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-secondary/10">
            <span className="material-symbols-outlined text-primary text-[24px] flex-shrink-0 mt-0.5">
              warning
            </span>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-body-lg text-on-surface font-bold leading-tight">
                {urgentItems[0].name} Mendekati Batas
              </span>
              <span className="text-body-md text-on-secondary-container mt-1">
                Sisa jarak tempuh {Math.max(0, Math.round(urgentItems[0].statusInfo.sisaKm))} km.
                Disarankan lakukan servis atau pengecekan segera.
              </span>
            </div>
          </div>
        )}

        {/* 2 Preview Cards */}
        {processedItems.slice(0, 2).map((item) => {
          const isUrgent =
            item.statusInfo.status === 'terlewat' || item.statusInfo.status === 'segera';
          const badgeClass =
            item.statusInfo.status === 'terlewat'
              ? 'bg-status-terlewat-bg text-status-terlewat-text'
              : item.statusInfo.status === 'segera'
                ? 'bg-secondary-fixed text-on-secondary-fixed'
                : 'bg-surface-container-low text-tertiary';

          const barColor =
            item.statusInfo.status === 'terlewat'
              ? 'bg-error'
              : item.statusInfo.status === 'segera'
                ? 'bg-primary'
                : 'bg-tertiary';

          return (
            <div
              key={item.id}
              className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-surface-container/60"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center ${isUrgent ? 'text-primary' : 'text-tertiary'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {item.icon || 'build'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-lg text-on-surface font-bold">{item.name}</span>
                    <span className="text-label-sm text-secondary">
                      Interval tiap {formatKm(item.interval_km)} km
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider ${badgeClass}`}
                >
                  {item.statusInfo.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.min(item.statusInfo.progressPercent, 100)}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-on-surface-variant text-label-sm">
                <span
                  className={`text-label-md font-bold ${item.statusInfo.status === 'terlewat'
                      ? 'text-error'
                      : item.statusInfo.status === 'segera'
                        ? 'text-primary'
                        : 'text-on-surface'
                    }`}
                >
                  {item.statusInfo.status === 'terlewat'
                    ? `Terlewat ${formatKm(Math.abs(item.statusInfo.sisaKm))} km`
                    : `Sisa: ${formatKm(item.statusInfo.sisaKm)} km`}
                </span>
                <span>
                  Terpakai {formatKm(item.statusInfo.usedKm)} / {formatKm(item.interval_km)} km
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bengkel Rekanan Banner */}
      <section className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col border border-surface-container/60">
        <div className="p-4 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <div className="flex flex-col">
              <span className="text-body-lg text-on-surface font-bold">
                Bengkel Rekanan MotoTrack
              </span>
              <span className="text-label-sm text-secondary">
                Tersedia voucher servis resmi AHASS & Planet Ban
              </span>
            </div>
          </div>
          <button
            onClick={() => showToast('Voucher AHASS potongan 15% telah disimpan ke akun!')}
            className="px-3.5 py-1.5 rounded-full bg-surface-container text-primary text-label-sm font-bold hover:bg-surface-container-high transition-colors"
          >
            Klaim
          </button>
        </div>
      </section>

      {/* Quick Action Floating Buttons */}
      <section className="flex flex-col gap-3 pt-1">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowRecordModal(true)}
            className="w-full py-3.5 px-4 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">build</span>
            <span>Catat Servis</span>
          </button>
          <button
            onClick={() => {
              setNewOdoInput(Math.round(currentOdoKm).toString());
              setShowOdoModal(true);
            }}
            className="w-full py-3.5 px-4 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface text-label-md font-bold flex items-center justify-center gap-2 shadow-sm border border-surface-container active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">edit_note</span>
            <span>Ubah Odometer</span>
          </button>
        </div>
        <p className="text-center text-label-sm text-secondary">
          Sinkronisasi optik otomatis aktif setiap interval 500 meter via Bluetooth.
        </p>
      </section>

      {/* Modal Ubah Odometer */}
      {showOdoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 shadow-xl flex flex-col gap-4 animate-count-up border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">pin</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Ubah Odometer</h3>
              </div>
              <button
                onClick={() => setShowOdoModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <p className="text-body-md text-on-surface-variant">
              Sesuaikan angka odometer saat ini jika baru saja memasang ESP32 atau ada selisih fisik.
            </p>
            <form onSubmit={handleSaveOdometer} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-secondary font-semibold">
                  Nilai Baru (Kilometer)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newOdoInput}
                    onChange={(e) => setNewOdoInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-headline-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container"
                    placeholder="14852"
                  />
                  <span className="absolute right-4 text-headline-sm font-bold text-on-surface-variant">
                    KM
                  </span>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowOdoModal(false)}
                  className="px-4 py-2.5 rounded-full text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold shadow-sm"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Servis */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-count-up max-h-[90vh] overflow-y-auto border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">build</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Catat Servis Baru</h3>
              </div>
              <button
                onClick={() => setShowRecordModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveRecord} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">Komponen Servis *</label>
                <select
                  required
                  value={recordForm.serviceItemId}
                  onChange={(e) => setRecordForm({ ...recordForm, serviceItemId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-medium border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Pilih Komponen Servis --</option>
                  {serviceItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Tiap {formatKm(item.interval_km)} km)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    Odometer Servis (KM) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={recordForm.odometerKm || Math.round(currentOdoKm)}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, odometerKm: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">Biaya (Rp)</label>
                  <input
                    type="number"
                    value={recordForm.cost}
                    onChange={(e) => setRecordForm({ ...recordForm, cost: e.target.value })}
                    placeholder="Contoh: 85000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">Nama Bengkel</label>
                <input
                  type="text"
                  value={recordForm.workshop}
                  onChange={(e) => setRecordForm({ ...recordForm, workshop: e.target.value })}
                  placeholder="Contoh: AHASS Kalimalang / Servis Mandiri"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                >
                </input>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">Catatan Servis</label>
                <textarea
                  rows={2}
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  placeholder="Merk oli/suku cadang, keluhan yang diperbaiki..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2.5 rounded-full text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold shadow-sm"
                >
                  Simpan & Reset Interval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
