-- ============================================================
-- Seed Data: 5 K-12 School Division Locations + Facilities
-- ============================================================

-- Locations
INSERT INTO locations (id, name, address, city, state, zip, phone, email, description, active) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'Lincoln Elementary School',
  '1234 Oak Street',
  'Springfield',
  'IL',
  '62701',
  '(217) 555-0101',
  'lincoln@springfield.k12.il.us',
  'Lincoln Elementary serves grades K–5 and features a full gymnasium, cafeteria, and large outdoor play areas available for community use on evenings and weekends.',
  true
),
(
  'a1000000-0000-0000-0000-000000000002',
  'Roosevelt Middle School',
  '456 Elm Avenue',
  'Springfield',
  'IL',
  '62702',
  '(217) 555-0202',
  'roosevelt@springfield.k12.il.us',
  'Roosevelt Middle School hosts grades 6–8 and offers a state-of-the-art auditorium, library, computer labs, and full sports facilities including a track and field.',
  true
),
(
  'a1000000-0000-0000-0000-000000000003',
  'Washington High School',
  '789 Maple Boulevard',
  'Springfield',
  'IL',
  '62703',
  '(217) 555-0303',
  'washington@springfield.k12.il.us',
  'Washington High School serves grades 9–12 and is home to a 1,200-seat performing arts center, competition gymnasium, weight room, and multiple athletic fields.',
  true
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Jefferson Community Center',
  '321 Pine Street',
  'Springfield',
  'IL',
  '62704',
  '(217) 555-0404',
  'jefferson@springfield.k12.il.us',
  'The Jefferson Community Center is a dedicated after-school and community hub with multipurpose rooms, a commercial kitchen, and event hall available for private bookings.',
  true
),
(
  'a1000000-0000-0000-0000-000000000005',
  'Central Administration & Conference Center',
  '555 Main Street',
  'Springfield',
  'IL',
  '62705',
  '(217) 555-0505',
  'central@springfield.k12.il.us',
  'The Central Administration Building houses district offices and a professional conference center with boardrooms, seminar rooms, and a 200-seat assembly hall.',
  true
);

-- Facilities for Lincoln Elementary
INSERT INTO facilities (id, location_id, name, description, capacity, hourly_rate, half_day_rate, full_day_rate, amenities, facility_type, requires_approval, min_booking_hours, max_booking_hours) VALUES
(
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Lincoln Gymnasium',
  'Full-size gymnasium with hardwood floors, basketball hoops, bleacher seating for 200, and a full sound system. Ideal for sports events, dances, and large gatherings.',
  200,
  75.00, 280.00, 520.00,
  '["Basketball hoops", "Bleacher seating (200)", "Sound system", "Stage area", "Locker rooms", "Scoreboard"]',
  'gymnasium', false, 2, 8
),
(
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'Lincoln Cafeteria',
  'Spacious cafeteria with commercial kitchen access, round tables, and a serving area. Great for banquets, fundraisers, and community dinners.',
  150,
  55.00, 200.00, 380.00,
  '["Round tables & chairs", "Commercial kitchen access", "Serving area", "Coffee station", "Projector & screen", "Microphone"]',
  'cafeteria', false, 2, 6
),
(
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'Lincoln Outdoor Field',
  'Large outdoor field with natural turf, suitable for soccer, baseball, or general outdoor events. Adjacent parking lot available.',
  300,
  40.00, 150.00, 280.00,
  '["Natural turf field", "Adjacent parking", "Portable restrooms available", "Lighting (seasonal)"]',
  'field', false, 2, 8
);

-- Facilities for Roosevelt Middle School
INSERT INTO facilities (id, location_id, name, description, capacity, hourly_rate, half_day_rate, full_day_rate, amenities, facility_type, requires_approval, min_booking_hours, max_booking_hours) VALUES
(
  'b1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000002',
  'Roosevelt Auditorium',
  'Professional 350-seat auditorium with a full stage, theatrical lighting, and digital sound system. Perfect for performances, assemblies, and graduation ceremonies.',
  350,
  120.00, 450.00, 850.00,
  '["350 fixed seats", "Full stage with curtains", "Theatrical lighting", "Digital sound system", "Green room", "Backstage area", "Hearing loop", "Projector & 4K screen"]',
  'auditorium', true, 2, 8
),
(
  'b1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000002',
  'Roosevelt Library & Media Center',
  'Quiet, professional library space with modular furniture, research stations, and presentation screens. Excellent for workshops, seminars, and tutoring sessions.',
  60,
  45.00, 165.00, 310.00,
  '["Modular furniture", "10 research stations", "Dual projection screens", "Whiteboard walls", "Video conferencing setup", "WiFi", "ADA accessible"]',
  'library', false, 1, 6
),
(
  'b1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000002',
  'Roosevelt Track & Field',
  '400m running track with field event areas including long jump, shot put, and high jump. Ideal for track meets, fitness events, and team practices.',
  500,
  60.00, 220.00, 420.00,
  '["400m rubberized track", "Long jump pit", "Shot put area", "High jump area", "Field lighting", "Timing system available", "Spectator bleachers (300)"]',
  'field', true, 2, 8
);

