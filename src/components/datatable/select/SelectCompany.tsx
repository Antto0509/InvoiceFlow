"use client";

import * as React from "react";
import { EntitySelect } from "@/components/datatable/EntitySelect";
import { searchCompanies } from "@/data/companies.repository";

type Option = { id: string; name: string };

export function SelectCompany({
  value,
  onChange,
  placeholder = "Entreprise…",
  buttonClassName,
  disabled,
  valueLabel,
}: {
  value?: string;
  onChange?: (id?: string) => void;
  placeholder?: string;
  buttonClassName?: string;
  disabled?: boolean;
  /** libellé initial si tu as déjà le nom du client (ex: en édition) */
  valueLabel?: string;
}) {
    const fetch = React.useCallback(
       async ({ search, limit, signal }: { search?: string; limit?: number; signal?: AbortSignal }) => {
         const rows = await searchCompanies({ q: search, limit, signal });
         return rows as Option[];
       },
       []
    );

    return (
        <EntitySelect<Option>
            value={value}
            onChange={onChange}
            fetch={fetch}
            toLabel={(c) => (c.name)}
            getId={(c) => c.id}
            placeholder={placeholder}
            valueLabel={valueLabel}
            buttonClassName={buttonClassName}
            disabled={disabled}
            searchPlaceholder="Nom ou email…"
            limit={20}
        />
    );
}
