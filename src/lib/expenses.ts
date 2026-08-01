import { Expense } from "@/lib/types";
import { supabase } from "@/lib/supabase";

// ── Row mappers ────────────────────────────────────────────────────────────

export function expenseFromRow(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    category: row.category as Expense["category"],
    description: row.description as string,
    amount: Number(row.amount),
    date: row.date as string,
    orderId: (row.order_id as string) || undefined,
    notes: (row.notes as string) || "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function expenseToRow(expense: Partial<Expense>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (expense.userId !== undefined) row.user_id = expense.userId;
  if (expense.category !== undefined) row.category = expense.category;
  if (expense.description !== undefined) row.description = expense.description;
  if (expense.amount !== undefined) row.amount = expense.amount;
  if (expense.date !== undefined) row.date = expense.date;
  if (expense.orderId !== undefined) row.order_id = expense.orderId;
  if (expense.notes !== undefined) row.notes = expense.notes;
  row.updated_at = new Date().toISOString();
  return row;
}

// ── CRUD helpers ───────────────────────────────────────────────────────────

export async function fetchExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error || !data) return [];
  return data.map(expenseFromRow);
}

export async function createExpense(expense: Omit<Expense, "id" | "createdAt" | "updatedAt">): Promise<Expense | null> {
  const { data, error } = await supabase
    .from("expenses")
    .insert(expenseToRow(expense))
    .select()
    .single();

  if (error || !data) return null;
  return expenseFromRow(data);
}

export async function updateExpense(id: string, patch: Partial<Expense>): Promise<void> {
  const { error } = await supabase
    .from("expenses")
    .update(expenseToRow(patch))
    .eq("id", id);

  if (error) console.error("Error updating expense:", error);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) console.error("Error deleting expense:", error);
}
