-- Импорт MenuTiles в Supabase
-- Сначала очищаем таблицу
DELETE FROM "MenuTile";

-- Вставляем данные
INSERT INTO "MenuTile" (id, label, href, image, "order", "isActive", "createdAt", "updatedAt") VALUES
(1, 'Business Cards', '/services/business-card-printing', '/uploads/services/business-cards.jpg', 1, true, '2025-09-22T17:23:10.284Z', '2025-09-22T17:23:10.284Z'),
(2, 'Flyers', '/services/flyers', '/uploads/services/flyers.jpg', 2, true, '2025-09-22T17:23:10.284Z', '2025-09-22T17:23:10.284Z');