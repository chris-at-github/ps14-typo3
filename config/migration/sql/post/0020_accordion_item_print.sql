-- Post (after the upgrade wizards): print settings of the accordion items. ps14_foundation 2.x stored them in
-- tx_foundation_domain_model_elements, the wizard "ps14Migration_accordionElementsMigration" keeps the uids,
-- KIST adds the fields tx_site_print_* to tx_modules_accordion_item (ps14_site).
-- Idempotent: copies the current values again. No comparison in WHERE, the tables use different collations.
UPDATE tx_modules_accordion_item i
	JOIN tx_foundation_domain_model_elements e ON e.uid = i.uid
SET i.tx_site_print_break = e.print_break,
	i.tx_site_print_visibility = e.print_visibility;
