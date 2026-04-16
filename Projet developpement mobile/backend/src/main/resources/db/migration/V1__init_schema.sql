CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    weight_kg DOUBLE,
    height_cm DOUBLE,
    age INT,
    avatar_url LONGTEXT,
    role VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activities (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    duration_minutes DOUBLE NOT NULL,
    distance_km DOUBLE,
    date DATE NOT NULL,
    notes VARCHAR(255),
    calories DOUBLE NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_activities_user_id (user_id),
    CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goals (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    activity_type VARCHAR(255),
    period VARCHAR(255) NOT NULL,
    target_value DOUBLE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_goals_user_id (user_id),
    CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS otp_codes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    code_hash VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    used BOOLEAN NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_otp_codes_user_id (user_id),
    CONSTRAINT fk_otp_codes_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;