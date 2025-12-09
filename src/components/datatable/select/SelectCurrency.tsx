"use client";

import * as React from "react";
import { EntitySelect } from "@/components/datatable/EntitySelect";
import { searchCurrencies } from "@/data/currencies.repository";

type Option = { code: string; name: string; symbol: string };

export function SelectCurrency({
    value,
    onChange,
    placeholder = "Devise…",
    buttonClassName,
    disabled,
    valueLabel,
}: {
    value?: string;
    onChange?: (code?: string) => void;
    placeholder?: string;
    buttonClassName?: string;
    disabled?: boolean;
    valueLabel?: string;
}) {
    const fetch = React.useCallback(
        async ({ search, limit, signal }: { search?: string; limit?: number; signal?: AbortSignal }) => {
            const rows = await searchCurrencies({ q: search, limit, signal });
            return rows as Option[];
        },
        []
    );
    return (
        <EntitySelect<Option>
            value={value}
            onChange={onChange}
            fetch={fetch}
            toLabel={(c) => `${c.code ?? ""} — ${c.name ?? ""}${c.symbol ? ` (${c.symbol})` : ""}`}
            getId={(c) => c.code}
            placeholder={placeholder}
            valueLabel={valueLabel}
            buttonClassName={buttonClassName}
            disabled={disabled}
            searchPlaceholder="Code, nom ou symbole…"
            limit={20}
        />
    );
}