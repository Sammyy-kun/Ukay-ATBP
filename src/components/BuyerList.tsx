"use client";

import { useState, useEffect } from "react";
import { Buyer } from "@/lib/types";
import { fetchBuyers, deleteBuyer } from "@/lib/orders";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Search, User, Phone, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface BuyerListProps {
  userId: string;
  onSelectBuyer: (buyer: Buyer) => void;
  onBack: () => void;
}

export function BuyerList({ userId, onSelectBuyer, onBack }: BuyerListProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadBuyers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadBuyers() {
    setLoading(true);
    const data = await fetchBuyers(userId);
    setBuyers(data);
    setLoading(false);
  }

  const filtered = buyers.filter((b) =>
    b.facebookName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    await deleteBuyer(id);
    setBuyers((prev) => prev.filter((b) => b.id !== id));
    setDeleteId(null);
    toast.success("Buyer deleted");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Buyers</h2>
          <p className="text-sm text-neutral-500">
            {buyers.length} buyer{buyers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          Back to Orders
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <Input
          placeholder="Search buyers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <User size={40} className="mb-3 text-neutral-200" />
          <p className="text-sm font-medium text-neutral-500">
            {buyers.length === 0
              ? "No buyers yet. Buyers are added when you assign them to orders."
              : "No buyers match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((buyer) => (
            <button
              key={buyer.id}
              onClick={() => onSelectBuyer(buyer)}
              className="flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:bg-neutral-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white shrink-0">
                {buyer.facebookName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {buyer.facebookName}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {buyer.phone && (
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <Phone size={10} />
                      {buyer.phone}
                    </span>
                  )}
                  {buyer.messengerUrl && (
                    <span className="text-xs text-neutral-400 truncate">
                      {buyer.messengerUrl.replace("https://", "")}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="shrink-0"
                onClick={(e) => { e.stopPropagation(); setDeleteId(buyer.id); }}
              >
                <Trash2
                  size={14}
                  className="text-neutral-300 hover:text-red-500 transition-colors cursor-pointer"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete buyer"
        description="Are you sure you want to delete this buyer? This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
