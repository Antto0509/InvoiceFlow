export const DEFAULT_CURRENCY = "EUR";
export const DEFAULT_TAX_RATE = 0.2; // 20%
export const SORTABLE_INVOICES = ["issue_date", "number", "total", "status"] as const;
export const SORTABLE_CLIENTS = ["name", "email", "company", "phone", "address", "created_at", "updated_at"] as const;
export const SORTABLE_ITEMS = ["name", "qty", "unit_price", "total", "created_at", "updated_at"] as const;