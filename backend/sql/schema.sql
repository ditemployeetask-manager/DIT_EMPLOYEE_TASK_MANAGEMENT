CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO roles (role_name)
VALUES
('SUPER_ADMIN'),
('ADMIN'),
('EMPLOYEE');

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    employee_id VARCHAR(20) UNIQUE NOT NULL,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    phone VARCHAR(20),

    password VARCHAR(255) NOT NULL,

    role_id INT NOT NULL REFERENCES roles(id),

    designation VARCHAR(100),

    status BOOLEAN DEFAULT TRUE,

    must_change_password BOOLEAN DEFAULT TRUE,

    created_by INT REFERENCES users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_groups (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id),

    work_done TEXT NOT NULL,

    tomorrow_plan TEXT,

    admin_remarks TEXT,

    status VARCHAR(20) DEFAULT 'PENDING',

    report_date DATE DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id),

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id),

    action VARCHAR(255) NOT NULL,

    entity_type VARCHAR(50),

    entity_id INT,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);