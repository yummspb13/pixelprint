-- Очистка prepared statements в Supabase
-- Выполните этот SQL в Supabase SQL Editor

-- Очищаем все prepared statements
DEALLOCATE ALL;

-- Очищаем все таблицы
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "WhyArticle" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "PriceRow" CASCADE;
DROP TABLE IF EXISTS "Tier" CASCADE;
DROP TABLE IF EXISTS "ChangeHistory" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "MenuTile" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;

-- Очищаем все индексы
DROP INDEX IF EXISTS "Account_provider_providerAccountId_key";
DROP INDEX IF EXISTS "Session_sessionToken_key";
DROP INDEX IF EXISTS "User_email_key";
DROP INDEX IF EXISTS "VerificationToken_token_key";
DROP INDEX IF EXISTS "VerificationToken_identifier_token_key";

-- Очищаем все последовательности
DROP SEQUENCE IF EXISTS "Service_id_seq";
DROP SEQUENCE IF EXISTS "WhyArticle_id_seq";
DROP SEQUENCE IF EXISTS "User_id_seq";
DROP SEQUENCE IF EXISTS "Account_id_seq";
DROP SEQUENCE IF EXISTS "Session_id_seq";
DROP SEQUENCE IF EXISTS "VerificationToken_id_seq";
DROP SEQUENCE IF EXISTS "Order_id_seq";
DROP SEQUENCE IF EXISTS "OrderItem_id_seq";
DROP SEQUENCE IF EXISTS "PriceRow_id_seq";
DROP SEQUENCE IF EXISTS "Tier_id_seq";
DROP SEQUENCE IF EXISTS "ChangeHistory_id_seq";
DROP SEQUENCE IF EXISTS "Invoice_id_seq";
DROP SEQUENCE IF EXISTS "MenuTile_id_seq";
DROP SEQUENCE IF EXISTS "Settings_id_seq";

-- Очищаем все типы
DROP TYPE IF EXISTS "PriceRuleKind";
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "InvoiceStatus";
DROP TYPE IF EXISTS "ChangeType";
DROP TYPE IF EXISTS "TierType";
DROP TYPE IF EXISTS "MenuTileType";
DROP TYPE IF EXISTS "SettingsType";
