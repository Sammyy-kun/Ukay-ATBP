"use client";

import { useState, useEffect, useMemo } from "react";
import { Expense, ExpenseCategory } from "@/lib/types";
import { fetchExpenses, createExpense, deleteExpense } from "@/lib/expenses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
import {
  Search,
  Plus,
  Trash2,
  Receipt,
  X,
} from "lucide-react";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Shipping",
  "Transportation",
  "Packaging",
  "Supplies",
  "Platform Fees",
  "Other",
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Shipping: "bg-blue-50 text-blue-700 border-blue-200",
  Transportation: "bg-amber-50 text-amber-700 border-amber-200",
  Packaging: "bg-purple-50 text-purple-700 border-purple-200",
  Supplies: "bg-green-50 text-green-700 border-green-200",
  "Platform Fees": "bg-red-50 text-red-700 border-red-200",
  Other: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

interface ExpensesViewProps {
  userId: string;
}

export function ExpensesView({ userId }: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formCategory, setFormCategory] = useState<ExpenseCategory>("Shipping");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function loadExpenses() {
    setLoading(true);
    const data = await fetchExpenses(userId);
    setExpenses(data);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        !search ||
        e.description.toLowerCase().includes(search.toLowerCase()) ||
        e.notes.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalExpenses = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered]
  );

  const totalAllExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  async function handleSubmit() {
    if (!formDescription.trim() || !formAmount) return;
    setSubmitting(true);

    const expense = await createExpense({
      userId,
      category: formCategory,
      description: formDescription.trim(),
      amount: parseFloat(formAmount),
      date: formDate,
      notes: formNotes.trim(),
    });

    if (expense) {
      setExpenses((prev) => [expense, ...prev]);
      toast.success("Expense added", { description: `${formCategory}: ₱${parseFloat(formAmount).toLocaleString()}` });
      resetForm();
    } else {
      toast.error("Failed to add expense");
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setDeleteId(null);
    toast.success("Expense deleted");
  }

  function resetForm() {
    setFormCategory("Shipping");
    setFormDescription("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormNotes("");
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Expenses</h2>
          <p className="text-sm text-neutral-500">
            Total: ₱{totalAllExpenses.toLocaleString()} · {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "New Expense"}
        </Button>
      </div>

      {/* Add expense form */}
      {showForm && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Category
              </label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v as ExpenseCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Description *
              </label>
              <Input
                placeholder="e.g. J&T Express shipping fee"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Amount (₱) *
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                Date
              </label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              Notes
            </label>
            <Input
              placeholder="Optional notes..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
          <Button
            className="bg-neutral-900 text-white hover:bg-neutral-800"
            disabled={!formDescription.trim() || !formAmount || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              "Add Expense"
            )}
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {EXPENSE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
          <span className="text-sm text-neutral-500">
            Showing {filtered.length} of {expenses.length} expenses
          </span>
          <span className="text-sm font-semibold text-neutral-900">
            Filtered total: ₱{totalExpenses.toLocaleString()}
          </span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-neutral-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Receipt size={40} className="mb-3 text-neutral-200" />
          <p className="text-sm font-medium text-neutral-500">
            {expenses.length === 0
              ? "No expenses yet. Click \"New Expense\" to add your first one."
              : "No expenses match your filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}
                    >
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {expense.description}
                  </TableCell>
                  <TableCell className="tabular-nums font-semibold text-red-600">
                    -₱{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-500 whitespace-nowrap">
                    {new Date(expense.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-400 max-w-[120px] truncate">
                    {expense.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteId(expense.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
