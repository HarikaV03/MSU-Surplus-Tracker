CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    department_id INT REFERENCES departments(department_id)
);

CREATE TABLE assets (
    asset_id SERIAL PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    condition VARCHAR(30),
    current_status VARCHAR(30) NOT NULL,
    location VARCHAR(100),
    department_id INT REFERENCES departments(department_id),
    submitted_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disposal_records (
    record_id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(asset_id) ON DELETE CASCADE,
    recommended_action VARCHAR(30),
    final_action VARCHAR(30),
    approved_by INT REFERENCES users(user_id),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scan_events (
    scan_id SERIAL PRIMARY KEY,
    asset_id INT REFERENCES assets(asset_id) ON DELETE CASCADE,
    scanned_by INT REFERENCES users(user_id),
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scan_location VARCHAR(100)
);