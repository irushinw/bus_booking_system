"use client";

import { useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string; // e.g., max-w-lg, max-w-2xl
};

export function Modal({ open, onClose, title, children, maxWidthClass = "max-w-2xl" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Focus trap: focus dialog on open
    dialogRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`w-full ${maxWidthClass} rounded-xl border border-white/10 bg-slate-900/90 p-4 shadow-xl outline-none`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md border border-white/10 px-2 py-1 text-sm text-slate-300 hover:bg-white/5"
          >
            Close
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
