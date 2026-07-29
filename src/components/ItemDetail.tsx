"use client";

import { useState } from "react";
import { ChevronLeft, Trash2, Shirt, Tag, ZoomIn } from "lucide-react";
import { ThriftItem, Category, Size, Condition } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

const CATEGORIES: Category[] = ["Dress", "Top", "Pants", "Jacket"];
const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];
const CONDITIONS: Condition[] = ["Like new", "Good", "Fair"];

interface ItemDetailProps {
  item: ThriftItem;
  onBack?: () => void;
  onSave?: (updated: ThriftItem) => void;
  onMarkReserved?: (id: string) => void;
  onMarkSold?: (id: string) => void;
  onRelist?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const PHOTO_ICONS = [Shirt, Shirt, Tag, ZoomIn];

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
  const isSold = item.status === "sold";

  function update<K extends keyof ThriftItem>(key: K, value: ThriftItem[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <button onClick={onBack} aria-label="Back" className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-neutral-900">{item.id}</span>
        <button
          onClick={() => onDelete?.(item.id)}
          aria-label="Delete item"
          className="rounded-full p-1 text-red-500 hover:bg-red-50"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* photo grid */}
      <div className={`mb-3 grid grid-cols-4 gap-1.5 ${isSold ? "opacity-50" : ""}`}>
        {PHOTO_ICONS.map((Icon, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-lg border bg-neutral-50 ${
              i === 0 ? "border-neutral-900" : "border-neutral-200"
            }`}
          >
            <Icon size={18} className="text-neutral-400" aria-hidden />
          </div>
        ))}
      </div>

      {/* status row */}
      <div className="mb-4 flex gap-2">
        <StatusBadge status={item.status} />
        <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">
          {isSold ? `Sold ${item.soldAt ?? ""}` : `Listed ${item.listedAt}`}
        </span>
      </div>

      {isSold ? (
        // read-only sale summary
        <div className="mb-4 rounded-lg bg-neutral-50 p-3 text-xs">
          <Row label="Title" value={`${item.title} · ${item.size}`} />
          <Row label="Sold price" value={`₱${item.soldPrice ?? item.price}`} />
          <Row label="Time to sell" value="5 days" />
          <Row label="Payment" value={item.paymentMethod ?? "—"} last />
        </div>
      ) : (
        <div className="mb-4 space-y-3">
          <Field label="Title">
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
            />
          </Field>
          <div className="flex gap-3">
            <Field label="Category" className="flex-1">
              <select
                value={draft.category}
                onChange={(e) => update("category", e.target.value as Category)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Size" className="flex-1">
              <select
                value={draft.size}
                onChange={(e) => update("size", e.target.value as Size)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900"
              >
                {SIZES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex gap-3">
            <Field label="Condition" className="flex-1">
              <select
                value={draft.condition}
                onChange={(e) => update("condition", e.target.value as Condition)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900"
              >
                {CONDITIONS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Price" className="flex-1">
              <input
                value={`₱${draft.price}`}
                onChange={(e) => update("price", Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
              />
            </Field>
          </div>
        </div>
      )}

      <Field label="Notes / flaws" className="mb-4">
        <textarea
          rows={2}
          disabled={isSold}
          value={draft.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-400"
        />
      </Field>

      {isSold ? (
        <button
          onClick={() => onRelist?.(item.id)}
          className="w-full rounded-lg border border-neutral-300 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50"
        >
          Relist item
        </button>
      ) : (
        <>
          <div className="mb-2.5 flex gap-2">
            <button
              onClick={() => onMarkReserved?.(item.id)}
              className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Mark reserved
            </button>
            <button
              onClick={() => onMarkSold?.(item.id)}
              className="flex-1 rounded-lg border border-neutral-300 py-2.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
            >
              Mark sold
            </button>
          </div>
          <button
            onClick={() => onSave?.(draft)}
            className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save changes
          </button>
        </>
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
      <label className="mb-1.5 block text-xs text-neutral-500">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between ${last ? "" : "mb-1.5"}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900">{value}</span>
    </div>
  );
}
