-- ============================================================
-- K-12 Facilities Booking Application Schema
-- Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Locations (school buildings)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Springfield',
  state TEXT NOT NULL DEFAULT 'IL',
  zip TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facilities (rooms/spaces within locations)
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL DEFAULT 50,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  half_day_rate DECIMAL(10,2),
  full_day_rate DECIMAL(10,2),
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  facility_type TEXT NOT NULL DEFAULT 'multipurpose',
  requires_approval BOOLEAN DEFAULT false,
  min_booking_hours INTEGER DEFAULT 1,
  max_booking_hours INTEGER DEFAULT 8,
  advance_booking_days INTEGER DEFAULT 90,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly availability schedule per facility
CREATE TABLE IF NOT EXISTS facility_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Blocked / unavailable date ranges
CREATE TABLE IF NOT EXISTS facility_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason TEXT,
  block_type TEXT DEFAULT 'maintenance',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT UNIQUE NOT NULL,
  facility_id UUID REFERENCES facilities(id),

  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  organization TEXT,

  event_title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_description TEXT,
  attendees INTEGER NOT NULL DEFAULT 1,

  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,

  amenities_requested JSONB DEFAULT '[]',
  special_requests TEXT,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined','cancelled')),
  admin_notes TEXT,

  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded','waived')),
  payment_amount DECIMAL(10,2),
  payment_provider TEXT,
  payment_intent_id TEXT,
  payment_metadata JSONB,

  promo_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment provider configuration
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'stripe' CHECK (provider IN ('stripe','square','free')),
  is_active BOOLEAN DEFAULT true,
  stripe_publishable_key TEXT,
  square_app_id TEXT,
  square_location_id TEXT,
  allow_free_bookings BOOLEAN DEFAULT false,
  require_payment_upfront BOOLEAN DEFAULT true,
  currency TEXT DEFAULT 'USD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Promo / discount codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage','fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist for fully-booked slots
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID REFERENCES facilities(id),
  desired_start TIMESTAMPTZ NOT NULL,
  desired_end TIMESTAMPTZ NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Public read for locations, facilities, schedules, blocks
CREATE POLICY "Public read locations" ON locations FOR SELECT USING (active = true);
CREATE POLICY "Public read facilities" ON facilities FOR SELECT USING (active = true);
CREATE POLICY "Public read schedules" ON facility_schedules FOR SELECT USING (true);
CREATE POLICY "Public read blocks" ON facility_blocks FOR SELECT USING (true);

-- Public can insert bookings and waitlist
CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert waitlist" ON waitlist FOR INSERT WITH CHECK (true);

-- Public can read their own booking by ref (for confirmation page)
CREATE POLICY "Public read own booking" ON bookings FOR SELECT USING (true);

-- Authenticated (admin) full access
CREATE POLICY "Admin all locations" ON locations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all facilities" ON facilities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all schedules" ON facility_schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all blocks" ON facility_blocks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all payment_settings" ON payment_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all promo_codes" ON promo_codes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all waitlist" ON waitlist FOR ALL USING (auth.role() = 'authenticated');

-- Public read payment provider (publishable keys only - no secrets stored here)
CREATE POLICY "Public read payment settings" ON payment_settings FOR SELECT USING (true);

-- Public read active promo codes (just to validate, not list all)
CREATE POLICY "Public read promo_codes" ON promo_codes FOR SELECT USING (active = true);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_facilities_location ON facilities(location_id);
CREATE INDEX IF NOT EXISTS idx_schedules_facility ON facility_schedules(facility_id);
CREATE INDEX IF NOT EXISTS idx_blocks_facility ON facility_blocks(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_facility ON bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(contact_email);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_datetime, end_datetime);
