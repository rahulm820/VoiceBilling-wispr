CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    stock_quantity NUMERIC(18,3) NOT NULL DEFAULT 0,
    cost_price NUMERIC(18,2) NOT NULL DEFAULT 0,
    default_selling_price NUMERIC(18,2) NOT NULL DEFAULT 0,
    gst_override NUMERIC(5,2),
    low_stock_threshold INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_products_user_name_unit UNIQUE (user_id, lower(name), lower(unit))
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_user_name ON products(user_id, lower(name));
