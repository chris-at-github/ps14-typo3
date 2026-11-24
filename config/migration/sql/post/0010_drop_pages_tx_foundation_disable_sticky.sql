-- Post (after the wizards): ps14Site_disableStickyMigration (ps14_site) copies the value to
-- pages.tx_site_disable_sticky. ps14_foundation v14 no longer has the field.
-- Idempotent: IF EXISTS (MariaDB).
ALTER TABLE pages DROP COLUMN IF EXISTS tx_foundation_disable_sticky;
