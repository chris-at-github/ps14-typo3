-- Pre (before the schema update): ps14_foundation 2.x stored the header layout "Container" as the string
-- "container". In v14 tt_content.header_layout becomes INT, ps14_site offers the value 10 instead
-- (page.tsconfig). Converted before the schema update so that no value is lost.
-- Idempotent: only rows that still have "container".
UPDATE tt_content SET header_layout = '10' WHERE header_layout = 'container';
