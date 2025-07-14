/**
 * Normalizes quality and status strings by trimming whitespace and converting to lowercase
 * Handles null/undefined values by returning empty string, then trimmed/lowercased
 */
export function normalizeQuality(q?: string | null): string {
  return (q ?? "").trim().toLowerCase();
}