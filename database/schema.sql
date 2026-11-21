-- ReaderOps schema
-- This file is the ONLY place the database is defined.
-- Change a table here, in the same pull request that changes the code.
--
-- Rebuild from scratch:  mysql -u root -p < database/schema.sql

DROP DATABASE IF EXISTS readerops;
CREATE DATABASE readerops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE readerops;

-- ---------------------------------------------------------------------------
-- People and access
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  role            ENUM('admin','distributor','reviewer') NOT NULL,
  full_name       VARCHAR(120) NOT NULL,
  phone           VARCHAR(20) NOT NULL UNIQUE,
  email           VARCHAR(160) NULL UNIQUE,
  pin_hash        VARCHAR(255) NULL,          -- distributors: 'password_hash' of the PIN
  password_hash   VARCHAR(255) NULL,          -- admins and reviewers
  status          ENUM('active','suspended') NOT NULL DEFAULT 'active',
  failed_logins   TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until    DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE distributors (
  user_id         INT PRIMARY KEY,
  community       VARCHAR(120) NOT NULL,
  operating_area  VARCHAR(120) NOT NULL,
  trained_on      DATE NULL,                  -- NULL means cannot screen
  balance_owed    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  last_active_at  DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- The clinical protocol. Versioned, and every screening points at its version.
-- A protocol CANNOT be published without a named reviewer: both columns NOT NULL.
-- ---------------------------------------------------------------------------

CREATE TABLE protocol_versions (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  version           VARCHAR(20) NOT NULL UNIQUE,
  threshold_logmar  DECIMAL(4,2) NOT NULL,    -- 0.27 = worse than N6 (WHO)
  min_age           TINYINT UNSIGNED NOT NULL,
  presentations     TINYINT UNSIGNED NOT NULL DEFAULT 5,   -- ISO 8596: at least 5
  pass_threshold    TINYINT UNSIGNED NOT NULL DEFAULT 3,   -- 3 of 5
  min_duration_ms   INT UNSIGNED NOT NULL,
  min_stroke_px     TINYINT UNSIGNED NOT NULL DEFAULT 6,
  ladder_json       JSON NOT NULL,            -- the 12 levels, N and logMAR
  power_table_json  JSON NOT NULL,            -- age band to dioptre
  red_flags_json    JSON NOT NULL,
  reviewed_by       VARCHAR(120) NOT NULL,    -- the advisor's name. Required.
  reviewed_at       DATE NOT NULL,            -- Required.
  published_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_by      INT NOT NULL,
  FOREIGN KEY (published_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Customers. No account, identified by phone number.
-- ---------------------------------------------------------------------------

CREATE TABLE customers (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  phone             VARCHAR(20) NOT NULL UNIQUE,
  full_name         VARCHAR(120) NOT NULL,
  date_of_birth     DATE NOT NULL,
  sex               ENUM('f','m','other') NULL,
  consent_given_at  DATETIME NOT NULL,
  consent_taken_by  INT NOT NULL,
  sms_opted_out     BOOLEAN NOT NULL DEFAULT FALSE,
  registered_by     INT NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consent_taken_by) REFERENCES users(id),
  FOREIGN KEY (registered_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Screenings. APPEND ONLY. The app's database user has no UPDATE or DELETE
-- grant on these two tables. A screening is evidence.
-- ---------------------------------------------------------------------------

CREATE TABLE screenings (
  id                 CHAR(36) PRIMARY KEY,            -- UUID minted on the device
  idempotency_key    CHAR(36) NOT NULL UNIQUE,        -- kills duplicate sync
  customer_id        INT NOT NULL,
  distributor_id     INT NOT NULL,
  protocol_version   VARCHAR(20) NOT NULL,
  started_at         DATETIME NOT NULL,
  completed_at       DATETIME NOT NULL,
  synced_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  age_at_screening   TINYINT UNSIGNED NOT NULL,
  red_flags_json     JSON NOT NULL,
  distance_va_fails  BOOLEAN NOT NULL,
  last_passed_level  TINYINT UNSIGNED NULL,
  outcome            ENUM('BUY','REFER','BLOCKED','NO_CORRECTION_NEEDED') NOT NULL,
  reason             VARCHAR(40) NOT NULL,
  recommended_power  DECIMAL(3,2) NULL,
  calibration_json   JSON NOT NULL,
  lux                INT NULL,
  distance_aid_used  BOOLEAN NOT NULL,
  flags_json         JSON NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (distributor_id) REFERENCES users(id),
  FOREIGN KEY (protocol_version) REFERENCES protocol_versions(version),
  INDEX idx_screening_dist_date (distributor_id, completed_at),
  INDEX idx_screening_outcome (outcome)
) ENGINE=InnoDB;

CREATE TABLE screening_trials (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  screening_id  CHAR(36) NOT NULL,
  seq           SMALLINT UNSIGNED NOT NULL,
  level         TINYINT UNSIGNED NOT NULL,
  logmar        DECIMAL(4,2) NOT NULL,
  shown         SMALLINT UNSIGNED NOT NULL,   -- orientation presented
  answer        SMALLINT UNSIGNED NOT NULL,   -- orientation tapped
  correct       BOOLEAN NOT NULL,             -- computed by the SERVER only
  ms            INT UNSIGNED NOT NULL,
  stroke_px     DECIMAL(6,2) NOT NULL,
  FOREIGN KEY (screening_id) REFERENCES screenings(id),
  UNIQUE KEY uq_trial_seq (screening_id, seq)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Stock, held per distributor by lens power
-- ---------------------------------------------------------------------------

CREATE TABLE stock_allocations (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  distributor_id   INT NOT NULL,
  allocated_by     INT NOT NULL,
  allocated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unit_cost        DECIMAL(8,2) NOT NULL,
  due_date         DATE NULL,
  status           ENUM('pending','confirmed','disputed') NOT NULL DEFAULT 'pending',
  confirmed_at     DATETIME NULL,
  FOREIGN KEY (distributor_id) REFERENCES users(id),
  FOREIGN KEY (allocated_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE stock_allocation_lines (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  allocation_id   INT NOT NULL,
  lens_power      DECIMAL(3,2) NOT NULL,
  qty_sent        SMALLINT UNSIGNED NOT NULL,
  qty_confirmed   SMALLINT UNSIGNED NULL,     -- differs from sent -> quality flag
  FOREIGN KEY (allocation_id) REFERENCES stock_allocations(id),
  UNIQUE KEY uq_alloc_power (allocation_id, lens_power)
) ENGINE=InnoDB;

CREATE TABLE distributor_stock (
  distributor_id  INT NOT NULL,
  lens_power      DECIMAL(3,2) NOT NULL,
  qty             SMALLINT NOT NULL DEFAULT 0,  -- signed: can go negative on a
  PRIMARY KEY (distributor_id, lens_power),     -- late sync, which raises a flag
  FOREIGN KEY (distributor_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Sales. A sale cannot exist without a screening scored BUY by the server.
-- ---------------------------------------------------------------------------

CREATE TABLE sales (
  id               CHAR(36) PRIMARY KEY,
  idempotency_key  CHAR(36) NOT NULL UNIQUE,
  screening_id     CHAR(36) NOT NULL UNIQUE,  -- one sale per screening
  customer_id      INT NOT NULL,
  distributor_id   INT NOT NULL,
  lens_power       DECIMAL(3,2) NOT NULL,
  price            DECIMAL(8,2) NOT NULL,
  payment_method   ENUM('cash','momo') NOT NULL,
  is_second_pair   BOOLEAN NOT NULL DEFAULT FALSE,
  sold_at          DATETIME NOT NULL,
  synced_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  server_accepted  BOOLEAN NOT NULL,
  reject_reason    VARCHAR(80) NULL,
  FOREIGN KEY (screening_id) REFERENCES screenings(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (distributor_id) REFERENCES users(id),
  INDEX idx_sale_dist_date (distributor_id, sold_at)
) ENGINE=InnoDB;

CREATE TABLE commissions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  sale_id        CHAR(36) NOT NULL UNIQUE,   -- no commission without a sale
  distributor_id INT NOT NULL,
  amount         DECIMAL(8,2) NOT NULL,
  period         CHAR(7) NOT NULL,           -- 'YYYY-MM'
  status         ENUM('pending','verified','paid') NOT NULL DEFAULT 'pending',
  paid_at        DATETIME NULL,
  payment_ref    VARCHAR(80) NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (distributor_id) REFERENCES users(id),
  INDEX idx_commission_period (distributor_id, period)
) ENGINE=InnoDB;

CREATE TABLE repayments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  distributor_id INT NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  received_by    INT NOT NULL,
  received_at    DATETIME NOT NULL,
  note           VARCHAR(160) NULL,
  FOREIGN KEY (distributor_id) REFERENCES users(id),
  FOREIGN KEY (received_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Referrals. Raised automatically, tracked until closed.
-- ---------------------------------------------------------------------------

CREATE TABLE referrals (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  screening_id   CHAR(36) NOT NULL,
  customer_id    INT NOT NULL,
  raised_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason         VARCHAR(60) NOT NULL,
  assigned_to    INT NULL,
  status         ENUM('open','completed','declined','unreachable')
                   NOT NULL DEFAULT 'open',
  closed_at      DATETIME NULL,
  closed_by      INT NULL,
  outcome_note   VARCHAR(255) NULL,
  FOREIGN KEY (screening_id) REFERENCES screenings(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (closed_by) REFERENCES users(id),
  INDEX idx_referral_status (status, raised_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Quality flags, messages, audit
-- ---------------------------------------------------------------------------

CREATE TABLE quality_flags (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  distributor_id INT NOT NULL,
  screening_id   CHAR(36) NULL,
  flag_type      VARCHAR(40) NOT NULL,
  detail         VARCHAR(255) NULL,
  raised_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by    INT NULL,
  reviewed_at    DATETIME NULL,
  FOREIGN KEY (distributor_id) REFERENCES users(id),
  FOREIGN KEY (screening_id) REFERENCES screenings(id),
  INDEX idx_flag_type (flag_type, raised_at)
) ENGINE=InnoDB;

CREATE TABLE messages (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT NOT NULL,
  template     VARCHAR(40) NOT NULL,
  body         TEXT NOT NULL,
  queued_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at      DATETIME NULL,
  status       ENUM('queued','logged','sent','failed') NOT NULL DEFAULT 'queued',
  FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB;

-- Append only. No UPDATE, no DELETE grant for the application user.
CREATE TABLE audit_log (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  action      VARCHAR(60) NOT NULL,
  entity      VARCHAR(40) NOT NULL,
  entity_id   VARCHAR(40) NOT NULL,
  old_values  JSON NULL,
  new_values  JSON NULL,
  ip          VARCHAR(45) NULL,
  at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_entity (entity, entity_id),
  INDEX idx_audit_user (user_id, at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Least privilege. The app connects as readerops_app, which CANNOT rewrite
-- history. Run these as root, then put the password in .env
-- ---------------------------------------------------------------------------
--
-- CREATE USER 'readerops_app'@'localhost' IDENTIFIED BY '<strong password>';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON readerops.* TO 'readerops_app'@'localhost';
-- REVOKE UPDATE, DELETE ON readerops.screenings       FROM 'readerops_app'@'localhost';
-- REVOKE UPDATE, DELETE ON readerops.screening_trials FROM 'readerops_app'@'localhost';
-- REVOKE UPDATE, DELETE ON readerops.audit_log        FROM 'readerops_app'@'localhost';
-- FLUSH PRIVILEGES;
