-- Исправляем тип поля originalRowId в таблице PriceRow
-- Выполните этот SQL ПЕРЕД импортом CSV файлов

-- Сначала удаляем старое поле (если оно есть)
ALTER TABLE "PriceRow" DROP COLUMN IF EXISTS "originalRowId";

-- Добавляем поле с правильным типом TEXT
ALTER TABLE "PriceRow" 
ADD COLUMN "originalRowId" TEXT UNIQUE;
