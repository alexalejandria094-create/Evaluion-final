INSERT INTO vet_service (name, price, duration, description) VALUES ('Consulta General', 35.00, '30 min', 'Revisión general de estado físico');
INSERT INTO vet_service (name, price, duration, description) VALUES ('Vacunación', 25.00, '15 min', 'Aplicación de vacunas anuales');
INSERT INTO vet_service (name, price, duration, description) VALUES ('Desparasitación', 15.00, '15 min', 'Desparasitación interna y externa');
INSERT INTO vet_service (name, price, duration, description) VALUES ('Peluquería', 45.00, '60 min', 'Baño, corte de pelo y uñas');

INSERT INTO pet (name, species, breed, age, owner, phone, last_visit) VALUES ('Rex', 'Perro', 'Pastor Alemán', 4, 'Carlos Rodríguez', '555-0101', '2023-11-15');
INSERT INTO pet (name, species, breed, age, owner, phone, last_visit) VALUES ('Luna', 'Gato', 'Siamés', 2, 'Ana García', '555-0202', '2024-01-10');

INSERT INTO appointment (pet_id, service_id, date, time, status) VALUES (1, 1, '2024-04-15', '09:00', 'confirmed');
INSERT INTO appointment (pet_id, service_id, date, time, status) VALUES (2, 2, '2024-04-16', '10:30', 'confirmed');
INSERT INTO appointment (pet_id, service_id, date, time, status) VALUES (1, 4, '2024-04-17', '15:00', 'pending');