-- Facilities for Washington High School
INSERT INTO facilities (id, location_id, name, description, capacity, hourly_rate, half_day_rate, full_day_rate, amenities, facility_type, requires_approval, min_booking_hours, max_booking_hours) VALUES
(
  'b1000000-0000-0000-0000-000000000007',
  'a1000000-0000-0000-0000-000000000003',
  'Washington Performing Arts Center',
  'Premier 1,200-seat performing arts center with professional theatrical rigging, orchestra pit, full sound and lighting design, and lobby space for receptions.',
  1200,
  300.00, 1100.00, 2000.00,
  '["1,200 seats", "Professional stage rigging", "Orchestra pit", "Full sound & lighting design", "Dressing rooms (8)", "Green room", "Lobby reception area", "Box office", "Hearing loop", "WiFi throughout"]',
  'auditorium', true, 3, 8
),
(
  'b1000000-0000-0000-0000-000000000008',
  'a1000000-0000-0000-0000-000000000003',
  'Washington Competition Gymnasium',
  'NCAA-spec competition gymnasium with hardwood courts, professional scoreboards, and seating for 1,000. Available for tournaments, exhibitions, and large events.',
  1000,
  150.00, 550.00, 1000.00,
  '["2 full basketball courts", "Seating for 1,000", "Professional scoreboards", "Locker rooms (4)", "Referee rooms", "Press box", "Full PA system", "Concession area"]',
  'gymnasium', true, 2, 8
),
(
  'b1000000-0000-0000-0000-000000000009',
  'a1000000-0000-0000-0000-000000000003',
  'Washington Weight & Fitness Room',
  'Professional-grade fitness facility with free weights, cardio machines, and functional training areas. Available for team training camps and fitness certifications.',
  30,
  35.00, 125.00, 235.00,
  '["Free weights to 100 lbs", "12 cardio machines", "Functional training area", "Rubber flooring", "Mirrors", "Climate controlled", "Locker room access"]',
  'multipurpose', false, 1, 4
);

-- Facilities for Jefferson Community Center
INSERT INTO facilities (id, location_id, name, description, capacity, hourly_rate, half_day_rate, full_day_rate, amenities, facility_type, requires_approval, min_booking_hours, max_booking_hours) VALUES
(
  'b1000000-0000-0000-0000-000000000010',
  'a1000000-0000-0000-0000-000000000004',
  'Jefferson Event Hall',
  'Elegant event hall with a dance floor, stage, and customizable lighting. Ideal for weddings, galas, proms, and private celebrations.',
  250,
  95.00, 350.00, 650.00,
  '["Dance floor", "Stage platform", "LED lighting system", "Tables & chairs (250)", "Bar setup available", "AV system", "Catering kitchen access", "Coat room", "ADA accessible parking"]',
  'multipurpose', false, 3, 8
),
(
  'b1000000-0000-0000-0000-000000000011',
  'a1000000-0000-0000-0000-000000000004',
  'Jefferson Commercial Kitchen',
  'Health department-certified commercial kitchen with industrial equipment. Available for culinary events, catering prep, food service training, and pop-up restaurants.',
  20,
  65.00, 240.00, 450.00,
  '["6-burner commercial range", "Double convection oven", "Walk-in cooler & freezer", "Prep tables (stainless)", "Commercial dishwasher", "All utensils & equipment", "Health certified"]',
  'multipurpose', true, 2, 8
),
(
  'b1000000-0000-0000-0000-000000000012',
  'a1000000-0000-0000-0000-000000000004',
  'Jefferson Meeting Room A',
  'Professional meeting room configured for board-style seating. Equipped with video conferencing and presentation technology.',
  25,
  30.00, 110.00, 200.00,
  '["Boardroom table & chairs (25)", "75\" smart TV", "Video conferencing (Zoom/Teams ready)", "Whiteboard", "WiFi", "Climate controlled", "Coffee service available"]',
  'classroom', false, 1, 4
);

