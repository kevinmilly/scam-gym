const VAULT_KEY = "scamgym_vault";
export const FREE_LIMIT = 3;

export type VaultEntryType = "bank" | "government" | "utility" | "tech" | "medical" | "other";

export type VaultEntry = {
  id: string;
  name: string;
  type: VaultEntryType;
  phone?: string;
  url?: string;
  notes?: string;
  createdAt: number;
};

export function getVaultEntries(): VaultEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVaultEntry(entry: VaultEntry): void {
  const entries = getVaultEntries();
  const idx = entries.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(VAULT_KEY, JSON.stringify(entries));
}

export function deleteVaultEntry(id: string): void {
  const entries = getVaultEntries().filter((e) => e.id !== id);
  localStorage.setItem(VAULT_KEY, JSON.stringify(entries));
}

export function canAddEntry(premium: boolean): boolean {
  if (premium) return true;
  return getVaultEntries().length < FREE_LIMIT;
}

export const ENTRY_TYPE_LABELS: Record<VaultEntryType, { label: string; icon: string }> = {
  bank: { label: "Bank", icon: "🏦" },
  government: { label: "Government", icon: "🏛️" },
  utility: { label: "Utility", icon: "⚡" },
  tech: { label: "Tech company", icon: "💻" },
  medical: { label: "Medical", icon: "🏥" },
  other: { label: "Other", icon: "📋" },
};
