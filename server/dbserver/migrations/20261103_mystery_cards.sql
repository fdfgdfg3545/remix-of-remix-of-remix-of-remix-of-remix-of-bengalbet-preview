-- External MySQL only. Inspect mystery_cash_cards for duplicate member/month rows
-- and reconcile before applying the unique key; never delete financial history.
CREATE TABLE IF NOT EXISTS mystery_card_clock (
 id TINYINT PRIMARY KEY, checked_month VARCHAR(7) NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO mystery_card_clock (id,checked_month) VALUES (1,DATE_FORMAT(CURRENT_DATE(),'%Y-%m'));
CREATE TABLE IF NOT EXISTS mystery_card_jobs (
 id VARCHAR(64) PRIMARY KEY, period_key VARCHAR(7) NOT NULL,
 due_at DATETIME NOT NULL, config_json LONGTEXT NOT NULL,
 upper_id VARCHAR(191) NOT NULL, cursor_id VARCHAR(191) NOT NULL DEFAULT '',
 complete TINYINT NOT NULL DEFAULT 0, UNIQUE KEY mystery_period (period_key)
) ENGINE=InnoDB;
-- Apply once, after checking SHOW INDEX for an equivalent existing constraint.
ALTER TABLE mystery_cash_cards ADD UNIQUE KEY member_mystery_month (user_id,month_year);