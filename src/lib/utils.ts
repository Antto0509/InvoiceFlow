import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value || 0);
  } catch {
    const n = Number.isFinite(value) ? Number(value) : 0;
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function safeRandomUUID() {
  try {
    if (typeof crypto !== "undefined" && (crypto as Crypto | undefined)?.randomUUID) {
      return (crypto as Crypto).randomUUID();
    }
  } catch {
    // ignore
  }
  return "00000000-0000-0000-0000-000000000000";
}