-- Facilities for Central Administration
INSERT INTO facilities (id, location_id, name, description, capacity, hourly_rate, half_day_rate, full_day_rate, amenities, facility_type, requires_approval, min_booking_hours, max_booking_hours) VALUES
(
  'b1000000-0000-0000-0000-000000000013',
  'a1000000-0000-0000-0000-000000000005',
  'Central Assembly Hall',
  'Professional 200-seat assembly hall suitable for district-wide meetings, large workshops, and formal ceremonies.',
  200,
  85.00, 310.00, 580.00,
  '["200 theater-style seats", "Raised stage", "Podium with microphone", "Dual projection screens", "Video recording setup", "Live streaming capable", "Hearing loop", "ADA accessible"]',
  'auditorium', true, 2, 8
),
(
  'b1000000-0000-0000-0000-000000000014',
  'a1000000-0000-0000-0000-000000000005',
  'Central Boardroom',
  'Executive-grade boardroom for high-profile meetings, interviews, and professional development sessions.',
  20,
  50.00, 180.00, 340.00,
  '["Executive conference table", "High-back leather chairs (20)", "85\" 4K display", "Video conferencing suite", "Soundproofed", "Climate controlled", "Dedicated WiFi", "Catering service available"]',
  'classroom', false, 1, 4
);

-- Default availability schedules (Mon–Fri 4pm–10pm, Sat 8am–10pm, Sun 10am–6pm)
-- Lincoln Gymnasium
INSERT INTO facility_schedules (facility_id, day_of_week, open_time, close_time) VALUES
('b1000000-0000-0000-0000-000000000001', 1, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000001', 2, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000001', 3, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000001', 4, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000001', 5, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000001', 6, '08:00', '22:00'),
('b1000000-0000-0000-0000-000000000001', 0, '10:00', '18:00');

-- Lincoln Cafeteria
INSERT INTO facility_schedules (facility_id, day_of_week, open_time, close_time) VALUES
('b1000000-0000-0000-0000-000000000002', 1, '17:00', '22:00'),
('b1000000-0000-0000-0000-000000000002', 2, '17:00', '22:00'),
('b1000000-0000-0000-0000-000000000002', 3, '17:00', '22:00'),
('b1000000-0000-0000-0000-000000000002', 4, '17:00', '22:00'),
('b1000000-0000-0000-0000-000000000002', 5, '17:00', '22:00'),
('b1000000-0000-0000-0000-000000000002', 6, '09:00', '22:00'),
('b1000000-0000-0000-0000-000000000002', 0, '10:00', '17:00');

-- Roosevelt Auditorium
INSERT INTO facility_schedules (facility_id, day_of_week, open_time, close_time) VALUES
('b1000000-0000-0000-0000-000000000004', 1, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000004', 2, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000004', 3, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000004', 4, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000004', 5, '16:00', '22:00'),
('b1000000-0000-0000-0000-000000000004', 6, '08:00', '22:00'),
('b1000000-0000-0000-0000-000000000004', 0, '10:00', '18:00');

-- Jefferson Event Hall (available daily)
INSERT INTO facility_schedules (facility_id, day_of_week, open_time, close_time) VALUES
('b1000000-0000-0000-0000-000000000010', 0, '10:00', '23:00'),
('b1000000-0000-0000-0000-000000000010', 1, '14:00', '23:00'),
('b1000000-0000-0000-0000-000000000010', 2, '14:00', '23:00'),
('b1000000-0000-0000-0000-000000000010', 3, '14:00', '23:00'),
('b1000000-0000-0000-0000-000000000010', 4, '14:00', '23:00'),
('b1000000-0000-0000-0000-000000000010', 5, '14:00', '23:00'),
('b1000000-0000-0000-0000-000000000010', 6, '08:00', '23:00');

-- Washington PAC (weekends + evenings)
INSERT INTO facility_schedules (facility_id, day_of_week, open_time, close_time) VALUES
('b1000000-0000-0000-0000-000000000007', 5, '17:00', '23:00'),
('b1000000-0000-0000-0000-000000000007', 6, '09:00', '23:00'),
('b1000000-0000-0000-0000-000000000007', 0, '12:00', '20:00');

-- Default payment settings (free / no payment configured)
INSERT INTO payment_settings (provider, is_active, allow_free_bookings, require_payment_upfront, currency)
VALUES ('free', true, true, false, 'USD')
ON CONFLICT DO NOTHING;

-- Sample promo codes
INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, active) VALUES
('COMMUNITY10', 'percentage', 10.00, 100, true),
('FIRSTBOOKING', 'fixed', 25.00, 50, true),
('NONPROFIT50', 'percentage', 50.00, NULL, true);
