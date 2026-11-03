CREATE TABLE IF NOT EXISTS cron_engine_state (
 id TINYINT PRIMARY KEY,
 enabled TINYINT NOT NULL DEFAULT 1,
 key_hash VARCHAR(255) NULL,
 cursor_id VARCHAR(191) NOT NULL DEFAULT '',
 upper_id VARCHAR(191) NOT NULL DEFAULT '',
 cycle_minute VARCHAR(16) NULL,
 cycle_complete TINYINT NOT NULL DEFAULT 1,
 processed INT NOT NULL DEFAULT 0,
 status VARCHAR(16) NOT NULL DEFAULT 'idle',
 windows_json LONGTEXT NULL,
 last_started DATETIME NULL,
 last_finished DATETIME NULL,
 last_success DATETIME NULL,
 last_error VARCHAR(255) NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO cron_engine_state (id) VALUES (1);
CREATE TABLE IF NOT EXISTS cron_member_snapshots (
 user_id VARCHAR(191) PRIMARY KEY,
 snapshot_json LONGTEXT NOT NULL,
 checked_at DATETIME NOT NULL,
 INDEX checked_at_idx (checked_at)
) ENGINE=InnoDB;