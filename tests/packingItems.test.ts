import { describe, expect, it } from "vitest";
import { addItem, deleteItem, listItems, togglePacked, type ItemInput } from "../lib/packingItems";
import { MemoryStore } from "../lib/store";

const g = globalThis as unknown as { __store?: unknown };

const input = (over: Partial<ItemInput> = {}): ItemInput => ({
  name: "Tent",
  category: "Shelter",
  quantity: 1,
  broughtBy: "Ada",
  ...over,
});

describe("packingItems data layer", () => {
  it("addItem stores packed=false and createdAt; listItems orders by createdAt", async () => {
    const store = new MemoryStore();
    g.__store = store;
    const a = await addItem(input({ name: "First" }));
    const b = await addItem(input({ name: "Second" }));
    expect(a.packed).toBe(false);
    expect(a.createdAt).toBeTruthy();
    const items = await listItems();
    expect(items.map((i) => i.name)).toEqual(["First", "Second"]);
    expect(items[0]).toMatchObject({ category: "Shelter", quantity: 1, broughtBy: "Ada", packed: false });
    void b;
  });

  it("togglePacked updates the packed field", async () => {
    const store = new MemoryStore();
    g.__store = store;
    const a = await addItem(input());
    const updated = await togglePacked(a.id, true);
    expect(updated?.packed).toBe(true);
    expect((await listItems())[0].packed).toBe(true);
  });

  it("deleteItem removes the item", async () => {
    const store = new MemoryStore();
    g.__store = store;
    const a = await addItem(input());
    expect(await deleteItem(a.id)).toBe(true);
    expect(await listItems()).toHaveLength(0);
  });

  it("togglePacked/deleteItem on unknown ids are safe", async () => {
    const store = new MemoryStore();
    g.__store = store;
    expect(await togglePacked("nope", true)).toBeNull();
    expect(await deleteItem("nope")).toBe(false);
  });

  it("listItems maps unknown fields to safe defaults", async () => {
    const store = new MemoryStore();
    g.__store = store;
    await store.create("packingItems", { name: "Odd" });
    const items = await listItems();
    expect(items[0]).toMatchObject({ category: "Other", quantity: 1, packed: false });
  });
});
