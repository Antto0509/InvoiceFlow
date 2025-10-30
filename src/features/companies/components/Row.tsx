import * as React from "react";
import Image from "next/image";

type RowProps = {
  label: string;
  type?: "text" | "link" | "mail" | "phone" | "image";
  value?: string | null;
};

/**
 * Displays a labeled row of company information with adaptive rendering by type.
 */
export default function Row({ label, type = "text", value }: RowProps) {
  const renderValue = () => {
    if (!value) return <span className="text-muted-foreground">—</span>;

    switch (type) {
      case "link":
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            {value}
          </a>
        );

      case "mail":
        return (
          <a
            href={`mailto:${value}`}
            className="text-primary hover:underline break-all"
          >
            {value}
          </a>
        );

      case "phone":
        return (
          <a href={`tel:${value}`} className="text-primary hover:underline">
            {value}
          </a>
        );

      case "image":
        return (
          <Image
            src={value}
            alt={`${label} logo`}
            className="max-h-16 w-auto rounded-md border bg-muted object-contain"
          />
        );

      default:
        return <span className="break-words">{value}</span>;
    }
  };

  return (
    <div className="flex items-start gap-3 py-1">
      <div className="w-48 shrink-0 text-muted-foreground font-medium">
        {label}
      </div>
      <div className="flex-1">{renderValue()}</div>
    </div>
  );
}
