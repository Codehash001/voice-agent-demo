-- Supabase SQL Schema for Authentication & Businesses
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- =====================================================
-- USERS PROFILE TABLE
-- =====================================================

-- Create users_profile table to store user roles and business assignments
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'business_admin' CHECK (role IN ('master_admin', 'business_admin')),
  business_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is master admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = auth.uid() AND role = 'master_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON users_profile
  FOR SELECT USING (auth.uid() = id);

-- Policy: Master admins can read all profiles
CREATE POLICY "Master admins can view all profiles" ON users_profile
  FOR SELECT USING (public.is_master_admin());

-- Policy: Master admins can insert profiles
CREATE POLICY "Master admins can insert profiles" ON users_profile
  FOR INSERT WITH CHECK (public.is_master_admin());

-- Policy: Master admins can update profiles
CREATE POLICY "Master admins can update profiles" ON users_profile
  FOR UPDATE USING (public.is_master_admin());

-- Policy: Master admins can delete profiles
CREATE POLICY "Master admins can delete profiles" ON users_profile
  FOR DELETE USING (public.is_master_admin());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, role)
  VALUES (NEW.id, NEW.email, 'business_admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- BUSINESSES TABLE
-- =====================================================

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_no TEXT,
  address TEXT,
  operating_hours JSONB DEFAULT '{}',  -- e.g., {"monday": "9:00-17:00", "tuesday": "9:00-17:00"}
  practice_software TEXT,
  services TEXT[],  -- Array of services offered
  no_show_fees DECIMAL(10, 2) DEFAULT 0,
  admin_email TEXT NOT NULL,
  additional_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Policy: Master admins can do everything with businesses
CREATE POLICY "Master admins full access to businesses" ON businesses
  FOR ALL USING (public.is_master_admin());

-- Policy: Business admins can view their assigned business
CREATE POLICY "Business admins can view own business" ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = businesses.id
    )
  );

-- Policy: Business admins can update their assigned business
CREATE POLICY "Business admins can update own business" ON businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = businesses.id
    )
  );

-- Update users_profile to reference businesses table
ALTER TABLE users_profile
  DROP CONSTRAINT IF EXISTS users_profile_business_id_fkey;

ALTER TABLE users_profile
  ADD CONSTRAINT users_profile_business_id_fkey
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- BUSINESS AGENTS TABLE
-- =====================================================

-- Create business_agents table
CREATE TABLE IF NOT EXISTS business_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  greeting_text TEXT,
  pretendence BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE business_agents ENABLE ROW LEVEL SECURITY;

-- Policy: Master admins can do everything with agents
CREATE POLICY "Master admins full access to agents" ON business_agents
  FOR ALL USING (public.is_master_admin());

-- Policy: Business admins can view agents for their business
CREATE POLICY "Business admins can view own agents" ON business_agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agents.business_id
    )
  );

-- Policy: Business admins can insert agents for their business
CREATE POLICY "Business admins can insert own agents" ON business_agents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agents.business_id
    )
  );

-- Policy: Business admins can update agents for their business
CREATE POLICY "Business admins can update own agents" ON business_agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agents.business_id
    )
  );

-- Policy: Business admins can delete agents for their business
CREATE POLICY "Business admins can delete own agents" ON business_agents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agents.business_id
    )
  );

-- Trigger to auto-update updated_at for agents
DROP TRIGGER IF EXISTS update_business_agents_updated_at ON business_agents;
CREATE TRIGGER update_business_agents_updated_at
  BEFORE UPDATE ON business_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AGENT SERVICES TABLE (Lookup/Reference Table)
-- =====================================================

-- Create agent_services table for predefined service types
CREATE TABLE IF NOT EXISTS agent_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',  -- Default configuration template for this service
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert predefined services
INSERT INTO agent_services (name, display_name, description, config) VALUES
  ('regular_scheduling', 'Regular Scheduling', 'Standard appointment booking and scheduling', '{"enabled": true}'),
  ('missed_call_recovery', 'Missed Call Recovery', 'Automatically follow up on missed calls', '{"callback_delay_minutes": 5, "max_attempts": 3}'),
  ('appointment_confirmation', 'Appointment Confirmation', 'Confirm upcoming appointments with patients', '{"hours_before": 24, "send_reminder": true}'),
  ('smart_cancellation_fill', 'Smart Cancellation Fill', 'Automatically fill cancelled appointment slots', '{"notify_waitlist": true, "urgent_threshold_hours": 48}'),
  ('recalling', 'Recalling', 'Recall patients who havent visited in a while', '{"months_threshold": 6, "reminder_frequency": "monthly"}'),
  ('insurance_fee_prescreening', 'Insurance & Fee Pre-screening', 'Pre-screen insurance and discuss fees before appointments', '{"collect_insurance_info": true, "discuss_payment_options": true}'),
  ('treatment_followup', 'Treatment Follow-up', 'Follow up with patients after treatments', '{"followup_days": [1, 7, 30], "check_satisfaction": true}'),
  ('after_hours', 'After Hours', 'Handle calls outside of business hours', '{"emergency_escalation": true, "leave_message": true}'),
  ('new_patient_intake', 'New Patient Intake', 'Collect information from new patients', '{"collect_demographics": true, "send_forms": true, "schedule_first_visit": true}')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE agent_services ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read agent services (public reference data)
CREATE POLICY "Anyone can view agent services" ON agent_services
  FOR SELECT USING (true);

-- Policy: Only master admins can modify agent services
CREATE POLICY "Master admins can modify agent services" ON agent_services
  FOR ALL USING (public.is_master_admin());

-- =====================================================
-- BUSINESS AGENT SERVICES TABLE (Junction Table)
-- =====================================================

-- Create business_agent_services table to link businesses, agents, and services
CREATE TABLE IF NOT EXISTS business_agent_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES business_agents(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES agent_services(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,  -- true = active, false = paused
  config JSONB DEFAULT '{}',  -- Service-specific config overrides for this business/agent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique combination of business, agent, and service
  UNIQUE(business_id, agent_id, service_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE business_agent_services ENABLE ROW LEVEL SECURITY;

-- Policy: Master admins can do everything
CREATE POLICY "Master admins full access to business_agent_services" ON business_agent_services
  FOR ALL USING (public.is_master_admin());

-- Policy: Business admins can view their business agent services
CREATE POLICY "Business admins can view own agent services" ON business_agent_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agent_services.business_id
    )
  );

-- Policy: Business admins can insert agent services for their business
CREATE POLICY "Business admins can insert own agent services" ON business_agent_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agent_services.business_id
    )
  );

-- Policy: Business admins can update agent services for their business
CREATE POLICY "Business admins can update own agent services" ON business_agent_services
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agent_services.business_id
    )
  );

-- Policy: Business admins can delete agent services for their business
CREATE POLICY "Business admins can delete own agent services" ON business_agent_services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.business_id = business_agent_services.business_id
    )
  );

-- Trigger to auto-update updated_at for business_agent_services
DROP TRIGGER IF EXISTS update_business_agent_services_updated_at ON business_agent_services;
CREATE TRIGGER update_business_agent_services_updated_at
  BEFORE UPDATE ON business_agent_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
