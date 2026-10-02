-- =========================================================
-- MOTOTRACK SUPABASE DATABASE SCHEMA
-- Berdasarkan PRD Motor Odometer Tracker (PRD Section 9.4)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Honda Vario 160',
    plate VARCHAR(20) DEFAULT 'B 4821 KTF',
    device_id VARCHAR(50) DEFAULT 'MotorTracker-A49F',
    odometer_m BIGINT NOT NULL DEFAULT 14852320,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICE_ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.service_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'build',
    interval_km INT NOT NULL DEFAULT 2000,
    last_service_km NUMERIC(10,2) NOT NULL DEFAULT 0,
    warn_percent INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SERVICE_LOGS TABLE
CREATE TABLE IF NOT EXISTS public.service_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_item_id UUID REFERENCES public.service_items(id) ON DELETE CASCADE,
    odometer_km NUMERIC(10,2) NOT NULL,
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    cost INT DEFAULT 0,
    workshop VARCHAR(150),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;

-- Allow public access for demo / anon key (customizable according to your auth flow)
CREATE POLICY "Allow anon read/write vehicles" ON public.vehicles FOR ALL USING (true);
CREATE POLICY "Allow anon read/write service_items" ON public.service_items FOR ALL USING (true);
CREATE POLICY "Allow anon read/write service_logs" ON public.service_logs FOR ALL USING (true);
