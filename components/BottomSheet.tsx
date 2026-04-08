"use client";

import { useEffect, useRef } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fadeIn"
        style={{ background: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg rounded-t-2xl animate-slideUp"
        style={{
          background: "var(--surface)",
          maxHeight: "85dvh",
          overflow: "auto",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="rounded-full"
            style={{ width: 36, height: 4, background: "var(--border)" }}
          />
        </div>

        {title && (
          <div className="px-5 pt-2 pb-3">
            <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--text)" }}>
              {title}
            </h2>
          </div>
        )}

        <div className="px-5 pb-6">
          {children}
        </div>

        {/* Safe area */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
}
