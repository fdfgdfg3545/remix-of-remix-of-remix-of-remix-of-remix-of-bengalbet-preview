CREATE TABLE IF NOT EXISTS withdrawal_activation (
 user_id VARCHAR(191) NOT NULL PRIMARY KEY,
 anchor_at DATETIME NOT NULL,
 restricted_at DATETIME NULL,
 observed_at DATETIME NULL,
 target_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
 deposited_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
 reopened_at DATETIME NULL,
 INDEX (restricted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;