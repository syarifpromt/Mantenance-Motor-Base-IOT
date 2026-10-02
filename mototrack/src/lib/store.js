'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_VEHICLE, MOCK_TELEMETRY, MOCK_SERVICE_ITEMS, MOCK_SERVICE_LOGS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  vehicle: 'mototrack_vehicle',
  telemetry: 'mototrack_telemetry',
  serviceItems: 'mototrack_service_items',
  serviceLogs: 'mototrack_service_logs',
  settings: 'mototrack_settings',
};

function loadFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

export function StoreProvider({ children }) {
  const [vehicle, setVehicle] = useState(MOCK_VEHICLE);
  const [telemetry, setTelemetry] = useState(MOCK_TELEMETRY);
  const [serviceItems, setServiceItems] = useState(MOCK_SERVICE_ITEMS);
  const [serviceLogs, setServiceLogs] = useState(MOCK_SERVICE_LOGS);
  const [settings, setSettings] = useState({
    warnPercent: 20,
    notificationsEnabled: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data dari localStorage saat client startup
  useEffect(() => {
    const storedVehicle = loadFromStorage(STORAGE_KEYS.vehicle, null);
    if (storedVehicle) setVehicle(storedVehicle);
    const storedTelemetry = loadFromStorage(STORAGE_KEYS.telemetry, null);
    if (storedTelemetry) setTelemetry(storedTelemetry);
    const storedItems = loadFromStorage(STORAGE_KEYS.serviceItems, null);
    if (storedItems) setServiceItems(storedItems);
    const storedLogs = loadFromStorage(STORAGE_KEYS.serviceLogs, null);
    if (storedLogs) setServiceLogs(storedLogs);
    const storedSettings = loadFromStorage(STORAGE_KEYS.settings, null);
    if (storedSettings) setSettings(storedSettings);
    setIsLoaded(true);
  }, []);

  // Persist ke localStorage setiap ada perubahan
  useEffect(() => {
    if (!isLoaded) return;
    saveToStorage(STORAGE_KEYS.vehicle, vehicle);
  }, [vehicle, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveToStorage(STORAGE_KEYS.telemetry, telemetry);
  }, [telemetry, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveToStorage(STORAGE_KEYS.serviceItems, serviceItems);
  }, [serviceItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveToStorage(STORAGE_KEYS.serviceLogs, serviceLogs);
  }, [serviceLogs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveToStorage(STORAGE_KEYS.settings, settings);
  }, [settings, isLoaded]);

  // ---- Service Items CRUD ----
  const addServiceItem = useCallback((item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
    };
    setServiceItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateServiceItem = useCallback((id, updates) => {
    setServiceItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const deleteServiceItem = useCallback((id) => {
    setServiceItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // ---- Service Logs ----
  const addServiceLog = useCallback((log) => {
    const newLog = {
      ...log,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    };
    setServiceLogs(prev => [newLog, ...prev]);
    return newLog;
  }, []);

  const deleteServiceLog = useCallback((id) => {
    setServiceLogs(prev => prev.filter(log => log.id !== id));
  }, []);

  // ---- Mark service as done ----
  const markServiceDone = useCallback((serviceItemId, odometerKm, notes = '', cost = 0, workshop = '') => {
    // Update last_service_km pada service item
    setServiceItems(prev => prev.map(item =>
      item.id === serviceItemId
        ? { ...item, last_service_km: odometerKm }
        : item
    ));

    // Tambah log
    const item = serviceItems.find(i => i.id === serviceItemId);
    const newLog = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      service_item_id: serviceItemId,
      service_name: item ? item.name : 'Servis',
      odometer_km: odometerKm,
      performed_at: new Date().toISOString(),
      notes,
      cost,
      workshop,
      tags: [],
    };
    setServiceLogs(prev => [newLog, ...prev]);
    return newLog;
  }, [serviceItems]);

  // ---- Telemetry update (mock BLE sync) ----
  const updateTelemetry = useCallback((newTelemetry) => {
    setTelemetry(prev => ({ ...prev, ...newTelemetry, lastSync: new Date().toISOString() }));
  }, []);

  // ---- Update odometer ----
  const updateOdometer = useCallback((newOdometerM) => {
    setTelemetry(prev => ({ ...prev, odometer_m: newOdometerM, lastSync: new Date().toISOString() }));
  }, []);

  // ---- Update settings ----
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const value = {
    vehicle,
    telemetry,
    serviceItems,
    serviceLogs,
    settings,
    isLoaded,
    setVehicle,
    updateTelemetry,
    updateOdometer,
    addServiceItem,
    updateServiceItem,
    deleteServiceItem,
    addServiceLog,
    deleteServiceLog,
    markServiceDone,
    updateSettings,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
