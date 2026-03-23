import { ResourceApi } from "../ResourceApi";
import type { PaymentAllocation } from "@/schemas/payments.schema";

/**
 * API pour les affectations de paiements
 */
export class PaymentAllocationsApi extends ResourceApi<PaymentAllocation> {
    constructor() {
        super({
            table: "payment_allocations",
            select: "payment_id, document_id, amount",
            sortableColumns: ["payment_id", "document_id", "amount"],
            searchColumns: ["payment_id", "document_id"],
        });
    }
}