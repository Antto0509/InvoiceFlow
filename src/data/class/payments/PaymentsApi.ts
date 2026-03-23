import { ResourceApi } from "../ResourceApi";
import type { Payment } from "@/schemas/payments.schema";

/**
 * API pour les paiements
 */
export class PaymentsApi extends ResourceApi<Payment> {
    constructor() {
        super({
            table: "payments",
            select: "id, user_id, company_id, method, reference, paid_at, amount, currency_code, notes, created_at, updated_at",
            sortableColumns: ["created_at", "amount", "status"],
            searchColumns: ["transaction_id", "order_id"],
        });
    }
}