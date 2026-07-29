"use client";

import { useMemo, useState } from "react";
import { Plus, Shirt, Search, Download } from "lucide-react";
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
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.title.toLowerCase().includes(query.toLowerCase());
      const matchesSize = sizeFilter === "all" || item.size === sizeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesQuery && matchesSize && matchesStatus;
    });
  }, [items, query, sizeFilter, statusFilter]);

  function exportCSV() {
    if (items.length === 0) return;
    
    const headers = ["id", "title", "category", "size", "condition", "status", "price", "lengthInches", "widthInches", "listedAt", "soldAt", "soldPrice"];
    
    const csvContent = [
      headers.join(","),
      ...items.map(item => headers.map(header => {
        const val = item[header as keyof ThriftItem];
        const strVal = val === undefined || val === null ? "" : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ukay_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="w-full">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <span className="text-base sm:text-lg font-semibold text-neutral-900">Inventory</span>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Download size={16} /> Export
          </button>
          <button
            onClick={onNewItem}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
          >
            <Plus size={16} /> New item
          </button>
        </div>
      </div>

      {/* stats */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Live listings" value={stats.liveListings} />
        <StatCard label="Sold this week" value={stats.soldThisWeek} />
        <StatCard label="Reserved" value={stats.reserved} />
        <StatCard label="Revenue, 7d" value={`₱${stats.revenue7d.toLocaleString()}`} />
      </div>

      {/* filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by SKU, title, category..."
            className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value as Size | "all")}
            className="flex-1 sm:flex-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-700 focus:border-neutral-900"
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
            className="flex-1 sm:flex-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-700 focus:border-neutral-900"
          >
            <option value="all">All status</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      {/* item grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => {
          const coverPhoto = item.photos && item.photos.length > 0 ? item.photos[0] : null;
          return (
            <button
              key={item.id}
              onClick={() => onSelectItem?.(item.id)}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left transition-all hover:border-neutral-400 hover:shadow-md"
            >
              <div className="relative flex aspect-square items-center justify-center bg-neutral-50 overflow-hidden">
                {coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverPhoto}
                    alt={item.title}
                    className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      item.status === "sold" ? "opacity-60 grayscale" : ""
                    }`}
                  />
                ) : (
                  <Shirt
                    size={32}
                    className={`text-neutral-300 ${item.status === "sold" ? "opacity-50" : ""}`}
                    aria-hidden
                  />
                )}
                <div className="absolute left-2 top-2">
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-neutral-900">
                  {item.title} · {item.size}
                </p>
                <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-900">₱{item.price}</span>
                  <span className="text-[11px] text-neutral-400">{item.id}</span>
                </div>
                {(item.lengthInches || item.widthInches) && (
                  <p className="mt-1 text-[10px] text-neutral-400">
                    {item.lengthInches ? `L: ${item.lengthInches}" ` : ""}
                    {item.widthInches ? `W: ${item.widthInches}"` : ""}
                  </p>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-neutral-400">
            No items match your filters.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-3.5 sm:p-5">
      <p className="mb-1 text-xs text-neutral-500">{label}</p>
      <p className="text-lg sm:text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}
