-- Demo data. Safe to run repeatedly after schema.sql.
-- Passwords and PINs here are for local development only.
USE readerops;

-- password for all seeded accounts: ChangeMe!2026
SET @hash = '$2y$12$e0NRMa2kXwZPRvvxoQZf9.0wqvL3sBqYg0cQKJ0N8iGLY9mQ9kH0K';

INSERT INTO users (id, role, full_name, phone, email, password_hash, pin_hash) VALUES
  (1, 'admin',       'Admin One',    '+233200000001', 'admin@readerops.test', @hash, NULL),
  (2, 'distributor', 'Kofi Mensah',  '+233200000002', NULL,                   NULL,  @hash),
  (3, 'distributor', 'Ama Boateng',  '+233200000003', NULL,                   NULL,  @hash),
  (4, 'reviewer',    'Advisor Name', '+233200000004', 'advisor@readerops.test', @hash, NULL);

INSERT INTO distributors (user_id, community, operating_area, trained_on) VALUES
  (2, 'Ashaiman Central', 'Ashaiman',   '2026-11-10'),
  (3, 'Madina Market',    'La Nkwantanang', '2026-11-10');

-- The active protocol. reviewed_by and reviewed_at are NOT NULL by design:
-- replace the placeholder with the real advisor before any real screening.
INSERT INTO protocol_versions
  (version, threshold_logmar, min_age, presentations, pass_threshold,
   min_duration_ms, min_stroke_px, ladder_json, power_table_json,
   red_flags_json, reviewed_by, reviewed_at, published_by)
VALUES
  ('1.0.0', 0.27, 40, 5, 3, 20000, 6,
   JSON_ARRAY(
     JSON_OBJECT('level',0,'n','N64','logmar',1.30),
     JSON_OBJECT('level',1,'n','N50.4','logmar',1.19),
     JSON_OBJECT('level',2,'n','N40','logmar',1.09),
     JSON_OBJECT('level',3,'n','N32','logmar',1.00),
     JSON_OBJECT('level',4,'n','N25.6','logmar',0.90),
     JSON_OBJECT('level',5,'n','N20','logmar',0.79),
     JSON_OBJECT('level',6,'n','N16','logmar',0.70),
     JSON_OBJECT('level',7,'n','N12.8','logmar',0.60),
     JSON_OBJECT('level',8,'n','N10','logmar',0.49),
     JSON_OBJECT('level',9,'n','N8','logmar',0.40),
     JSON_OBJECT('level',10,'n','N6','logmar',0.27),
     JSON_OBJECT('level',11,'n','N3.2','logmar',0.00)
   ),
   JSON_ARRAY(
     JSON_OBJECT('from',35,'to',45,'power',1.00),
     JSON_OBJECT('from',46,'to',50,'power',1.50),
     JSON_OBJECT('from',51,'to',55,'power',2.00),
     JSON_OBJECT('from',56,'to',120,'power',2.50)
   ),
   JSON_ARRAY(
     'Pain in or around the eye',
     'Sudden change in vision',
     'One eye much worse than the other',
     'Trouble seeing far away as well as near',
     'Diabetes, hypertension, thyroid disease or rheumatoid arthritis',
     'Previous eye surgery or injury'
   ),
   'PLACEHOLDER — replace with the advisor name before real use',
   '2026-11-20', 1);

-- Starting stock for the two demo distributors
INSERT INTO distributor_stock (distributor_id, lens_power, qty) VALUES
  (2, 1.00, 10), (2, 1.50, 15), (2, 2.00, 20), (2, 2.50, 10),
  (3, 1.00,  8), (3, 1.50, 12), (3, 2.00, 18), (3, 2.50,  8);
