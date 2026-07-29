"use client";

import { ThriftItem } from "@/lib/types";
import { Shirt, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { CoatLogo } from "./CoatLogo";

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
    return Array.from(new Set(availableItems.map((i) => i.category))).filter(Boolean);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-8">
        <CoatLogo className="text-3xl" />
        <button
          onClick={onLoginClick}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Seller Login
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
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
  );
}
