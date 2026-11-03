-- External MySQL DBServer migration, not a Supabase public-schema migration.
CREATE TABLE IF NOT EXISTS vip_salary_clock (
 id TINYINT PRIMARY KEY, checked_date DATE NOT NULL
) ENGINE=InnoDB;
-- Start today; never award historical salaries from before activation.
INSERT IGNORE INTO vip_salary_clock (id, checked_date) VALUES (1, CURRENT_DATE());
CREATE TABLE IF NOT EXISTS vip_salary_jobs (
 id VARCHAR(64) PRIMARY KEY, reward_type VARCHAR(16) NOT NULL,
 period_key VARCHAR(16) NOT NULL, due_at DATETIME NOT NULL,
 tiers_json LONGTEXT NOT NULL, upper_id VARCHAR(191) NOT NULL,
 cursor_id VARCHAR(191) NOT NULL DEFAULT '', complete TINYINT NOT NULL DEFAULT 0,
 UNIQUE KEY salary_period (reward_type, period_key)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS vip_salary_cards (
 id VARCHAR(64) PRIMARY KEY, user_id VARCHAR(191) NOT NULL,
 reward_type VARCHAR(16) NOT NULL, period_key VARCHAR(16) NOT NULL,
 vip_level INT NOT NULL, amount DECIMAL(18,2) NOT NULL,
 status VARCHAR(16) NOT NULL DEFAULT 'active', created_at DATETIME NOT NULL,
 claimed_at DATETIME NULL,
 UNIQUE KEY member_salary_period (user_id, reward_type, period_key),
 INDEX member_cards (user_id, created_at)
) ENGINE=InnoDB;