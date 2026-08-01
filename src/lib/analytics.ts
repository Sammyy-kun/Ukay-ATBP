import { ThriftItem, Category } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KpiData {
  liveListings: number;
  reserved: number;
  soldThisWeek: number;
  revenue7d: number;
  totalSold: number;
  totalRevenue: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface CategoryData {
  category: string;
  value: number;
  fill: string;
}

export interface RecentSale {
  id: string;
  title: string;
  category: string;
  size: string;
  soldAt: string;
  soldPrice: number;
  paymentMethod?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  Dress: "var(--chart-1)",
  Top: "var(--chart-2)",
  Pants: "var(--chart-3)",
  Jacket: "var(--chart-4)",
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function formatMonthLabel(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[date.getMonth()];
}

// ---------------------------------------------------------------------------
// KPI derivation
// ---------------------------------------------------------------------------

export function deriveKpis(items: ThriftItem[]): KpiData {
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const sold = items.filter((i) => i.status === "sold" && i.soldAt);
  const soldThisWeek = sold.filter(
    (i) => new Date(i.soldAt!).getTime() > oneWeekAgo
  );

  return {
    liveListings: items.filter((i) => i.status === "available").length,
    reserved: items.filter((i) => i.status === "reserved").length,
    soldThisWeek: soldThisWeek.length,
    revenue7d: soldThisWeek.reduce((s, i) => s + (i.soldPrice ?? i.price), 0),
    totalSold: sold.length,
    totalRevenue: sold.reduce((s, i) => s + (i.soldPrice ?? i.price), 0),
  };
}

// ---------------------------------------------------------------------------
// Weekly revenue (last N weeks, default 8)
// ---------------------------------------------------------------------------

export function weeklyRevenue(items: ThriftItem[], weeks = 8): RevenuePoint[] {
  const now = new Date();
  const sold = items.filter((i) => i.status === "sold" && i.soldAt);

  const result: RevenuePoint[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekStart = startOfWeek(weekEnd);
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const weekItems = sold.filter((i) => {
      const d = new Date(i.soldAt!).getTime();
      return d >= weekStart.getTime() && d < nextWeekStart.getTime();
    });

    result.push({
      label: formatWeekLabel(weekStart),
      revenue: weekItems.reduce((s, i) => s + (i.soldPrice ?? i.price), 0),
      orders: weekItems.length,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Monthly revenue (last N months, default 6)
// ---------------------------------------------------------------------------

export function monthlyRevenue(items: ThriftItem[], months = 6): RevenuePoint[] {
  const now = new Date();
  const sold = items.filter((i) => i.status === "sold" && i.soldAt);

  const result: RevenuePoint[] = [];

  for (let m = months - 1; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthItems = sold.filter((i) => {
      const d = new Date(i.soldAt!).getTime();
      return d >= monthStart.getTime() && d <= monthEnd.getTime();
    });

    result.push({
      label: formatMonthLabel(monthStart),
      revenue: monthItems.reduce((s, i) => s + (i.soldPrice ?? i.price), 0),
      orders: monthItems.length,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Category breakdown (sold items only)
// ---------------------------------------------------------------------------

export function categoryBreakdown(items: ThriftItem[]): CategoryData[] {
  const sold = items.filter((i) => i.status === "sold");

  const counts: Record<string, number> = {};
  for (const item of sold) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([category, value]) => ({
      category,
      value,
      fill: CATEGORY_COLORS[category] || "var(--chart-5)",
    }))
    .filter((d) => d.value > 0);
}

// ---------------------------------------------------------------------------
// Recent sales (most recent N sold items)
// ---------------------------------------------------------------------------

export function recentSales(items: ThriftItem[], limit = 8): RecentSale[] {
  return items
    .filter((i) => i.status === "sold" && i.soldAt)
    .sort((a, b) => new Date(b.soldAt!).getTime() - new Date(a.soldAt!).getTime())
    .slice(0, limit)
    .map((i) => ({
      id: i.id,
      title: i.title,
      category: i.category,
      size: i.size,
      soldAt: i.soldAt!,
      soldPrice: i.soldPrice ?? i.price,
      paymentMethod: i.paymentMethod,
    }));
}
