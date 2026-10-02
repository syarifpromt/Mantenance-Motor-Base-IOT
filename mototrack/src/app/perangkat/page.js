'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatKm, metersToKm } from '@/lib/utils';

export default function PerangkatPage() {
  const { vehicle, telemetry, updateTelemetry, updateOdometer, setVehicle, isLoaded } =
    useStore();

  const [calibInput, setCalibInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Vehicle profile edit
  const [editVehicle, setEditVehicle] = useState({
    name: vehicle?.name || 'Honda Vario 160',
    plate: vehicle?.plate || 'B 4821 KTF',
    deviceId: vehicle?.deviceId || 'MotorTracker-A49F',
  });
  const [isSavingVehicle, setIsSavingVehicle] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!vehicle || !telemetry) {
    return null;
  }

  const currentOdoKm = metersToKm(telemetry.odometer_m);
  const isConnected = telemetry.ble?.connected;

  // Handle Web Bluetooth API or Simulation
  const handleConnectBLE = async () => {
    setIsScanning(true);
    showToast('Mencari perangkat BLE MotorTracker di sekitar...');

    // Try Web Bluetooth API if available in browser
    if (typeof navigator !== 'undefined' && navigator.bluetooth) {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [
            { namePrefix: 'MotorTracker' },
            { namePrefix: 'ESP32' },
          ],
          optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb', 'battery_service'],
        });

        if (device) {
          updateTelemetry({
            ble: {
              connected: true,
              rssi: -58,
              quality: 'Sangat Baik (Web Bluetooth Aktif)',
            },
          });
          showToast(`Terhubung dengan ${device.name || 'ESP32'} via Web Bluetooth!`);
          setIsScanning(false);
          return;
        }
      } catch (err) {
        console.warn('Web Bluetooth error or cancelled, falling back to simulated connection:', err);
      }
    }

    // Fallback simulation for unsupported browsers / demo mode
    setTimeout(() => {
      updateTelemetry({
        ble: {
          connected: true,
          rssi: -62,
          quality: 'Sangat Baik (~1.5 m)',
        },
      });
      setIsScanning(false);
      showToast('Terhubung dengan ESP32 MotorTracker-A49F!');
    }, 1200);
  };

  const handleDisconnectBLE = () => {
    updateTelemetry({
      ble: {
        connected: false,
        rssi: 0,
        quality: 'Terputus',
      },
    });
    showToast('Koneksi Bluetooth diputuskan.');
  };

  // Submit calibration value
  const handleCalibrateOdometer = (e) => {
    e.preventDefault();
    const val = parseFloat(calibInput);
    if (isNaN(val) || val < 0) {
      alert('Masukkan angka kilometer yang valid');
      return;
    }

    const meters = Math.round(val * 1000);
    updateOdometer(meters);
    setCalibInput('');
    showToast(`Odometer ESP32 diset ke ${formatKm(val)} km (Tersimpan di Flash NVS)`);
  };

  // Save vehicle profile
  const handleSaveVehicleProfile = (e) => {
    e.preventDefault();
    setIsSavingVehicle(true);
    setVehicle({
      ...vehicle,
      name: editVehicle.name,
      plate: editVehicle.plate,
      deviceId: editVehicle.deviceId,
    });
    setTimeout(() => {
      setIsSavingVehicle(false);
      showToast('Profil kendaraan berhasil disimpan!');
    }, 300);
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

      {/* Subheader Overview */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex flex-col">
          <h1 className="text-headline-md font-bold text-on-surface tracking-tight">
            Perangkat &amp; Kalibrasi
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Konfigurasi modul IoT ESP32 &amp; sinkronisasi Web Bluetooth
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined text-[24px]">tune</span>
        </div>
      </div>

      {/* Section 1: Live BLE Web Bluetooth Card */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-4.5 flex flex-col gap-4 border border-surface-container/60 overflow-hidden relative">
        {/* Top Active Indicator Banner */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isConnected ? 'bg-tertiary' : 'bg-outline-variant'
                }`}
              ></span>
            </div>
            <span
              className={`text-label-sm uppercase tracking-wider font-bold ${
                isConnected ? 'text-tertiary' : 'text-outline'
              }`}
            >
              {isConnected ? 'Tersambung via Web Bluetooth' : 'Koneksi Terputus'}
            </span>
          </div>
          <span className="text-label-sm bg-surface-container-low text-primary px-3 py-1 rounded-full font-bold">
            Web BLE API
          </span>
        </div>

        {/* Device Details Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-3xl">developer_board</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-headline-sm font-bold text-on-surface tracking-tight truncate">
                {vehicle.deviceId}
              </h2>
              <span className="text-label-sm text-on-surface-variant font-mono mt-0.5 truncate">
                MAC: {vehicle.mac}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <div
              className={`flex items-center gap-1 font-bold text-label-md ${
                isConnected ? 'text-tertiary' : 'text-outline'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">wifi_tethering</span>
              <span>{isConnected ? `${telemetry.ble?.rssi || -62} dBm` : '--'}</span>
            </div>
            <span className="text-label-sm text-on-surface-variant text-right">
              {isConnected ? telemetry.ble?.quality || 'Sangat Baik' : 'Offline'}
            </span>
          </div>
        </div>

        {/* GATT Specs Pill Box */}
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-1.5 border border-surface-container/40">
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant font-medium">
              GATT Service UUID
            </span>
            <span className="text-label-sm text-on-surface font-mono bg-surface-container-highest px-2 py-0.5 rounded font-semibold">
              0xFFE0 Custom
            </span>
          </div>
          <p className="text-label-sm font-mono text-primary truncate select-all">
            0000ffe0-0000-1000-8000-00805f9b34fb
          </p>
        </div>

        {/* BLE Control Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleConnectBLE}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 h-12 px-3 rounded-full bg-surface-container text-on-surface text-label-md font-bold hover:bg-surface-container-high transition-colors active:scale-95 cursor-pointer disabled:opacity-75"
          >
            <span
              className={`material-symbols-outlined text-[20px] text-primary ${
                isScanning ? 'animate-spin' : ''
              }`}
            >
              {isScanning ? 'sync' : 'bluetooth_searching'}
            </span>
            <span>{isScanning ? 'Memindai...' : 'Pindai Ulang BLE'}</span>
          </button>
          <button
            type="button"
            onClick={isConnected ? handleDisconnectBLE : handleConnectBLE}
            className={`flex items-center justify-center gap-2 h-12 px-3 rounded-full text-label-md font-bold transition-all active:scale-95 cursor-pointer ${
              isConnected
                ? 'bg-error-container text-on-error-container hover:opacity-90'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isConnected ? 'bluetooth_disabled' : 'bluetooth_connected'}
            </span>
            <span>{isConnected ? 'Putuskan' : 'Sambungkan'}</span>
          </button>
        </div>
      </section>

      {/* Section 2: Odometer Initial Calibration (FW-06 & US-07) */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-4.5 flex flex-col gap-4 border border-surface-container/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[22px]">pin</span>
          </div>
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface tracking-tight">
              Kalibrasi Odometer Awal
            </h2>
            <p className="text-label-sm text-on-surface-variant">
              Sinkronisasi angka fisik speedometer motor
            </p>
          </div>
        </div>

        {/* Callout Guide */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low text-on-surface border border-surface-container/50">
          <span className="material-symbols-outlined text-[20px] text-primary flex-shrink-0 mt-0.5">
            info
          </span>
          <p className="text-body-md leading-relaxed text-on-surface-variant">
            Sesuaikan angka odometer di website agar persis sama dengan angka di panel speedometer
            fisik motor Anda. Nilai ini akan dikirim via BLE dan disimpan di memori permanen ESP32.
          </p>
        </div>

        {/* Current vs New Input Card */}
        <form onSubmit={handleCalibrateOdometer} className="space-y-3.5">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container">
            <span className="text-label-md text-on-surface-variant font-medium">
              Nilai Odometer Saat Ini
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-headline-sm font-black text-on-surface">
                {formatKm(currentOdoKm)}
              </span>
              <span className="text-label-md font-bold text-primary">km</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-label-md text-on-surface font-semibold flex items-center justify-between">
              <span>Input Angka Speedometer Fisik</span>
              <span className="text-label-sm text-primary font-bold">Satuan Kilometer</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.1"
                required
                value={calibInput}
                onChange={(e) => setCalibInput(e.target.value)}
                placeholder={Math.round(currentOdoKm).toString()}
                className="w-full h-12 px-4 py-3 bg-surface-container-low text-on-surface font-headline-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container font-mono tracking-wide"
              />
              <span className="absolute right-4 text-headline-sm text-on-surface-variant font-bold pointer-events-none">
                KM
              </span>
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            className="w-full h-12 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
            <span>Kirim Nilai Awal ke ESP32</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-center pt-1">
            <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
            <span className="text-label-sm text-on-surface-variant">
              Tersimpan permanen di memori Flash NVS ESP32
            </span>
          </div>
        </form>
      </section>

      {/* Section 3: Hardware BOM & Specifications (PRD 9.5 & 10) */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-4.5 flex flex-col gap-4 border border-surface-container/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[22px]">memory</span>
          </div>
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface tracking-tight">
              Spesifikasi Hardware IoT
            </h2>
            <p className="text-label-sm text-on-surface-variant">BOM &amp; arsitektur modul pelacak</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container/40">
            <span className="text-label-sm text-secondary font-semibold">Mikrokontroler</span>
            <span className="text-body-md font-bold text-on-surface">ESP32-WROOM-32D</span>
            <span className="text-label-sm text-primary">Dual-Core 240MHz • BLE 4.2</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container/40">
            <span className="text-label-sm text-secondary font-semibold">Sensor Odometer</span>
            <span className="text-body-md font-bold text-on-surface">Optocoupler Speed</span>
            <span className="text-label-sm text-tertiary">20-PPR Disc • Rasio 2.14</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container/40">
            <span className="text-label-sm text-secondary font-semibold">Regulasi Daya</span>
            <span className="text-body-md font-bold text-on-surface">Step-Down LM2596</span>
            <span className="text-label-sm text-secondary">Aki 12V ➔ 5V Stabil</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-surface-container/40">
            <span className="text-label-sm text-secondary font-semibold">Penyimpanan NVS</span>
            <span className="text-body-md font-bold text-on-surface">Flash EEPROM</span>
            <span className="text-label-sm text-secondary">Auto-save tiap 500m</span>
          </div>
        </div>
      </section>

      {/* Section 4: Vehicle Profile Configuration */}
      <section className="bg-surface-container-lowest rounded-2xl shadow-sm p-4.5 flex flex-col gap-4 border border-surface-container/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
          </div>
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface tracking-tight">
              Profil Kendaraan
            </h2>
            <p className="text-label-sm text-on-surface-variant">Ubah identitas motor yang dipantau</p>
          </div>
        </div>

        <form onSubmit={handleSaveVehicleProfile} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-label-sm text-secondary font-semibold">Nama Kendaraan</label>
            <input
              type="text"
              required
              value={editVehicle.name}
              onChange={(e) => setEditVehicle({ ...editVehicle, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-medium border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-secondary font-semibold">Nomor Pelat</label>
              <input
                type="text"
                required
                value={editVehicle.plate}
                onChange={(e) => setEditVehicle({ ...editVehicle, plate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary uppercase"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-label-sm text-secondary font-semibold">Device Bluetooth ID</label>
              <input
                type="text"
                required
                value={editVehicle.deviceId}
                onChange={(e) => setEditVehicle({ ...editVehicle, deviceId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingVehicle}
            className="w-full h-11 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-bold text-label-md transition-colors active:scale-95 cursor-pointer mt-1"
          >
            {isSavingVehicle ? 'Menyimpan...' : 'Simpan Profil Kendaraan'}
          </button>
        </form>
      </section>
    </div>
  );
}
