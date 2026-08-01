"use client";

import { useState, useEffect } from "react";
import { Buyer } from "@/lib/types";
import { fetchBuyers, createBuyer } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, User, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AssignBuyerModalProps {
  userId: string;
  itemName: string;
  onConfirm: (buyerId: string | null, paymentMethod: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function AssignBuyerModal({
  userId,
  itemName,
  onConfirm,
  onSkip,
  onClose,
}: AssignBuyerModalProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [mode, setMode] = useState<"search" | "create">("search");

  // New buyer fields
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newMessenger, setNewMessenger] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBuyers(userId).then(setBuyers);
  }, [userId]);

  const filtered = buyers.filter((b) =>
    b.facebookName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreateAndConfirm() {
    if (!newName.trim()) return;
    const buyer = await createBuyer({
      userId,
      facebookName: newName.trim(),
      phone: newPhone.trim() || undefined,
      messengerUrl: newMessenger.trim() || undefined,
      notes: "",
    });
    if (buyer) {
      toast.success("Buyer created", { description: `${buyer.facebookName} added.` });
      onConfirm(buyer.id, paymentMethod);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Assign Buyer</h3>
              <p className="mt-0.5 text-xs text-neutral-500 truncate max-w-[260px]">
                {itemName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex border-b border-neutral-200 px-6">
            <button
              onClick={() => setMode("search")}
              className={`flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                mode === "search"
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <User size={14} />
              Existing
            </button>
            <button
              onClick={() => setMode("create")}
              className={`ml-4 flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                mode === "create"
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <UserPlus size={14} />
              New Buyer
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {mode === "search" ? (
              <>
                <div className="relative mb-3">
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
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="py-4 text-center text-sm text-neutral-400">
                      {buyers.length === 0
                        ? "No buyers yet. Create one first."
                        : "No buyers match your search."}
                    </p>
                  ) : (
                    filtered.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBuyerId(b.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          selectedBuyerId === b.id
                            ? "bg-neutral-900 text-white"
                            : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600 shrink-0">
                          {b.facebookName[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{b.facebookName}</p>
                          {b.phone && (
                            <p className={`text-xs truncate ${selectedBuyerId === b.id ? "text-neutral-300" : "text-neutral-400"}`}>
                              {b.phone}
                            </p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">
                    Facebook Name *
                  </label>
                  <Input
                    placeholder="Juan Dela Cruz"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">
                    Phone
                  </label>
                  <Input
                    placeholder="0917-123-4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600">
                    Messenger URL
                  </label>
                  <Input
                    placeholder="https://m.me/username"
                    value={newMessenger}
                    onChange={(e) => setNewMessenger(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Payment Method
              </label>
              <div className="flex gap-2">
                {["GCash", "Bank Transfer", "COD", "Other"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      paymentMethod === method
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 border-t border-neutral-200 px-6 py-4">
            <Button
              variant="outline"
              className="flex-1"
              disabled={submitting}
              onClick={async () => {
                setSubmitting(true);
                await onSkip();
              }}
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : "Skip"}
            </Button>
            <Button
              className="flex-1 bg-neutral-900 text-white hover:bg-neutral-800"
              disabled={(mode === "search" ? !selectedBuyerId : !newName.trim()) || submitting}
              onClick={async () => {
                setSubmitting(true);
                if (mode === "search" && selectedBuyerId) {
                  await onConfirm(selectedBuyerId, paymentMethod);
                } else if (mode === "create") {
                  await handleCreateAndConfirm();
                }
                setSubmitting(false);
              }}
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                mode === "create" ? "Create & Confirm" : "Confirm"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
