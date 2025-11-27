import * as React from "react";
import Image from "next/image";
import { Copy } from "lucide-react";

type RowProps = {
  label: string;
  type?: "text" | "link" | "mail" | "phone" | "image";
  value?: string | null;
};

/**
 * Row avec :
 * - texte copiable
 * - clamp à 2 lignes (pas de dépassement)
 * - bouton Copier quand pertinent
 */
export default function Row({ label, type = "text", value }: RowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!value) return;

    let toCopy = value;
    if (type === "mail") toCopy = `mailto:${value}`;
    if (type === "phone") toCopy = `tel:${value}`;

    await navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const commonValueClass =
    "block max-w-full select-text break-words"; // pas d’overflow horizontal
  const multiLineClampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,           // ← nombre de lignes max
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const renderValue = () => {
    if (!value)
      return (
        <span
          className="text-muted-foreground block max-w-full"
          style={multiLineClampStyle}
        >
          —
        </span>
      );

    switch (type) {
      case "link":
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className={`${commonValueClass} text-primary hover:underline`}
            style={multiLineClampStyle}
          >
            {value}
          </a>
        );

      case "mail":
        return (
          <a
            href={`mailto:${value}`}
            className={`${commonValueClass} text-primary hover:underline`}
            style={multiLineClampStyle}
          >
            {value}
          </a>
        );

      case "phone":
        return (
          <a
            href={`tel:${value}`}
            className={`${commonValueClass} text-primary hover:underline`}
            style={multiLineClampStyle}
          >
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
        return (
          <span
            className={commonValueClass}
            style={multiLineClampStyle}
          >
            {value}
          </span>
        );
    }
  };

  const showCopy = value && type !== "image";

  return (
    <div className="flex items-start gap-3 py-1 group">
      <div className="w-48 shrink-0 text-muted-foreground font-medium">
        {label}
      </div>

      {/* min-w-0 + max-w-full pour que le clamp fonctionne dans un flex */}
      <div className="flex-1 flex items-start gap-2 min-w-0 max-w-full">
        <div className="flex-1 min-w-0 max-w-full">
          {renderValue()}
        </div>

        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-muted shrink-0"
            title={copied ? "Copié !" : "Copier"}
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
