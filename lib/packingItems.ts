import { getStore } from "@/lib/store";

export const CATEGORIES = ["Shelter", "Cooking", "Clothing", "Food", "Safety", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];
export const ALL_CATEGORIES: string[] = [...CATEGORIES];

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  broughtBy: string;
  packed: boolean;
  createdAt: string;
}

export interface ItemInput {
  name: string;
  category: string;
  quantity: number;
  broughtBy: string;
}

const toItems = (docs: Record<string, unknown>[]): PackingItem[] =>
  docs.map((d) => ({
    id: String(d.id),
    name: String(d.name ?? ""),
    category: String(d.category ?? "Other"),
    quantity: Number(d.quantity ?? 1),
    broughtBy: String(d.broughtBy ?? ""),
    packed: Boolean(d.packed),
    createdAt: String(d.createdAt ?? d.created_at ?? ""),
  }));

export async function listItems(): Promise<PackingItem[]> {
  const docs = await getStore().list("packingItems", "createdAt");
  return toItems(docs);
}

export async function addItem(input: ItemInput): Promise<PackingItem> {
  const doc = await getStore().create("packingItems", {
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    broughtBy: input.broughtBy,
    packed: false,
    createdAt: new Date().toISOString(),
  });
  return toItems([doc])[0];
}

export async function togglePacked(id: string, packed: boolean): Promise<PackingItem | null> {
  const doc = await getStore().update("packingItems", id.slice(0, 64), { packed });
  return doc ? toItems([doc])[0] : null;
}

export async function deleteItem(id: string): Promise<boolean> {
  return getStore().remove("packingItems", id.slice(0, 64));
}
