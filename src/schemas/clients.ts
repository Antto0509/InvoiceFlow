import { z } from "zod";

export const clientSchema = z.object({
    id: z.uuid().optional(),
    name: z.string().min(2, "Nom trop court"),
    email: z.email("Email invalide"),
    company: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export type Client = {
    id: string;
    name: string;
    email: string;
    company?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
};