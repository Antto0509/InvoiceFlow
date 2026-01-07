export const VERSION = "0.1.0";

export const APP_NAME = "InvoiceFlow";
export const APP_DESC =
  "Gérez vos factures, devis et avoirs simplement : PDF, suivi des paiements, relances, et pilotage en temps réel.";
export const SITE_URL = "https://invoiceflow.fr"; // ← mettre le vrai domaine
export const OG_IMAGE = "/og/og-default.png"; // ← idéalement 1200x630

export const DEFAULT_LANGUAGE = "fr";
export const DEFAULT_CURRENCY = "EUR";
export const DEFAULT_TAX_RATE = 0.2; // 20%

export const DIR_SORT = ["asc", "desc"] as const;

export const SORTABLE_INVOICES = ["client_name", "issue_date", "number", "total", "status"] as const;
export const SORTABLE_CLIENTS = ["name", "email", "company", "phone", "address", "created_at", "updated_at"] as const;
export const SORTABLE_ITEMS = ["name", "qty", "unit_price", "total", "created_at", "updated_at"] as const;
export const SORTABLE_COMPANIES = ["name", "vat_number", "default_currency", "vat_regime", "created_at"] as const;
export const SORTABLE_DOCS = ["client_name", "issue_date", "number", "total", "status"] as const;

export const ADDRESS_KINDS = ['headquarters', 'billing', 'shipping', 'other'] as const;
export const CLIENT_ADDRESS_KINDS = ['billing', 'shipping', 'other'] as const;
export const DOC_KINDS = ['invoice', 'credit_note', 'quote', 'proforma'] as const;
export const ITEM_KINDS = ['service', 'product'] as const;
export const REMINDER_KINDS = ['before_due', 'on_due', 'after_due_1', 'after_due_2', 'custom'] as const;

export const MEMBERSHIP_ROLES = ['owner', 'admin', 'member', 'accountant'] as const;
export const PAYMENT_METHODS = ['bank_transfer', 'card', 'cash', 'check', 'paypal', 'other'] as const;

export const EMAIL_LOG_STATUSES = ['scheduled', 'sent', 'failed', 'skipped'] as const;
export const DOC_STATUSES = ['draft', 'sent', 'accepted', 'declined', 'expired', 'paid', 'overdue', 'void'] as const;
export const REMINDER_STATUSES = ['scheduled', 'sent', 'skipped', 'failed'] as const;

export const FILE_TARGETS = ['document', 'client', 'company', 'other'] as const;
export const SUPPORTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FILES_PER_TARGET = 10;

/**
 * Time window in milliseconds for rate limiting
 * actions like waitlist signups.
 */
export const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Maximum number of requests allowed within the time window
 * for actions like waitlist signups.
 */
export const MAX_REQ = 5;