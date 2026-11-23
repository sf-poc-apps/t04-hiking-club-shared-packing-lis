import { ALL_CATEGORIES } from "@/lib/packingItems";

export interface ValidateResult {
  ok: boolean;
  errors: Record<string, string>;
  value?: { name: string; category: string; quantity: number; broughtBy: string };
}

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function validateItem(input: {
  name: unknown;
  category: unknown;
  quantity: unknown;
  broughtBy: unknown;
}): ValidateResult {
  const errors: Record<string, string> = {};
  const name = clean(input.name);
  const category = clean(input.category, 50);
  const broughtBy = clean(input.broughtBy, 100);
  const rawQty = typeof input.quantity === "number" ? input.quantity : Number(clean(String(input.quantity ?? ""), 10));
  const quantity = rawQty;

  if (!name) errors.name = "Item name is required.";
  if (!ALL_CATEGORIES.includes(category)) errors.category = "Choose a valid category.";
  if (!Number.isInteger(quantity) || quantity < 1) errors.quantity = "Quantity must be a whole number of at least 1.";
  if (!broughtBy) errors.broughtBy = "Who brings it is required.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, errors: {}, value: { name, category, quantity, broughtBy } };
}

export function filterByCategory<T extends { category: string }>(items: T[], category: string | undefined | null): T[] {
  const c = (category ?? "").trim();
  if (!c || c === "All" || !ALL_CATEGORIES.includes(c)) return items;
  return items.filter((i) => i.category === c);
}
