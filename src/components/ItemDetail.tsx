"use client";

import { useState } from "react";
import { ChevronLeft, Trash2, Shirt, Ruler, Loader2, X, Maximize2 } from "lucide-react";
import { ThriftItem, Category, Size, Condition } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

const CATEGORIES: Category[] = ["Dress", "Top", "Pants", "Jacket"];
const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];
const CONDITIONS: Condition[] = ["Like new", "Good", "Fair"];

interface ItemDetailProps {
  item: ThriftItem;
  onBack?: () => void;
  onSave?: (updated: ThriftItem) => Promise<void> | void;
  onMarkReserved?: (id: string) => void;
  onMarkSold?: (id: string) => void;
  onRelist?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ItemDetail({
  item,
  onBack,
  onSave,
  onMarkReserved,
  onMarkSold,
  onRelist,
  onDelete,
}: ItemDetailProps) {
  const [draft, setDraft] = useState<ThriftItem>(item);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSold = item.status === "sold";

  function update<K extends keyof ThriftItem>(key: K, value: ThriftItem[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const photos = draft.photos.length > 0 ? draft.photos : [];

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          aria-label="Back"
          className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-semibold text-neutral-900">{item.id}</span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete ${item.title} (${item.id})?`)) {
              onDelete?.(item.id);
            }
          }}
          aria-label="Delete item"
          className="rounded-full p-2 text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Main photo preview */}
      <div className="relative mb-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
        {photos[selectedPhotoIdx] ? (
          <button 
            type="button" 
            onClick={() => setIsFullscreen(true)}
            className="group relative h-full w-full outline-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[selectedPhotoIdx]}
              alt="Item main photo"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
              <Maximize2 className="text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-md" size={32} />
            </div>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <Shirt size={40} />
            <span className="text-xs">No photos uploaded</span>
          </div>
        )}
      </div>

      {/* photo grid thumbnails */}
      <div className={`mb-4 grid grid-cols-4 gap-2 ${isSold ? "opacity-50" : ""}`}>
        {Array.from({ length: 4 }).map((_, i) => {
          const photo = photos[i];
          const isSelected = i === selectedPhotoIdx;
          return (
            <button
              key={i}
              onClick={() => setSelectedPhotoIdx(i)}
              className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-neutral-900 ring-2 ring-neutral-900/20"
                  : photo
                  ? "border-neutral-200 hover:border-neutral-400"
                  : "border-dashed border-neutral-200 bg-neutral-50"
              }`}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                <Shirt size={16} className="text-neutral-300" aria-hidden />
              )}
            </button>
          );
        })}
      </div>

      {/* status row */}
      <div className="mb-5 flex items-center justify-between rounded-xl bg-neutral-50 p-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          <span className="text-xs text-neutral-500">
            {isSold
              ? `Sold ${item.soldAt ? new Date(item.soldAt).toLocaleDateString() : ""}`
              : `Listed ${new Date(item.listedAt).toLocaleDateString()}`}
          </span>
        </div>
      </div>

      {isSold ? (
        // read-only sale summary
        <div className="mb-5 rounded-xl bg-neutral-50 p-4 text-xs space-y-2">
          <Row label="Title" value={`${item.title} · ${item.size}`} />
          <Row label="Sold price" value={`₱${item.soldPrice ?? item.price}`} />
          {item.lengthInches && <Row label="Length" value={`${item.lengthInches} in`} />}
          {item.widthInches && <Row label="Width" value={`${item.widthInches} in`} />}
          <Row label="Payment" value={item.paymentMethod ?? "—"} last />
        </div>
      ) : (
        <div className="mb-5 space-y-4">
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={draft.category}
                onChange={(e) => update("category", e.target.value as Category)}
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Size">
              <select
                value={draft.size}
                onChange={(e) => update("size", e.target.value as Size)}
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900"
              >
                {SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Measurements: Length & Width in inches */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
              <Ruler size={14} className="text-neutral-500" />
              <span>Measurements (Inches)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Length (in)">
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 26"
                  value={draft.lengthInches ?? ""}
                  onChange={(e) =>
                    update("lengthInches", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </Field>

              <Field label="Width / Bust (in)">
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 20"
                  value={draft.widthInches ?? ""}
                  onChange={(e) =>
                    update("widthInches", e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Condition">
              <select
                value={draft.condition}
                onChange={(e) => update("condition", e.target.value as Condition)}
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900"
              >
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Price (₱)">
              <input
                value={draft.price}
                onChange={(e) => update("price", Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                className="w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              />
            </Field>
          </div>
        </div>
      )}

      <Field label="Notes / flaws" className="mb-5">
        <textarea
          rows={2}
          disabled={isSold}
          placeholder="Add details about condition, flaws, fabric..."
          value={draft.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full resize-none rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-400"
        />
      </Field>

      {isSold ? (
        <button
          onClick={() => onRelist?.(item.id)}
          className="w-full rounded-xl border border-neutral-300 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
        >
          Relist item
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onMarkReserved?.(item.id)}
              className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Mark reserved
            </button>
            <button
              onClick={() => onMarkSold?.(item.id)}
              className="flex-1 rounded-xl border border-neutral-300 py-2.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              Mark sold
            </button>
          </div>
          <button
            onClick={async () => {
              if (isSaving || !onSave) return;
              setIsSaving(true);
              try {
                await onSave(draft);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      )}

      {/* Fullscreen Image Overlay */}
      {isFullscreen && photos[selectedPhotoIdx] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button 
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[selectedPhotoIdx]}
            alt="Fullscreen preview"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between ${last ? "" : "mb-1.5"}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium text-neutral-900">{value}</span>
    </div>
  );
}
