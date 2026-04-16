-- Seed initial hospital data
INSERT INTO hospitals (name, location, distance, total_beds, available_beds, icu_beds, available_icu, load_percentage, specialization) VALUES
('Apollo Hospitals', 'Sholinganallur', 2.3, 50, 32, 12, 8, 64, ARRAY['Cardiac', 'General', 'Neuro']),
('Kauvery Hospital', 'OMR', 4.7, 50, 12, 8, 2, 86, ARRAY['Accident', 'General']),
('Sri Ramachandra', 'Porur', 7.1, 40, 0, 6, 0, 100, ARRAY['Cardiac', 'Neuro']),
('Government GH', 'Tambaram', 11.2, 60, 45, 10, 6, 38, ARRAY['General', 'Accident']),
('MIOT International', 'Manapakkam', 8.5, 80, 35, 15, 7, 56, ARRAY['Cardiac', 'Accident', 'Neuro']),
('Fortis Malar', 'Adyar', 5.8, 45, 20, 8, 4, 55, ARRAY['Cardiac', 'General']),
('Vijaya Hospital', 'Vadapalani', 9.3, 55, 28, 10, 5, 49, ARRAY['General', 'Neuro']),
('SRMC Hospital', 'Guindy', 6.2, 65, 15, 12, 3, 77, ARRAY['Accident', 'General', 'Cardiac'])
ON CONFLICT DO NOTHING;

-- Seed some initial patient requests
INSERT INTO patient_requests (patient_id, location, condition_type, severity, status) VALUES
('P124', 'OMR', 'Cardiac', 'Critical', 'allocated'),
('P125', 'Guindy', 'Accident', 'Medium', 'pending'),
('P126', 'Tambaram', 'General', 'Low', 'pending'),
('P127', 'Porur', 'Neuro', 'Critical', 'pending')
ON CONFLICT DO NOTHING;

-- Seed activity log
INSERT INTO activity_log (event_type, description, metadata) VALUES
('patient_request', 'New Patient Request', '{"time": "11:02 AM", "severity": "Critical", "location": "OMR"}'),
('hospital_update', 'Hospital Updated', '{"hospital": "Kauvery", "beds_change": "15 → 12"}'),
('patient_allocated', 'Patient Allocated', '{"hospital": "Apollo", "patient_id": "P124"}')
ON CONFLICT DO NOTHING;
