"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 transition-opacity"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-start gap-3">
            {danger && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
              <p className="mt-1.5 text-sm text-neutral-500">{description}</p>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              size="sm"
              className={
                danger
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              }
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
