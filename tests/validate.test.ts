import { describe, expect, it } from "vitest";
import { validateItem, filterByCategory } from "../lib/validate";

describe("validateItem", () => {
  it("accepts valid input", () => {
    const r = validateItem({ name: " Tent ", category: "Shelter", quantity: 2, broughtBy: "Ada" });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ name: "Tent", category: "Shelter", quantity: 2, broughtBy: "Ada" });
  });

  it("rejects empty or whitespace name", () => {
    expect(validateItem({ name: "   ", category: "Food", quantity: 1, broughtBy: "Ada" }).ok).toBe(false);
    expect(validateItem({ name: "", category: "Food", quantity: 1, broughtBy: "Ada" }).ok).toBe(false);
  });

  it("rejects quantity below 1 and non-integer quantity", () => {
    expect(validateItem({ name: "Tent", category: "Shelter", quantity: 0, broughtBy: "Ada" }).ok).toBe(false);
    expect(validateItem({ name: "Tent", category: "Shelter", quantity: -3, broughtBy: "Ada" }).ok).toBe(false);
    expect(validateItem({ name: "Tent", category: "Shelter", quantity: 1.5, broughtBy: "Ada" }).ok).toBe(false);
    expect(validateItem({ name: "Tent", category: "Shelter", quantity: "abc", broughtBy: "Ada" }).ok).toBe(false);
  });

  it("coerces numeric string quantity to an integer", () => {
    const r = validateItem({ name: "Tent", category: "Shelter", quantity: "3", broughtBy: "Ada" });
    expect(r.ok).toBe(true);
    expect(r.value?.quantity).toBe(3);
  });

  it("rejects empty broughtBy", () => {
    expect(validateItem({ name: "Tent", category: "Shelter", quantity: 1, broughtBy: " " }).ok).toBe(false);
  });

  it("rejects category not in the fixed list", () => {
    expect(validateItem({ name: "Tent", category: "Weapons", quantity: 1, broughtBy: "Ada" }).ok).toBe(false);
    expect(validateItem({ name: "Tent", category: "", quantity: 1, broughtBy: "Ada" }).ok).toBe(false);
  });

  it("returns field errors for all invalid fields", () => {
    const r = validateItem({ name: "", category: "Nope", quantity: 0, broughtBy: "" });
    expect(r.ok).toBe(false);
    expect(Object.keys(r.errors).sort()).toEqual(["broughtBy", "category", "name", "quantity"]);
  });
});

describe("filterByCategory", () => {
  const items = [
    { category: "Shelter", name: "Tent" },
    { category: "Food", name: "Trail mix" },
    { category: "Shelter", name: "Tarp" },
  ];

  it("returns only matching items", () => {
    expect(filterByCategory(items, "Shelter").map((i) => i.name)).toEqual(["Tent", "Tarp"]);
  });

  it("returns all items when filter is empty or All", () => {
    expect(filterByCategory(items, "")).toHaveLength(3);
    expect(filterByCategory(items, "All")).toHaveLength(3);
    expect(filterByCategory(items, undefined)).toHaveLength(3);
    expect(filterByCategory(items, null)).toHaveLength(3);
  });

  it("ignores unknown categories", () => {
    expect(filterByCategory(items, "Bogus")).toHaveLength(3);
  });
});