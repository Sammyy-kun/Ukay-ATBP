"use client";

import { useMemo, useState } from "react";
import { Plus, Shirt, Search, Download, Pencil } from "lucide-react";
import { ThriftItem, Size, ItemStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardProps {
  items: ThriftItem[];
  onNewItem?: () => void;
  onSelectItem?: (id: string) => void;
}

export function Dashboard({ items, onNewItem, onSelectItem }: DashboardProps) {
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
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Inventory</h2>
          <p className="text-sm text-neutral-500">
            {items.length} total item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-1.5"
          >
            <Download size={16} /> Export
          </Button>
          <Button
            size="sm"
            onClick={onNewItem}
            className="gap-1.5"
          >
            <Plus size={16} /> New item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by SKU, title, category..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sizeFilter} onValueChange={(v) => setSizeFilter(v as Size | "all")}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="All sizes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sizes</SelectItem>
              {(["XS", "S", "M", "L", "XL"] as Size[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ItemStatus | "all")}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Items Table */}
      {filtered.length > 0 ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Photo</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const coverPhoto = item.photos?.[0] ?? null;
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-neutral-100 flex items-center justify-center">
                        {coverPhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={coverPhoto}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Shirt size={16} className="text-neutral-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.id}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {item.title}
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.size}</TableCell>
                    <TableCell className="tabular-nums font-medium">
                      ₱{item.price.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectItem?.(item.id)}
                        className="gap-1.5 h-8"
                      >
                        <Pencil size={14} />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <Shirt size={40} className="mb-3 text-neutral-200" />
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? "No items yet. Click \"New item\" to add your first listing."
              : "No items match your filters."}
          </p>
        </div>
      )}
    </div>
  );
}
