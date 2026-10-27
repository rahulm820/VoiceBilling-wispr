CREATE TABLE settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    owner_name VARCHAR(255),
    shop_name VARCHAR(255),
    shop_phone VARCHAR(50),
    shop_address VARCHAR(500),
    gst_number VARCHAR(100),
    default_gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
    gst_on_by_default BOOLEAN NOT NULL DEFAULT TRUE,
    default_discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    discount_on_by_default BOOLEAN NOT NULL DEFAULT FALSE,
    bill_number_prefix VARCHAR(20) NOT NULL DEFAULT 'B-',
    next_bill_number BIGINT NOT NULL DEFAULT 1,
    default_low_stock_threshold INT NOT NULL DEFAULT 5,
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '₹',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_settings_user_id ON settings(user_id);
