"use client";

import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Dashboard } from "@/components/Dashboard";
import { DashboardOverview } from "@/components/DashboardOverview";
import { CameraCapture } from "@/components/CameraCapture";
import { ItemDetail } from "@/components/ItemDetail";
import { AuthScreen } from "@/components/AuthScreen";
import { Storefront } from "@/components/Storefront";
import { DashboardSkeleton } from "@/components/SkeletonLoader";
import { CoatLogo } from "@/components/CoatLogo";
import { ThriftItem, DashboardStats, SellerProfile, OrderWithDetails, Buyer } from "@/lib/types";
import { fetchOrdersWithDetails, createOrder } from "@/lib/orders";
import { supabase } from "@/lib/supabase";
import { SettingsPage } from "@/components/SettingsPage";
import { toast } from "sonner";
import { OrdersView } from "@/components/OrdersView";
import { AssignBuyerModal } from "@/components/AssignBuyerModal";
import { BuyerList } from "@/components/BuyerList";
import { BuyerDetail } from "@/components/BuyerDetail";
import { ExpensesView } from "@/components/ExpensesView";
import {
  LayoutDashboard,
  LayoutGrid,
  Camera,
  ShoppingBag,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  Shirt,
  Loader2,
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
    lengthInches: row.length_inches ?? undefined,
    widthInches: row.width_inches ?? undefined,
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
    length_inches: item.lengthInches ?? null,
    width_inches: item.widthInches ?? null,
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
type View =
  | { name: "overview" }
  | { name: "dashboard" }
  | { name: "capture" }
  | { name: "detail"; id: string }
  | { name: "settings" }
  | { name: "orders" }
  | { name: "buyers" }
  | { name: "buyer-detail"; buyer: Buyer }
  | { name: "expenses" };

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", view: "overview" as const },
  { icon: LayoutGrid, label: "Inventory", view: "dashboard" as const },
  { icon: Camera, label: "New Listing", view: "capture" as const },
  { icon: ShoppingBag, label: "Orders", view: "orders" as const },
  { icon: BarChart2, label: "Expenses", view: "expenses" as const },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Page() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const [items, setItems] = useState<ThriftItem[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStorefront, setShowStorefront] = useState(true); // default: show clothes
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [view, setViewRaw] = useState<View>(() => {
    if (typeof window === "undefined") return { name: "overview" };
    try {
      const saved = localStorage.getItem("ukay-view");
      return saved ? (JSON.parse(saved) as View) : { name: "overview" };
    } catch {
      return { name: "overview" };
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAssignBuyer, setShowAssignBuyer] = useState(false);
  const [itemToSell, setItemToSell] = useState<ThriftItem | null>(null);
  const [activeNav, setActiveNavRaw] = useState(() => {
    if (typeof window === "undefined") return "Dashboard";
    return localStorage.getItem("ukay-nav") ?? "Dashboard";
  });

  function setView(v: View) {
    localStorage.setItem("ukay-view", JSON.stringify(v));
    setViewRaw(v);
  }

  function setActiveNav(label: string) {
    localStorage.setItem("ukay-nav", label);
    setActiveNavRaw(label);
  }

  // ── Auth Listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      if (event === "SIGNED_IN" && session?.user) {
        const name = session.user.user_metadata?.full_name || "there";
        toast.success(`Welcome back, ${name}!`, { description: "You're now signed in." });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    supabase
      .from("items")
      .select("*")
      .order("listed_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("[Ukay] fetch error:", JSON.stringify(error));
        } else if (data) {
          console.log("[Ukay] fetched", data.length, "rows", data[0]);
          setItems(data.map(fromRow));
        }
        setLoading(false);
      });
  }, [user]);

  // ── Fetch orders ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetchOrdersWithDetails(user.id).then(setOrders);
  }, [user]);

  // ── Fetch seller profile (for storefront toggle + settings) ─────────────
  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        // Unauthenticated: fetch any seller profile to check show_storefront
        const { data } = await supabase
          .from("seller_profiles")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (data) {
          setShowStorefront(data.show_storefront);
        }
        // If no profile exists, default to true (show clothes)
        return;
      }

      // Authenticated: fetch this user's profile
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setSellerProfile({
          id: data.id,
          userId: data.user_id,
          storeName: data.store_name,
          showStorefront: data.show_storefront,
        });
        setShowStorefront(data.show_storefront);
      } else if (!data) {
        // Auto-create profile for new sellers
        const { data: created } = await supabase
          .from("seller_profiles")
          .insert({
            user_id: user.id,
            store_name: user.user_metadata?.store_name || "Thrift Store",
            show_storefront: true,
          })
          .select()
          .single();

        if (created) {
          const profile: SellerProfile = {
            id: created.id,
            userId: created.user_id,
            storeName: created.store_name,
            showStorefront: created.show_storefront,
          };
          setSellerProfile(profile);
          setShowStorefront(created.show_storefront);
        }
      }
    }
    fetchProfile();
  }, [user]);

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ── Write helpers ──────────────────────────────────────────────────────────
  async function updateItem(id: string, patch: Partial<ThriftItem>) {
    const current = items.find((it) => it.id === id);
    if (!current) return;
    const merged = { ...current, ...patch };
    setItems((prev) => prev.map((it) => (it.id === id ? merged : it)));
    const { error } = await supabase.from("items").update(toRow(merged)).eq("id", id);
    if (error) console.error("Error updating item:", error);
  }

  async function deleteItemById(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setView({ name: "dashboard" });
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } else {
      toast.success("Item deleted", { description: "The listing has been removed." });
    }
  }

  // ── Nav ────────────────────────────────────────────────────────────────────
  function handleNavClick(label: string, v: "overview" | "dashboard" | "capture" | "orders" | "expenses") {
    setActiveNav(label);
    if (v === "overview") {
      setView({ name: "overview" });
    } else if (v === "dashboard") {
      setView({ name: "dashboard" });
    } else if (v === "orders") {
      setView({ name: "orders" });
    } else if (v === "expenses") {
      setView({ name: "expenses" });
    } else {
      setView({ name: "capture" });
    }
    setSidebarOpen(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out", { description: "See you next time!" });
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-900" />
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <AuthScreen onBack={() => setShowAuth(false)} />;
    }

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-neutral-50 text-neutral-400">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-900" />
        </div>
      );
    }

    // If storefront is disabled, show auth screen directly
    if (!showStorefront) {
      return <AuthScreen />;
    }

    return <Storefront items={items} onLoginClick={() => setShowAuth(true)} />;
  }

  const storeName = user.user_metadata?.store_name || "Thrift Store";
  const userInitial = (user.user_metadata?.full_name || user.email || "S")[0].toUpperCase();

  const stats = deriveStats(items);

  // ── Render Dashboard Layout ────────────────────────────────────────────────
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
        <div className="flex h-16 items-center border-b border-neutral-200 px-8">
          <CoatLogo className="text-2xl" />
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
          <button
            onClick={() => {
              setActiveNav("Settings");
              setView({ name: "settings" });
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
              activeNav === "Settings"
                ? "bg-neutral-900 text-white"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
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
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600">
              {storeName}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white p-3 sm:p-6">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {view.name === "overview" && (
                <DashboardOverview items={items} orders={orders} />
              )}

              {view.name === "dashboard" && (
                <Dashboard
                  items={items}
                  onNewItem={() => {
                    setView({ name: "capture" });
                    setActiveNav("New Listing");
                  }}
                  onSelectItem={(id) => setView({ name: "detail", id })}
                />
              )}

              {view.name === "capture" && (
                <CameraCapture
                  onBack={() => {
                    setView({ name: "dashboard" });
                    setActiveNav("Inventory");
                  }}
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
                    setItems((prev) => [newItem, ...prev]);
                    setView({ name: "detail", id: newItem.id });
                    toast.success("Listing created", { description: `${newItem.id} added to inventory.` });
                    setActiveNav("Inventory");
                    const { error } = await supabase.from("items").insert(toRow(newItem));
                    if (error) console.error("Error inserting item:", error);
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
                        await updateItem(updated.id, updated);
                        setView({ name: "dashboard" });
                      }}
                      onMarkReserved={(id) => updateItem(id, { status: "reserved" })}
                      onMarkSold={(id) => {
                        const sellItem = items.find((it) => it.id === id);
                        if (sellItem) {
                          setItemToSell(sellItem);
                          setShowAssignBuyer(true);
                        }
                      }}
                      onRelist={(id) =>
                        updateItem(id, {
                          status: "available",
                          soldAt: undefined,
                          soldPrice: undefined,
                        })
                      }
                      onDelete={deleteItemById}
                    />
                  );
                })()}

              {view.name === "settings" && (
                <SettingsPage
                  userId={user.id}
                  onBack={() => {
                    setView({ name: "dashboard" });
                    setActiveNav("Inventory");
                  }}
                />
              )}

              {view.name === "expenses" && (
                <ExpensesView userId={user.id} />
              )}

              {view.name === "orders" && (
                <OrdersView
                  userId={user.id}
                  onViewBuyers={() => setView({ name: "buyers" })}
                />
              )}

              {view.name === "buyers" && (
                <BuyerList
                  userId={user.id}
                  onSelectBuyer={(buyer) => setView({ name: "buyer-detail", buyer })}
                  onBack={() => setView({ name: "orders" })}
                />
              )}

              {view.name === "buyer-detail" && (
                <BuyerDetail
                  buyer={view.buyer}
                  userId={user.id}
                  onBack={() => setView({ name: "buyers" })}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Assign Buyer Modal */}
      {showAssignBuyer && itemToSell && (
        <AssignBuyerModal
          userId={user.id}
          itemName={itemToSell.title}
          onClose={() => {
            setShowAssignBuyer(false);
            setItemToSell(null);
          }}
          onConfirm={async (buyerId, paymentMethod) => {
            // Create the order
            await createOrder({
              userId: user.id,
              itemId: itemToSell.id,
              buyerId: buyerId || undefined,
              salePrice: itemToSell.price,
              paymentStatus: "Unpaid",
              paymentMethod: paymentMethod as any,
              fulfillmentStatus: "Pending",
              source: "Facebook",
              notes: "",
            });
            // Mark item as sold
            await updateItem(itemToSell.id, {
              status: "sold",
              soldAt: new Date().toISOString(),
              soldPrice: itemToSell.price,
            });
            setShowAssignBuyer(false);
            setItemToSell(null);
            toast.success("Item sold", { description: "Order created successfully." });
            setView({ name: "orders" });
            setActiveNav("Orders");
          }}
          onSkip={async () => {
            // Create order without buyer
            await createOrder({
              userId: user.id,
              itemId: itemToSell.id,
              salePrice: itemToSell.price,
              paymentStatus: "Unpaid",
              fulfillmentStatus: "Pending",
              source: "Facebook",
              notes: "",
            });
            // Mark item as sold
            await updateItem(itemToSell.id, {
              status: "sold",
              soldAt: new Date().toISOString(),
              soldPrice: itemToSell.price,
            });
            setShowAssignBuyer(false);
            setItemToSell(null);
            toast.success("Item sold", { description: "Order created (no buyer linked)." });
            setView({ name: "orders" });
            setActiveNav("Orders");
          }}
        />
      )}
    </div>
  );
}
