-- Импорт WhyArticles в Supabase
-- Сначала очищаем таблицу
DELETE FROM "WhyArticle";

-- Вставляем данные
INSERT INTO "WhyArticle" (id, title, text, image, href, span, "order", "isActive", content, images, "createdAt", "updatedAt") VALUES
(1, 'Why Choose Us?', 'We provide high-quality printing services with fast turnaround times.', '/uploads/why-articles/why-article-1758398492704.jpg', '/about', 'xl', 1, true, null, null, '2025-09-22T17:23:10.286Z', '2025-09-22T19:53:55.746Z'),
(2, 'Fast Delivery', 'Get your prints delivered quickly with our express service.', '/uploads/why-articles/why-article-1758398602306.jpg', '/delivery', null, 2, true, null, null, '2025-09-22T17:23:10.286Z', '2025-09-22T19:53:59.814Z');