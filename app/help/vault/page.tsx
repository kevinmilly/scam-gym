"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { tap } from "@/lib/haptics";
import { isPremium } from "@/lib/premium";
import PremiumGate from "@/components/PremiumGate";
import {
  getVaultEntries,
  saveVaultEntry,
  deleteVaultEntry,
  canAddEntry,
  FREE_LIMIT,
  ENTRY_TYPE_LABELS,
  type VaultEntry,
  type VaultEntryType,
} from "@/lib/vault";

export default function VaultPage() {
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<VaultEntryType>("bank");
  const [formPhone, setFormPhone] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    setPremium(isPremium());
    setEntries(getVaultEntries());
  }, []);

  function refreshEntries() {
    setEntries(getVaultEntries());
  }

  function resetForm() {
    setFormName("");
    setFormType("bank");
    setFormPhone("");
    setFormUrl("");
    setFormNotes("");
    setEditingId(null);
  }

  function handleAdd() {
    tap();
    if (!canAddEntry(premium)) return;
    setShowAdd(true);
    resetForm();
  }

  function handleEdit(entry: VaultEntry) {
    tap();
    setEditingId(entry.id);
    setFormName(entry.name);
    setFormType(entry.type);
    setFormPhone(entry.phone || "");
    setFormUrl(entry.url || "");
    setFormNotes(entry.notes || "");
    setShowAdd(true);
  }

  function handleSave() {
    tap();
    if (!formName.trim()) return;
    const entry: VaultEntry = {
      id: editingId || crypto.randomUUID(),
      name: formName.trim(),
      type: formType,
      phone: formPhone.trim() || undefined,
      url: formUrl.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: editingId
        ? entries.find((e) => e.id === editingId)?.createdAt || Date.now()
        : Date.now(),
    };
    saveVaultEntry(entry);
    refreshEntries();
    setShowAdd(false);
    resetForm();
  }

  function handleDelete(id: string) {
    tap();
    deleteVaultEntry(id);
    refreshEntries();
    setConfirmDeleteId(null);
  }

  function handleCopy(text: string, fieldId: string) {
    tap();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  const filtered = entries.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const canAdd = canAddEntry(premium);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          onClick={() => router.back()}
          className="min-h-[44px] px-3 flex items-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back
        </button>
        <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>
          Verification Vault
        </span>
        <div className="w-12" />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Warning banner */}
        <div
          className="rounded-xl px-3 py-3 border flex items-start gap-2"
          style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" }}
        >
          <span className="text-sm mt-0.5">⚠️</span>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text)" }}>
            Only save numbers and URLs you&apos;ve verified yourself — never from a suspicious message.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        />

        {/* Usage counter for free users */}
        {!premium && (
          <p className="text-xs" style={{ color: entries.length >= FREE_LIMIT ? "#ef4444" : "var(--text-muted)" }}>
            {entries.length} of {FREE_LIMIT} free contacts used
          </p>
        )}

        {/* Entry list */}
        {filtered.length === 0 && !showAdd && (
          <div className="text-center py-8">
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
              {entries.length === 0 ? "No contacts saved yet" : "No matches found"}
            </p>
            {entries.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Save verified phone numbers and websites for quick access.
              </p>
            )}
          </div>
        )}

        {filtered.map((entry) => {
          const typeInfo = ENTRY_TYPE_LABELS[entry.type];
          return (
            <div
              key={entry.id}
              className="rounded-2xl border px-4 py-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{typeInfo.icon}</span>
                <span className="font-semibold text-sm flex-1" style={{ color: "var(--text)" }}>
                  {entry.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                >
                  {typeInfo.label}
                </span>
              </div>

              {entry.phone && (
                <button
                  onClick={() => handleCopy(entry.phone!, `phone-${entry.id}`)}
                  className="flex items-center gap-2 w-full text-left mb-1.5 min-h-[44px] px-2 py-1 rounded-lg transition-all active:scale-[0.98]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="text-xs">📞</span>
                  <span className="text-sm" style={{ color: "var(--text)" }}>{entry.phone}</span>
                  <span className="text-xs ml-auto">
                    {copiedField === `phone-${entry.id}` ? "Copied!" : "Tap to copy"}
                  </span>
                </button>
              )}

              {entry.url && (
                <button
                  onClick={() => handleCopy(entry.url!, `url-${entry.id}`)}
                  className="flex items-center gap-2 w-full text-left mb-1.5 min-h-[44px] px-2 py-1 rounded-lg transition-all active:scale-[0.98]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="text-xs">🔗</span>
                  <span className="text-sm truncate" style={{ color: "var(--accent)" }}>{entry.url}</span>
                  <span className="text-xs ml-auto shrink-0">
                    {copiedField === `url-${entry.id}` ? "Copied!" : "Tap to copy"}
                  </span>
                </button>
              )}

              {entry.notes && (
                <p className="text-xs mt-1 px-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {entry.notes}
                </p>
              )}

              {/* Edit / Delete buttons */}
              <div className="flex gap-3 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => handleEdit(entry)}
                  className="text-xs min-h-[44px] px-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  Edit
                </button>
                {confirmDeleteId === entry.id ? (
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs font-semibold min-h-[44px] px-2"
                      style={{ color: "#ef4444" }}
                    >
                      Confirm delete
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs min-h-[44px] px-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { tap(); setConfirmDeleteId(entry.id); }}
                    className="text-xs min-h-[44px] px-2"
                    style={{ color: "#ef4444" }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add form (inline expandable) */}
        {showAdd && (
          <div
            className="rounded-2xl border px-4 py-4 space-y-3"
            style={{ background: "var(--surface)", borderColor: "var(--accent)" }}
          >
            <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
              {editingId ? "Edit Contact" : "Add Contact"}
            </p>

            <input
              type="text"
              placeholder="Name (e.g. Chase Bank)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
            />

            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ENTRY_TYPE_LABELS) as VaultEntryType[]).map((t) => {
                const active = formType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className="px-2.5 py-1.5 rounded-full text-xs border transition-all"
                    style={{
                      borderColor: active ? "var(--accent)" : "var(--border)",
                      background: active ? "rgba(124,106,247,0.15)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {ENTRY_TYPE_LABELS[t].icon} {ENTRY_TYPE_LABELS[t].label}
                  </button>
                );
              })}
            </div>

            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
            />

            <input
              type="url"
              placeholder="Website URL (optional)"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
            />

            <input
              type="text"
              placeholder="Notes (optional)"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!formName.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                style={{
                  background: formName.trim() ? "var(--accent)" : "var(--surface-2)",
                  color: formName.trim() ? "#fff" : "var(--text-muted)",
                }}
              >
                {editingId ? "Save Changes" : "Add Contact"}
              </button>
              <button
                onClick={() => { setShowAdd(false); resetForm(); }}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add button or premium gate */}
        {!showAdd && (
          canAdd ? (
            <button
              onClick={handleAdd}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm border transition-all active:scale-95"
              style={{ borderColor: "var(--accent)", background: "rgba(124,106,247,0.1)", color: "var(--accent)" }}
            >
              + Add Contact
            </button>
          ) : (
            <PremiumGate
              label="Unlimited Contacts"
              pitch="Save as many verified contacts as you need."
              usedOf={{ used: entries.length, total: FREE_LIMIT }}

            >
              <div />
            </PremiumGate>
          )
        )}
      </div>
    </div>
  );
}
