-- Create hospitals table for the Hospital Load Balancer system
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  distance DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_beds INTEGER NOT NULL DEFAULT 0,
  available_beds INTEGER NOT NULL DEFAULT 0,
  icu_beds INTEGER NOT NULL DEFAULT 0,
  available_icu INTEGER NOT NULL DEFAULT 0,
  load_percentage INTEGER NOT NULL DEFAULT 0,
  specialization TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create patient_requests table for logging patient allocation requests
CREATE TABLE IF NOT EXISTS patient_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL,
  location TEXT NOT NULL,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('Cardiac', 'Accident', 'General', 'Neuro')),
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'Critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'allocated', 'closed')),
  allocated_hospital_id UUID REFERENCES hospitals(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_log table for tracking system events
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (this is a demo app without auth)
CREATE POLICY "Allow public read access on hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on hospitals" ON hospitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on hospitals" ON hospitals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on hospitals" ON hospitals FOR DELETE USING (true);

CREATE POLICY "Allow public read access on patient_requests" ON patient_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on patient_requests" ON patient_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on patient_requests" ON patient_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on patient_requests" ON patient_requests FOR DELETE USING (true);

CREATE POLICY "Allow public read access on activity_log" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on activity_log" ON activity_log FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_hospitals_updated_at ON hospitals;
CREATE TRIGGER update_hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_requests_updated_at ON patient_requests;
CREATE TRIGGER update_patient_requests_updated_at
  BEFORE UPDATE ON patient_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE patient_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
