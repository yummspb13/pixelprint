-- Добавляем поле originalRowId в таблицу PriceRow
-- Выполните этот SQL ПЕРЕД импортом CSV файлов

ALTER TABLE "PriceRow" 
ADD COLUMN "originalRowId" TEXT UNIQUE;
