-- Импорт Services в Supabase
-- Сначала очищаем таблицу
DELETE FROM "Service";

-- Вставляем данные
INSERT INTO "Service" (id, slug, name, description, image, category, "order", "categoryOrder", "isActive", "configuratorEnabled", "calculatorAvailable", "clickCount", "createdAt", "updatedAt") VALUES
(180, 'certificates', 'Certificates', 'Professional certificates in A4 and A5 sizes on 250gsm card', null, 'Business Stationery', 0, 0, true, true, true, 0, '2025-09-22T17:23:10.284Z', '2025-09-22T17:23:10.284Z'),
(181, 'digital-business-cards', 'Digital Business Cards', 'Professional digital business cards in single sided and double sided options', null, 'Business Stationery', 0, 0, true, true, true, 0, '2025-09-22T17:23:10.284Z', '2025-09-22T17:23:10.284Z'),
(182, 'appointment-cards', 'Appointment Cards', 'Professional appointment cards in black & white, color, and mixed options', null, 'Business Stationery', 0, 0, true, true, true, 0, '2025-09-22T17:23:10.284Z', '2025-09-22T17:23:10.284Z'),
(183, 'letterheads', 'Letterheads', 'Professional letterheads in A4 and A5 sizes, black & white and color options', null, 'Business Stationery', 0, 0, true, true, true, 0, '2025-09-22T17:23:10.284Z', '2025-09-22T17:23:10.284Z'),
(184, 'compliment-slips', 'Compliment Slips', 'Professional compliment slips in black & white and color options, single and double sided', null, 'Business Stationery', 0, 0, true, true, true, 0, '2025-09-22T17:23:10.284Z', '2025-09-22T17:23:10.284Z');
