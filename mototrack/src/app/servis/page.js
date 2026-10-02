'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  calculateServiceStatus,
  formatKm,
  metersToKm,
  formatRupiah,
} from '@/lib/utils';

export default function ServisPage() {
  const {
    serviceItems,
    telemetry,
    markServiceDone,
    addServiceItem,
    updateServiceItem,
    deleteServiceItem,
    isLoaded,
  } = useStore();

  const [activeFilter, setActiveFilter] = useState('all'); // all | urgent | safe
  const [showFormula, setShowFormula] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Forms
  const [addForm, setAddForm] = useState({
    name: '',
    description: '',
    interval_km: 3000,
    last_service_km: '',
    icon: 'build',
    warn_percent: 20,
  });

  const [doneForm, setDoneForm] = useState({
    odometer_km: '',
    cost: '',
    workshop: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    interval_km: 3000,
    last_service_km: 0,
    icon: 'build',
    warn_percent: 20,
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!telemetry) {
    return null;
  }

  const currentOdoKm = metersToKm(telemetry.odometer_m);

  // Calculate statuses
  const calculatedItems = serviceItems.map((item) => ({
    ...item,
    statusInfo: calculateServiceStatus(item, currentOdoKm),
  }));

  const urgentCount = calculatedItems.filter(
    (i) => i.statusInfo.status === 'terlewat' || i.statusInfo.status === 'segera'
  ).length;

  const safeCount = calculatedItems.filter(
    (i) => i.statusInfo.status === 'aman'
  ).length;

  // Filter list
  const filteredItems = calculatedItems.filter((item) => {
    if (activeFilter === 'urgent') {
      return item.statusInfo.status === 'terlewat' || item.statusInfo.status === 'segera';
    }
    if (activeFilter === 'safe') {
      return item.statusInfo.status === 'aman';
    }
    return true;
  });

  // Handle Add Item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.interval_km) {
      alert('Nama dan interval harus diisi');
      return;
    }

    const lastKm =
      addForm.last_service_km !== ''
        ? parseFloat(addForm.last_service_km)
        : Math.round(currentOdoKm);

    addServiceItem({
      name: addForm.name,
      description: addForm.description || 'Perawatan berkala',
      interval_km: parseInt(addForm.interval_km, 10),
      last_service_km: lastKm,
      icon: addForm.icon || 'build',
      warn_percent: parseInt(addForm.warn_percent, 10) || 20,
    });

    setShowAddModal(false);
    setAddForm({
      name: '',
      description: '',
      interval_km: 3000,
      last_service_km: '',
      icon: 'build',
      warn_percent: 20,
    });
    showToast('Item servis berhasil ditambahkan!');
  };

  // Open Done Modal
  const openDoneModal = (item) => {
    setSelectedItem(item);
    setDoneForm({
      odometer_km: Math.round(currentOdoKm).toString(),
      cost: '',
      workshop: '',
      notes: '',
    });
    setShowDoneModal(true);
  };

  // Submit Done Service
  const handleCompleteService = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const odo = parseFloat(doneForm.odometer_km) || currentOdoKm;
    const cost = parseInt(doneForm.cost, 10) || 0;

    markServiceDone(
      selectedItem.id,
      odo,
      doneForm.notes,
      cost,
      doneForm.workshop
    );

    setShowDoneModal(false);
    showToast(`Servis ${selectedItem.name} tuntas dicatat!`);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      interval_km: item.interval_km,
      last_service_km: item.last_service_km,
      icon: item.icon,
      warn_percent: item.warn_percent || 20,
    });
    setShowEditModal(true);
  };

  // Submit Edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    updateServiceItem(selectedItem.id, {
      name: editForm.name,
      description: editForm.description,
      interval_km: parseInt(editForm.interval_km, 10),
      last_service_km: parseFloat(editForm.last_service_km),
      icon: editForm.icon,
      warn_percent: parseInt(editForm.warn_percent, 10),
    });

    setShowEditModal(false);
    showToast('Item servis berhasil diperbarui!');
  };

  // Delete Item
  const handleDelete = (id, name) => {
    if (confirm(`Yakin ingin menghapus item servis "${name}"?`)) {
      deleteServiceItem(id);
      showToast('Item servis dihapus');
    }
  };

  return (
    <div className="flex flex-col w-full px-4 pb-10 gap-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-lg text-body-md flex items-center gap-2 animate-count-up max-w-[90%]">
          <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">
            check_circle
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Controls: Live Odo & Add Trigger */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high shadow-sm border border-surface-container">
          <span
            className="material-symbols-outlined text-[18px] text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            speed
          </span>
          <span className="text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
            Odo Live
          </span>
          <span className="text-label-md text-primary font-extrabold font-mono">
            {formatKm(currentOdoKm)} km
          </span>
        </div>

        <button
          onClick={() => {
            setAddForm({ ...addForm, last_service_km: Math.round(currentOdoKm).toString() });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-container text-on-primary shadow-sm active:scale-95 transition-all text-label-md font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          <span>Tambah</span>
        </button>
      </div>

      {/* Filter Segmented Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`filter-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-label-md font-bold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span>Semua</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeFilter === 'all'
                ? 'bg-surface-container-lowest/30 text-on-primary'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {calculatedItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('urgent')}
          className={`filter-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-label-md font-bold transition-all cursor-pointer ${
            activeFilter === 'urgent'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-error"></span>
          <span>Perlu Servis</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeFilter === 'urgent'
                ? 'bg-surface-container-lowest/30 text-on-primary'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            {urgentCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('safe')}
          className={`filter-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-label-md font-bold transition-all cursor-pointer ${
            activeFilter === 'safe'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-tertiary"></span>
          <span>Aman</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeFilter === 'safe'
                ? 'bg-surface-container-lowest/30 text-on-primary'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {safeCount}
          </span>
        </button>
      </div>

      {/* Formula Guidance Banner (Collapsible) */}
      <div className="rounded-2xl bg-surface-container-low p-4 shadow-sm border border-surface-container/60">
        <div
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-start justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">functions</span>
            </div>
            <div>
              <p className="text-label-md font-bold text-on-surface">
                Kalkulasi Otomatis Sisa Servis
              </p>
              <p className="text-label-sm text-on-surface-variant">
                Sinkron langsung dari telemetri odometer ESP32
              </p>
            </div>
          </div>
          <span
            className={`material-symbols-outlined text-[22px] text-outline transition-transform duration-200 ${
              showFormula ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>

        {showFormula && (
          <div className="pt-3 mt-3 border-t border-surface-container flex flex-col gap-2 animate-count-up">
            <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm text-label-sm text-primary font-mono">
              <span className="font-bold text-on-surface">Sisa km</span> = (km terakhir + interval)
              − odometer saat ini
            </div>
            <p className="text-label-sm text-on-surface-variant leading-relaxed">
              Sistem otomatis memberi tanda{' '}
              <span className="text-error font-bold">Terlewat</span> bila nilai negatif, status{' '}
              <span className="text-on-secondary-fixed-variant font-bold">Segera</span> jika
              pemakaian menyisakan ≤ 20% interval jarak tempuh, dan{' '}
              <span className="text-tertiary font-bold">Aman</span> jika masih di atas batas
              peringatan.
            </p>
          </div>
        )}
      </div>

      {/* Service List Cards */}
      <div className="flex flex-col gap-4">
        {filteredItems.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center flex flex-col items-center gap-2 border border-surface-container">
            <span className="material-symbols-outlined text-outline text-4xl">check_circle</span>
            <p className="text-body-lg font-bold text-on-surface">Tidak ada item dalam kategori ini</p>
            <p className="text-label-sm text-secondary">
              Semua komponen berada dalam kondisi baik atau filter tidak memiliki item.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const { statusInfo } = item;
            const isTerlewat = statusInfo.status === 'terlewat';
            const isSegera = statusInfo.status === 'segera';

            const badgeBg = isTerlewat
              ? 'bg-status-terlewat-bg text-status-terlewat-text'
              : isSegera
              ? 'bg-secondary-fixed text-on-secondary-fixed'
              : 'bg-surface-container-low text-tertiary';

            const iconBg = isTerlewat
              ? 'bg-error-container text-on-error-container'
              : isSegera
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container text-tertiary';

            const barColor = isTerlewat
              ? 'bg-error'
              : isSegera
              ? 'bg-primary'
              : 'bg-tertiary';

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm flex flex-col gap-3.5 border border-surface-container/60 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0 font-bold`}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {item.icon || 'build'}
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-headline-sm font-bold text-on-surface truncate">
                        {item.name}
                      </h3>
                      <span className="text-label-sm text-on-surface-variant truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider ${badgeBg}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isTerlewat ? 'bg-error' : isSegera ? 'bg-primary' : 'bg-tertiary'
                        }`}
                      ></span>
                      {statusInfo.status}
                    </span>
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Item"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      title="Hapus Item"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/40 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Grid (PRD 8) */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-surface-container-low text-center">
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Terakhir Servis</p>
                    <p className="text-label-md font-bold text-on-surface font-mono">
                      {formatKm(item.last_service_km)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Interval</p>
                    <p className="text-label-md font-bold text-on-surface font-mono">
                      {formatKm(item.interval_km)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Batas Servis</p>
                    <p
                      className={`text-label-md font-bold font-mono ${
                        isTerlewat ? 'text-error' : 'text-primary'
                      }`}
                    >
                      {formatKm(statusInfo.nextServiceKm)} km
                    </p>
                  </div>
                </div>

                {/* Progress Meter Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-label-sm">
                    <span
                      className={`font-bold inline-flex items-center gap-1 ${
                        isTerlewat
                          ? 'text-error'
                          : isSegera
                          ? 'text-primary'
                          : 'text-tertiary'
                      }`}
                    >
                      {isTerlewat && (
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                      )}
                      {isTerlewat
                        ? `Terlewat ${formatKm(Math.abs(statusInfo.sisaKm))} km`
                        : `Sisa ${formatKm(statusInfo.sisaKm)} km`}
                    </span>
                    <span className="text-on-surface-variant font-medium">
                      {Math.round(statusInfo.progressPercent)}% terpakai
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(statusInfo.progressPercent, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Primary Action: Mark as Done */}
                <button
                  onClick={() => openDoneModal(item)}
                  className={`w-full py-2.5 px-4 rounded-full font-label-md font-bold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer ${
                    isTerlewat
                      ? 'bg-error hover:bg-error/90 text-on-error'
                      : isSegera
                      ? 'bg-primary hover:bg-primary-container text-on-primary'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Tandai Servis Selesai</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Tambah Item Servis */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-count-up max-h-[90vh] overflow-y-auto border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">add_circle</span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  Tambah Item Servis Baru
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">
                  Nama Komponen Servis *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rantai & Gir, Minyak Rem, Radiator Coolant"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">Deskripsi</label>
                <input
                  type="text"
                  placeholder="Keterangan spesifikasi / merk suku cadang"
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    Interval Servis (KM) *
                  </label>
                  <input
                    type="number"
                    required
                    step="100"
                    placeholder="Contoh: 4000"
                    value={addForm.interval_km}
                    onChange={(e) => setAddForm({ ...addForm, interval_km: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    KM Servis Terakhir
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Kosong = Odo sekarang"
                    value={addForm.last_service_km}
                    onChange={(e) =>
                      setAddForm({ ...addForm, last_service_km: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">Ikon</label>
                  <select
                    value={addForm.icon}
                    onChange={(e) => setAddForm({ ...addForm, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="oil_barrel">Oli (oil_barrel)</option>
                    <option value="air">Filter Udara (air)</option>
                    <option value="brake_alert">Rem / Kampas (brake_alert)</option>
                    <option value="settings">Gardan / Gir (settings)</option>
                    <option value="electric_bolt">Busi / Kelistrikan (electric_bolt)</option>
                    <option value="sync_alt">CVT / Rantai (sync_alt)</option>
                    <option value="tire_repair">Ban (tire_repair)</option>
                    <option value="build">Umum (build)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    Ambang Segera (%)
                  </label>
                  <input
                    type="number"
                    value={addForm.warn_percent}
                    onChange={(e) => setAddForm({ ...addForm, warn_percent: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-full text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold shadow-sm"
                >
                  Simpan Komponen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tandai Servis Selesai */}
      {showDoneModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-count-up max-h-[90vh] overflow-y-auto border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-2xl">
                  task_alt
                </span>
                <h3 className="text-headline-sm font-bold text-on-surface">
                  Konfirmasi Servis: {selectedItem.name}
                </h3>
              </div>
              <button
                onClick={() => setShowDoneModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <p className="text-body-md text-on-surface-variant">
              Tindakan ini akan mencatat log servis ke riwayat dan memperbarui KM servis terakhir
              ke odometer saat ini, me-reset interval {formatKm(selectedItem.interval_km)} km.
            </p>

            <form onSubmit={handleCompleteService} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    Odometer Servis (KM) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={doneForm.odometer_km}
                    onChange={(e) => setDoneForm({ ...doneForm, odometer_km: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    Biaya Penggantian (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={doneForm.cost}
                    onChange={(e) => setDoneForm({ ...doneForm, cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">
                  Nama Bengkel / Mekanik
                </label>
                <input
                  type="text"
                  placeholder="Contoh: AHASS Kalimalang / Ganti Sendiri"
                  value={doneForm.workshop}
                  onChange={(e) => setDoneForm({ ...doneForm, workshop: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">
                  Catatan Suku Cadang
                </label>
                <textarea
                  rows={2}
                  placeholder="Merk oli/suku cadang, nomor part, garansi..."
                  value={doneForm.notes}
                  onChange={(e) => setDoneForm({ ...doneForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDoneModal(false)}
                  className="px-4 py-2.5 rounded-full text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold shadow-sm"
                >
                  Konfirmasi & Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Item Servis */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-xl flex flex-col gap-4 animate-count-up max-h-[90vh] overflow-y-auto border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">edit</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Edit Item Servis</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">Nama Item *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label-sm text-secondary font-semibold">Deskripsi</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    Interval Servis (KM) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.interval_km}
                    onChange={(e) => setEditForm({ ...editForm, interval_km: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-label-sm text-secondary font-semibold">
                    KM Terakhir Servis
                  </label>
                  <input
                    type="number"
                    value={editForm.last_service_km}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_service_km: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md font-mono border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-full text-label-md font-semibold text-on-surface-variant hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
