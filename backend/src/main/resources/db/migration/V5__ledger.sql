CREATE TABLE ledger_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(10) NOT NULL,
    party_name VARCHAR(255),
    party_phone VARCHAR(50),
    entry_number VARCHAR(50),
    entry_date TIMESTAMP NOT NULL,
    subtotal NUMERIC(18,2) NOT NULL,
    gst_applied BOOLEAN NOT NULL DEFAULT FALSE,
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    gst_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(18,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ledger_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ledger_items (
    id VARCHAR(36) PRIMARY KEY,
    ledger_entry_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity NUMERIC(18,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price NUMERIC(18,2) NOT NULL,
    line_total NUMERIC(18,2) NOT NULL,
    cost_price_snapshot NUMERIC(18,2),
    CONSTRAINT fk_ledger_items_entry FOREIGN KEY (ledger_entry_id) REFERENCES ledger_entries(id) ON DELETE CASCADE
);

CREATE INDEX idx_ledger_entries_user_date ON ledger_entries(user_id, entry_date DESC);
CREATE INDEX idx_ledger_entries_user_type ON ledger_entries(user_id, type);

CREATE INDEX IF NOT EXISTS idx_ledger_items_entry ON ledger_items(ledger_entry_id);
