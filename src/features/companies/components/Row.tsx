import * as React from "react";
import Image from "next/image";
import { Copy, Check } from "lucide-react";

type RowProps = {
  label: string;
  type?: "text" | "link" | "mail" | "phone" | "image";
  value?: string | null;
  /** Active le bouton de copie pour cette ligne */
  copyable?: boolean;
};

export default function Row({
  label,
  type = "text",
  value,
  copyable = false,
}: RowProps) {
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

  const clampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const baseValueClass = "block max-w-full select-text break-words";

  const renderValue = () => {
    if (!value)
      return (
        <span
          className="text-muted-foreground block max-w-full"
          style={clampStyle}
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
            className={`${baseValueClass} text-primary hover:underline`}
            style={clampStyle}
          >
            {value}
          </a>
        );

      case "mail":
        return (
          <a
            href={`mailto:${value}`}
            className={`${baseValueClass} text-primary hover:underline`}
            style={clampStyle}
          >
            {value}
          </a>
        );

      case "phone":
        return (
          <a
            href={`tel:${value}`}
            className={`${baseValueClass} text-primary hover:underline`}
            style={clampStyle}
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
            width={64}
            height={64}
          />
        );

      default:
        return (
          <span className={baseValueClass} style={clampStyle}>
            {value}
          </span>
        );
    }
  };

  const showCopy = copyable && value && type !== "image";

  return (
    <div className="flex items-start gap-3 py-1 group">
      <div className="w-48 shrink-0 text-muted-foreground font-medium">
        {label}
      </div>

      <div className="flex-1 flex items-start gap-2 min-w-0 max-w-full">
        <div className="flex-1 min-w-0 max-w-full">
          {renderValue()}
        </div>

        {showCopy && (
          <button
            type="button"
            onClick={handleCopy}
            className="relative p-1 rounded hover:bg-muted transition opacity-0 group-hover:opacity-100 shrink-0"
            title={copied ? "Copié !" : "Copier"}
          >
            <div
              className={`
                transition-all duration-300
                ${copied
                  ? "scale-110 rotate-12 text-green-600"
                  : "scale-100 rotate-0 text-muted-foreground"}
              `}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
