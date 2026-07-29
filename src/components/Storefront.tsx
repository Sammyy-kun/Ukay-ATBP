"use client";

import { ThriftItem } from "@/lib/types";
import { Shirt, Search } from "lucide-react";
import { useState, useMemo } from "react";

interface StorefrontProps {
  items: ThriftItem[];
  onLoginClick: () => void;
}

const SIZES = ["XS", "S", "M", "L", "XL"] as const;
type Size = (typeof SIZES)[number];

export function Storefront({ items, onLoginClick }: StorefrontProps) {
  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<Size | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const availableItems = useMemo(
    () => items.filter((i) => i.status === "available"),
    [items]
  );

  const categories = useMemo(() => {
    const cats = Array.from(new Set(availableItems.map((i) => i.category))).filter(Boolean);
    return cats;
  }, [availableItems]);

  const filtered = useMemo(() => {
    return availableItems.filter((item) => {
      const matchesQuery =
        query.trim() === "" ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase());
      const matchesSize = sizeFilter === "all" || item.size === sizeFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesQuery && matchesSize && matchesCategory;
    });
  }, [availableItems, query, sizeFilter, categoryFilter]);

  const stats = useMemo(() => {
    const topCategory = categories.reduce(
      (acc, cat) => {
        const count = availableItems.filter((i) => i.category === cat).length;
        return count > acc.count ? { cat, count } : acc;
      },
      { cat: "—", count: 0 }
    );
    const minPrice = availableItems.length
      ? Math.min(...availableItems.map((i) => i.price))
      : 0;
    return {
      total: availableItems.length,
      categories: categories.length,
      topCategory: topCategory.cat,
      from: minPrice,
    };
  }, [availableItems, categories]);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-neutral-200 bg-white px-4 py-6">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
            <Shirt className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-neutral-900">Ukay-Ukay</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white">
            <Shirt size={16} />
            Shop
          </div>
        </nav>

        <div className="mt-auto">
          <button
            onClick={onLoginClick}
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Seller Login →
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900">
              <Shirt className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-neutral-900">Ukay-Ukay</span>
          </div>
          <span className="hidden md:block text-sm font-semibold text-neutral-900">Shop</span>

          <button
            onClick={onLoginClick}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Seller Login
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white p-3 sm:p-6">
          {/* Header row */}
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <span className="text-base sm:text-lg font-semibold text-neutral-900">Browse Items</span>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Available now" value={stats.total} />
            <StatCard label="Categories" value={stats.categories || "—"} />
            <StatCard label="Top category" value={stats.topCategory} />
            <StatCard label="Prices from" value={stats.total ? `₱${stats.from}` : "—"} />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, category..."
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
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="flex-1 sm:flex-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-700 focus:border-neutral-900"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Item grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => {
              const cover = item.photos?.[0] ?? null;
              return (
                <div
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left transition-all hover:border-neutral-400 hover:shadow-md"
                >
                  <div className="relative flex aspect-square items-center justify-center bg-neutral-50 overflow-hidden">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Shirt size={32} className="text-neutral-300" aria-hidden />
                    )}
                    <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-neutral-700 backdrop-blur-sm shadow-sm border border-neutral-200/60">
                      {item.size}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-semibold text-neutral-900">
                      {item.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-900">₱{item.price}</span>
                      <span className="text-[11px] text-neutral-400">{item.category}</span>
                    </div>
                    {(item.lengthInches || item.widthInches) && (
                      <p className="mt-1 text-[10px] text-neutral-400">
                        {item.lengthInches ? `L: ${item.lengthInches}" ` : ""}
                        {item.widthInches ? `W: ${item.widthInches}"` : ""}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-20 text-center">
                <Shirt size={40} className="mb-4 text-neutral-200" />
                <p className="text-sm text-neutral-400">
                  {availableItems.length === 0
                    ? "No items available yet. Check back soon!"
                    : "No items match your filters."}
                </p>
              </div>
            )}
          </div>
        </main>
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
