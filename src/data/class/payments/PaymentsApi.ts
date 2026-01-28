import { ResourceApi } from "../ResourceApi";
import type { Payment } from "@/schemas/payments.schema";

/**
 * API pour les paiements
 */
export class PaymentsApi extends ResourceApi<Payment> {
    constructor() {
        super({
            table: "payments",
            select: "*",
            sortableColumns: ["created_at", "amount", "status"],
            searchColumns: ["transaction_id", "order_id"],
        });
    }
}