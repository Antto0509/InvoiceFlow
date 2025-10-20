"use client";

import * as React from "react";
import { EntitySelect } from "@/components/entity/pickers/EntitySelect";
import { searchClients } from "@/lib/api/clients";

type Option = { id: string; name: string; email?: string | null };

export function SelectClient({
  value,
  onChange,
  placeholder = "Client…",
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
      const rows = await searchClients({ q: search, limit, signal });
      return rows as Option[];
    },
    []
  );

  return (
    <EntitySelect<Option>
      value={value}
      onChange={onChange}
      fetch={fetch}
      toLabel={(c) => (c.email ? `${c.name} — ${c.email}` : c.name)}
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
