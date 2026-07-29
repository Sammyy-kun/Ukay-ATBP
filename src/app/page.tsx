"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { CameraCapture } from "@/components/CameraCapture";
import { ItemDetail } from "@/components/ItemDetail";
import { ThriftItem, DashboardStats } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import {
  LayoutGrid,
  Camera,
  ShoppingBag,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  Shirt,
} from "lucide-react";

// ---------------------------------------------------------------------------
// DB row ↔ ThriftItem mapping (snake_case → camelCase)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): ThriftItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    size: row.size,
    condition: row.condition,
    price: row.price,
    status: row.status,
    notes: row.notes ?? "",
    photos: row.photos ?? [],
    listedAt: row.listed_at,
    soldAt: row.sold_at ?? undefined,
    soldPrice: row.sold_price ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
  };
}

function toRow(item: ThriftItem): Record<string, unknown> {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    size: item.size,
    condition: item.condition,
    price: item.price,
    status: item.status,
    notes: item.notes,
    photos: item.photos,
    listed_at: item.listedAt,
    sold_at: item.soldAt ?? null,
    sold_price: item.soldPrice ?? null,
    payment_method: item.paymentMethod ?? null,
  };
}

// ---------------------------------------------------------------------------
// Stats derived from items
// ---------------------------------------------------------------------------
function deriveStats(items: ThriftItem[]): DashboardStats {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const soldItems = items.filter((i) => i.status === "sold");
  const recentSold = soldItems.filter(
    (i) => i.soldAt && new Date(i.soldAt).getTime() > oneWeekAgo
  );
  return {
    liveListings: items.filter((i) => i.status === "available").length,
    reserved: items.filter((i) => i.status === "reserved").length,
    soldThisWeek: recentSold.length,
    revenue7d: recentSold.reduce((sum, i) => sum + (i.soldPrice ?? i.price), 0),
  };
}

// ---------------------------------------------------------------------------
// Navigation config
// ---------------------------------------------------------------------------
type View = { name: "dashboard" } | { name: "capture" } | { name: "detail"; id: string };

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Inventory", view: "dashboard" as const },
  { icon: Camera, label: "New Listing", view: "capture" as const },
  { icon: ShoppingBag, label: "Orders", view: "dashboard" as const },
  { icon: BarChart2, label: "Reports", view: "dashboard" as const },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Page() {
  const [items, setItems] = useState<ThriftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>({ name: "dashboard" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Inventory");

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("items")
      .select("*")
      .order("listed_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data.map(fromRow));
        setLoading(false);
      });
  }, []);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("items-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "items" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems((prev) => [fromRow(payload.new), ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setItems((prev) =>
              prev.map((it) => (it.id === payload.new.id ? fromRow(payload.new) : it))
            );
          } else if (payload.eventType === "DELETE") {
            setItems((prev) => prev.filter((it) => it.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Write helpers ──────────────────────────────────────────────────────────
  async function updateItem(id: string, patch: Partial<ThriftItem>) {
    const current = items.find((it) => it.id === id);
    if (!current) return;
    const merged = { ...current, ...patch };
    await supabase.from("items").update(toRow(merged)).eq("id", id);
    // real-time subscription will update state
  }

  async function deleteItemById(id: string) {
    await supabase.from("items").delete().eq("id", id);
    setView({ name: "dashboard" });
  }

  // ── Nav ────────────────────────────────────────────────────────────────────
  function handleNavClick(label: string, v: "dashboard" | "capture") {
    setActiveNav(label);
    setView({ name: v });
    setSidebarOpen(false);
  }

  const stats = deriveStats(items);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-neutral-200 px-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
            <Shirt size={15} className="text-white" />
          </div>
          <span className="font-semibold text-neutral-900">Ukay-Ukay</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map(({ icon: Icon, label, view: v }) => {
            const isActive = activeNav === label;
            return (
              <button
                key={label}
                onClick={() => handleNavClick(label, v)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="space-y-1 border-t border-neutral-200 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
            <Settings size={16} />
            Settings
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Navbar */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-medium text-neutral-900">{activeNav}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500">
              Store · Manila 01
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
              S
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm text-neutral-400">
              Loading inventory…
            </div>
          ) : (
            <>
              {view.name === "dashboard" && (
                <Dashboard
                  stats={stats}
                  items={items}
                  onNewItem={() => { setView({ name: "capture" }); setActiveNav("New Listing"); }}
                  onSelectItem={(id) => setView({ name: "detail", id })}
                />
              )}

              {view.name === "capture" && (
                <CameraCapture
                  onBack={() => { setView({ name: "dashboard" }); setActiveNav("Inventory"); }}
                  onComplete={async (photos) => {
                    const now = new Date().toISOString();
                    const newItem: ThriftItem = {
                      id: `UK-${Math.floor(1000 + Math.random() * 9000)}`,
                      title: "New item",
                      category: "Top",
                      size: "M",
                      condition: "Good",
                      price: 200,
                      status: "available",
                      notes: "",
                      photos,
                      listedAt: now,
                    };
                    await supabase.from("items").insert(toRow(newItem));
                    setView({ name: "detail", id: newItem.id });
                    setActiveNav("Inventory");
                  }}
                />
              )}

              {view.name === "detail" &&
                (() => {
                  const item = items.find((it) => it.id === view.id);
                  if (!item) return null;
                  return (
                    <ItemDetail
                      item={item}
                      onBack={() => setView({ name: "dashboard" })}
                      onSave={async (updated) => {
                        await supabase.from("items").update(toRow(updated)).eq("id", updated.id);
                        setView({ name: "dashboard" });
                      }}
                      onMarkReserved={(id) => updateItem(id, { status: "reserved" })}
                      onMarkSold={(id) =>
                        updateItem(id, {
                          status: "sold",
                          soldAt: new Date().toISOString(),
                          soldPrice: item.price,
                        })
                      }
                      onRelist={(id) => updateItem(id, { status: "available", soldAt: undefined, soldPrice: undefined })}
                      onDelete={deleteItemById}
                    />
                  );
                })()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
