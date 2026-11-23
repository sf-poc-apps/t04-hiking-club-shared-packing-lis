import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { addItem, togglePacked, deleteItem } from "../app/actions";
import { MemoryStore, getStore, type Doc } from "../lib/store";

const g = globalThis as unknown as { __store?: ReturnType<typeof getStore> };

function setStore(store: MemoryStore) {
  g.__store = store;
}

function form(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.append(k, v);
  return f;
}

describe("addItem action", () => {
  beforeEach(() => setStore(new MemoryStore()));
  afterEach(() => setStore(new MemoryStore()));

  it("creates a doc with packed=false and createdAt for valid input", async () => {
    const store = new MemoryStore();
    setStore(store);
    const res = await addItem({ errors: {} }, form({ name: "Tent", category: "Shelter", quantity: "2", broughtBy: "Ada" }));
    expect(res.errors).toEqual({});
    const docs: Doc[] = await store.list("packingItems");
    expect(docs).toHaveLength(1);
    expect(docs[0].name).toBe("Tent");
    expect(docs[0].packed).toBe(false);
    expect(typeof docs[0].createdAt === "string" && docs[0].createdAt.length > 0).toBe(true);
  });

  it("rejects empty name and creates nothing", async () => {
    const res = await addItem({ errors: {} }, form({ name: "  ", category: "Food", quantity: "1", broughtBy: "Bo" }));
    expect(res.errors.name).toBeTruthy();
    expect((await getStore().list("packingItems")).length).toBe(0);
  });

  it("rejects invalid quantity and creates nothing", async () => {
    for (const q of ["0", "-2", "abc", "2.5"]) {
      const res = await addItem({ errors: {} }, form({ name: "Stove", category: "Cooking", quantity: q, broughtBy: "Cy" }));
      expect(res.errors.quantity).toBeTruthy();
    }
    expect((await getStore().list("packingItems")).length).toBe(0);
  });

  it("rejects empty broughtBy and invalid category", async () => {
    const res = await addItem({ errors: {} }, form({ name: "Rope", category: "Nope", quantity: "1", broughtBy: "" }));
    expect(res.errors.broughtBy).toBeTruthy();
    expect(res.errors.category).toBeTruthy();
    expect((await getStore().list("packingItems")).length).toBe(0);
  });
});

describe("togglePacked and deleteItem actions", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
    setStore(store);
  });
  afterEach(() => setStore(new MemoryStore()));

  it("togglePacked flips the packed field", async () => {
    const doc = await store.create("packingItems", { name: "Tent", packed: false });
    await togglePacked(form({ id: doc.id, packed: "false" }));
    expect((await store.get("packingItems", doc.id))?.packed).toBe(true);
    await togglePacked(form({ id: doc.id, packed: "true" }));
    expect((await store.get("packingItems", doc.id))?.packed).toBe(false);
  });

  it("deleteItem removes the document", async () => {
    const doc = await store.create("packingItems", { name: "Tent", packed: false });
    await deleteItem(form({ id: doc.id }));
    expect(await store.get("packingItems", doc.id)).toBeNull();
  });
});