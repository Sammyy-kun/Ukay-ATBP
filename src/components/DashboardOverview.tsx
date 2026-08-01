"use client";

import { useMemo } from "react";
import { ThriftItem, OrderWithDetails } from "@/lib/types";
import {
  deriveKpis,
  weeklyRevenue,
  monthlyRevenue,
  categoryBreakdown,
  recentSales,
} from "@/lib/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Tag,
  Shirt,
  AlertCircle,
} from "lucide-react";
import { PaymentBadge } from "@/components/PaymentBadge";
import { FulfillmentBadge } from "@/components/FulfillmentBadge";

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const weeklyChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#f97316", // brand-500
  },
} satisfies ChartConfig;

const monthlyChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#10b981", // green accent
  },
} satisfies ChartConfig;

const categoryChartConfig = {
  Dress: { label: "Dress", color: "var(--chart-1)" },
  Top: { label: "Top", color: "var(--chart-2)" },
  Pants: { label: "Pants", color: "var(--chart-3)" },
  Jacket: { label: "Jacket", color: "var(--chart-4)" },
} satisfies ChartConfig;

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

function KpiCard({
  label,
  value,
  icon: Icon,
  iconBg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconBg: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
              {value}
            </p>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon size={18} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Status badge helper
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    available: "default",
    reserved: "secondary",
    sold: "outline",
  };
  return (
    <Badge variant={variants[status] || "outline"} className="capitalize">
      {status}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Shirt size={36} className="mb-3 text-neutral-200" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface DashboardOverviewProps {
  items: ThriftItem[];
  orders?: OrderWithDetails[];
}

export function DashboardOverview({ items, orders = [] }: DashboardOverviewProps) {
  // Only count items with a PAID order for revenue
  const paidItemIds = useMemo(
    () => new Set(orders.filter((o) => o.paymentStatus === "Paid").map((o) => o.itemId)),
    [orders]
  );
  const paidItems = useMemo(
    () => items.filter((i) => paidItemIds.has(i.id)),
    [items, paidItemIds]
  );

  const kpis = useMemo(() => deriveKpis(items), [items]);
  const weekly = useMemo(() => weeklyRevenue(paidItems), [paidItems]);
  const monthly = useMemo(() => monthlyRevenue(paidItems), [paidItems]);
  const categories = useMemo(() => categoryBreakdown(items), [items]);
  const recent = useMemo(() => recentSales(items, 8), [items]);

  const unpaidOrders = useMemo(
    () => orders.filter((o) => o.paymentStatus === "Unpaid").length,
    [orders]
  );
  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  // Revenue KPI from paid orders only
  const revenue7d = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return orders
      .filter(
        (o) =>
          o.paymentStatus === "Paid" &&
          o.paidAt &&
          new Date(o.paidAt).getTime() > oneWeekAgo
      )
      .reduce((sum, o) => sum + o.salePrice, 0);
  }, [orders]);

  const hasSold = kpis.totalSold > 0;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard
          label="Live Listings"
          value={String(kpis.liveListings)}
          icon={Tag}
          iconBg="bg-neutral-900"
        />
        <KpiCard
          label="Sold This Week"
          value={String(kpis.soldThisWeek)}
          icon={ShoppingBag}
          iconBg="bg-neutral-900"
        />
        <KpiCard
          label="Revenue, 7 Days"
          value={`₱${revenue7d.toLocaleString()}`}
          icon={DollarSign}
          iconBg="bg-neutral-900"
        />
        <KpiCard
          label="Unpaid Orders"
          value={String(unpaidOrders)}
          icon={AlertCircle}
          iconBg="bg-neutral-900"
        />
      </div>

      {/* ── Recent Orders ── */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>Last {recentOrders.length} orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.buyer?.facebookName || "—"}
                      </TableCell>
                      <TableCell className="truncate max-w-[120px]">
                        {order.itemTitle || order.itemId}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        ₱{order.salePrice.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={order.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <FulfillmentBadge status={order.fulfillmentStatus} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Revenue Charts ── */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
        {/* Weekly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Revenue</CardTitle>
            <CardDescription>Revenue over the last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            {hasSold ? (
              <ChartContainer config={weeklyChartConfig} className="h-[260px] w-full">
                <BarChart data={weekly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    tickFormatter={(v) => `₱${v}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `₱${Number(value).toLocaleString()}`}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyState message="No sales yet — weekly revenue will appear here once you mark items sold." />
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
            <CardDescription>Revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {hasSold ? (
              <ChartContainer config={monthlyChartConfig} className="h-[260px] w-full">
                <LineChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    tickFormatter={(v) => `₱${v}`}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `₱${Number(value).toLocaleString()}`}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-revenue)" }}
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <EmptyState message="No sales yet — monthly revenue will appear here once you mark items sold." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: Table + Pie ── */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Recent Sales Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Sales</CardTitle>
            <CardDescription>
              {recent.length > 0
                ? `Showing ${recent.length} most recent sales`
                : "No sales recorded yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.title}
                        </TableCell>
                        <TableCell>{sale.category}</TableCell>
                        <TableCell>{sale.size}</TableCell>
                        <TableCell className="tabular-nums">
                          ₱{sale.soldPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(sale.soldAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState message="No sales yet — your recent sales will show up here." />
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Category</CardTitle>
            <CardDescription>Sales breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <div className="flex flex-col items-center">
                <ChartContainer config={categoryChartConfig} className="h-[220px] w-full">
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={categories}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={50}
                      outerRadius={80}
                      strokeWidth={2}
                    >
                      {categories.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={entry.fill}
                          stroke="hsl(var(--background))"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {/* Legend */}
                <div className="mt-3 flex flex-wrap justify-center gap-3">
                  {categories.map((cat) => (
                    <div key={cat.category} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ backgroundColor: cat.fill }}
                      />
                      <span className="text-muted-foreground">
                        {cat.category} ({cat.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="No sales data — category breakdown will appear here." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
