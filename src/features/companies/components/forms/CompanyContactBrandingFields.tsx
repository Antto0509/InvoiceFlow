"use client";

import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import type { CompanyFormValues } from "@/schemas/companies.schema";

export function CompanyContactBrandingFields({
    form,
}: {
    form: UseFormReturn<CompanyFormValues>;
}) {
    return (
        <>
            {/* Contact & branding */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                    <Input placeholder="https://exemple.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input type="email" placeholder="contact@exemple.com" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                    <Input placeholder="+33 6 12 34 56 78" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Logo (URL)</FormLabel>
                    <FormControl>
                    <Input placeholder="https://cdn.exemple.com/logo.png" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>On pourra switcher vers Supabase Storage plus tard.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            </div>
        </>
    );
}