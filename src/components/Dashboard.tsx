"use client";

import { useMemo, useState } from "react";
import { Plus, Shirt, Search } from "lucide-react";
import { DashboardStats, ThriftItem, Size, ItemStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

interface DashboardProps {
  stats: DashboardStats;
  items: ThriftItem[];
  onNewItem?: () => void;
  onSelectItem?: (id: string) => void;
}

export function Dashboard({ stats, items, onNewItem, onSelectItem }: DashboardProps) {
  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<Size | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ItemStatus | "all">("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        query.trim() === "" ||
        item.id.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase());
      const matchesSize = sizeFilter === "all" || item.size === sizeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesQuery && matchesSize && matchesStatus;
    });
  }, [items, query, sizeFilter, statusFilter]);

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-lg font-semibold text-neutral-900">Inventory</span>
        <button
          onClick={onNewItem}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus size={15} /> New item
        </button>
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Live listings" value={stats.liveListings} />
        <StatCard label="Sold this week" value={stats.soldThisWeek} />
        <StatCard label="Reserved" value={stats.reserved} />
        <StatCard label="Revenue, 7d" value={`₱${stats.revenue7d.toLocaleString()}`} />
      </div>

      {/* filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by SKU, category"
            className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none"
          />
        </div>
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value as Size | "all")}
          className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-700"
        >
          <option value="all">All sizes</option>
          {(["XS", "S", "M", "L", "XL"] as Size[]).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ItemStatus | "all")}
          className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm text-neutral-700"
        >
          <option value="all">All status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {/* item grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem?.(item.id)}
            className="overflow-hidden rounded-xl border border-neutral-200 text-left hover:border-neutral-300"
          >
            <div className="relative flex aspect-square items-center justify-center bg-neutral-50">
              <Shirt
                size={26}
                className={`text-neutral-300 ${item.status === "sold" ? "opacity-50" : ""}`}
                aria-hidden
              />
              <div className="absolute left-1.5 top-1.5">
                <StatusBadge status={item.status} />
              </div>
            </div>
            <div className="px-3.5 py-3">
              <p className="truncate text-xs font-medium text-neutral-900">
                {item.title} · {item.size}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                ₱{item.price} · {item.id}
              </p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-neutral-400">
            No items match your filters.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-5">
      <p className="mb-1.5 text-xs text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
