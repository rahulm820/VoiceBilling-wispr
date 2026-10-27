CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_date_type ON ledger_entries(user_id, entry_date, type);
CREATE INDEX IF NOT EXISTS idx_products_user_low ON products(user_id, stock_quantity);
