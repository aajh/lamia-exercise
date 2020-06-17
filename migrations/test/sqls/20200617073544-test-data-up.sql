BEGIN;

INSERT INTO places (id, title, description, lat, lng, opening_hours_start, opening_hours_end) VALUES
('f92e2a09-fa07-4f7d-b02c-883a81dba496', 'Central Railway Station', 'Railway station', 60.1712, 24.9415, '04:00', '01:00'),
('56487fc1-398a-4c8d-ab1b-b59fec68ac1b', 'Stockmann', 'Department store', 60.1683, 24.9421, '10:00', '20:00'),
('91965d7a-8da1-400d-96d3-6740e71823be', 'Kämp', 'Hotel', 60.1680, 24.9462, '23:00', '08:00');

INSERT INTO keywords (id, label) VALUES
 ('c1406745-37bd-4da3-99ec-b40829e7acf2', 'Transit'),
 ('d7b5256e-7c62-48ae-ae87-6a08a9210882', 'Store');

INSERT INTO keyword_places (keyword_id, place_id) VALUES
('c1406745-37bd-4da3-99ec-b40829e7acf2', 'f92e2a09-fa07-4f7d-b02c-883a81dba496'),
('d7b5256e-7c62-48ae-ae87-6a08a9210882', '56487fc1-398a-4c8d-ab1b-b59fec68ac1b');

COMMIT;