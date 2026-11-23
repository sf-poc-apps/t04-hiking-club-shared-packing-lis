"use server";

import { revalidatePath } from "next/cache";
import { addItem as createItem, deleteItem as removeItem, togglePacked as flipPacked } from "@/lib/packingItems";
import { validateItem } from "@/lib/validate";

const clean = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);

export interface ActionState {
  errors: Record<string, string>;
}

export async function addItem(_prev: ActionState, form: FormData): Promise<ActionState> {
  const result = validateItem({
    name: form.get("name"),
    category: form.get("category"),
    quantity: form.get("quantity"),
    broughtBy: form.get("broughtBy"),
  });
  if (!result.ok) return { errors: result.errors };
  await createItem(result.value!);
  revalidatePath("/");
  return { errors: {} };
}

export async function togglePacked(form: FormData) {
  const id = clean(form.get("id"), 64);
  const packed = clean(form.get("packed"), 10) === "true" || clean(form.get("packed"), 10) === "1";
  if (id) await flipPacked(id, !packed);
  revalidatePath("/");
}

export async function deleteItem(form: FormData) {
  const id = clean(form.get("id"), 64);
  if (id) await removeItem(id);
  revalidatePath("/");
}