-- ==============================================================================
-- MATCH & MAP WITH ME - PRODUCTION DATABASE SCHEMA (PostgreSQL / Supabase)
-- Real-time Travel Companion Matching, Live Chat, Emergency SOS, and Eco-Tracking
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS & PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  age INT CHECK (age >= 18 AND age <= 120),
  gender TEXT,
  nationality TEXT DEFAULT 'Indian',
  state TEXT,
  city TEXT,
  bio TEXT,
  avatar_url TEXT,
  phone TEXT,
  interests TEXT[] DEFAULT '{}',
  hobbies TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{"English", "Hindi"}',
  budget TEXT CHECK (budget IN ('budget', 'mid-range', 'luxury')) DEFAULT 'mid-range',
  travel_style TEXT DEFAULT 'Adventure',
  eco_score INT DEFAULT 80 CHECK (eco_score >= 0 AND eco_score <= 100),
  verified BOOLEAN DEFAULT false,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  status TEXT CHECK (status IN ('active', 'suspended', 'deleted')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TRIPS & GROUP TRAVEL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  state TEXT NOT NULL,
  image_url TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration INT GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  budget TEXT CHECK (budget IN ('budget', 'mid-range', 'luxury')) DEFAULT 'mid-range',
  budget_amount NUMERIC(10, 2) DEFAULT 0,
  max_companions INT DEFAULT 3 CHECK (max_companions >= 1 AND max_companions <= 20),
  description TEXT,
  interests TEXT[] DEFAULT '{}',
  eco_friendly BOOLEAN DEFAULT false,
  carbon_kg NUMERIC(6, 2) DEFAULT 50.00,
  transport_mode TEXT DEFAULT 'Train',
  eco_places TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('open', 'full', 'completed', 'cancelled')) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TRIP PARTICIPANTS & JOIN REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trip_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
  role TEXT CHECK (role IN ('host', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 4. REALTIME CHAT CONVERSATIONS & PARTICIPANTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  title TEXT,
  type TEXT CHECK (type IN ('direct', 'trip_group')) DEFAULT 'direct',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 5000),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. EMERGENCY CONTACTS & SOS SUB-SYSTEM
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relation TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  accuracy_meters NUMERIC(6, 2),
  battery_level INT CHECK (battery_level >= 0 AND battery_level <= 100),
  location_address TEXT,
  note TEXT,
  status TEXT CHECK (status IN ('active', 'resolved', 'false_alarm')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.sos_broadcast_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES public.sos_alerts(id) ON DELETE CASCADE,
  recipient_type TEXT CHECK (recipient_type IN ('contact', 'trip_buddy', 'local_authorities')) NOT NULL,
  recipient_name TEXT,
  recipient_phone TEXT,
  channel TEXT CHECK (channel IN ('sms', 'whatsapp', 'push', 'webhook')) DEFAULT 'sms',
  status TEXT CHECK (status IN ('sent', 'failed', 'delivered')) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. REVIEWS & RATINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  eco_rating INT NOT NULL CHECK (eco_rating >= 1 AND eco_rating <= 5),
  tags TEXT[] DEFAULT '{}',
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. WEATHER CACHE (15-Minute TTL for API Cost Optimization)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weather_cache (
  city_key TEXT PRIMARY KEY,
  latitude NUMERIC(9, 6) NOT NULL,
  longitude NUMERIC(9, 6) NOT NULL,
  temperature NUMERIC(4, 1) NOT NULL,
  weather_code INT NOT NULL,
  condition_text TEXT NOT NULL,
  wind_speed NUMERIC(5, 2),
  humidity INT,
  precipitation_prob INT,
  forecast_json JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_trips_destination ON public.trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_created ON public.chat_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_status ON public.sos_alerts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_weather_cache_cached_at ON public.weather_cache(cached_at);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_broadcast_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trips: Public read of open trips, owner full access
CREATE POLICY "Public can view active trips" ON public.trips FOR SELECT USING (status != 'deleted');
CREATE POLICY "Users can insert own trip" ON public.trips FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own trip" ON public.trips FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own trip" ON public.trips FOR DELETE USING (auth.uid() = owner_id);

-- Chat: Users can only see and send messages in conversations they belong to
CREATE POLICY "Participants can view conversations" ON public.chat_conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.conversation_id = id AND cp.user_id = auth.uid()));

CREATE POLICY "Participants can view chat messages" ON public.chat_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.conversation_id = chat_messages.conversation_id AND cp.user_id = auth.uid()));

CREATE POLICY "Participants can insert chat messages" ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.conversation_id = chat_messages.conversation_id AND cp.user_id = auth.uid())
  );

-- Emergency Contacts: Full control of own contacts
CREATE POLICY "Users manage own emergency contacts" ON public.emergency_contacts FOR ALL USING (auth.uid() = user_id);

-- SOS Alerts: User can insert/update; emergency contacts and trip buddies can read active alerts
CREATE POLICY "Users manage own SOS alerts" ON public.sos_alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Trip buddies can read active SOS alerts" ON public.sos_alerts FOR SELECT
  USING (
    status = 'active' AND
    trip_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.trip_members tm WHERE tm.trip_id = sos_alerts.trip_id AND tm.user_id = auth.uid() AND tm.status = 'approved')
  );

-- Weather Cache: Public read
CREATE POLICY "Anyone can read cached weather" ON public.weather_cache FOR SELECT USING (true);

-- ------------------------------------------------------------------------------
-- SUPABASE REALTIME REPLICATION SETUP
-- ------------------------------------------------------------------------------
-- Run this to replicate new chat messages, SOS emergency alerts, and join updates in real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;
