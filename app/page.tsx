import AddItemForm from "./add-item-form";
import { deleteItem, togglePacked } from "./actions";
import { listItems, ALL_CATEGORIES } from "@/lib/packingItems";
import { filterByCategory } from "@/lib/validate";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const items = filterByCategory(await listItems(), category ?? "");
  const packedCount = items.filter((i) => i.packed).length;

  return (
    <>
      <h1>Hiking Club Shared Packing List</h1>
      <AddItemForm />

      <form className="card filter">
        <label>
          Filter by category
          <select name="category" defaultValue={category ?? "All"}>
            <option value="All">All</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Apply</button>
      </form>

      {items.length === 0 ? (
        <p className="muted">Nothing on the list yet. Add the first item above!</p>
      ) : (
        <p className="muted">
          {packedCount} of {items.length} packed
        </p>
      )}

      <ul className="list">
        {items.map((item) => (
          <li key={item.id} className={item.packed ? "packed" : ""}>
            <form action={togglePacked} className="inline">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="packed" value={String(item.packed)} />
              <button type="submit" title={item.packed ? "Mark unpacked" : "Mark packed"}>
                {item.packed ? "✅" : "⬜"}
              </button>
            </form>
            <div>
              <strong>{item.name}</strong>{" "}
              <span className="muted">
                {item.category} · qty {item.quantity} · brought by {item.broughtBy}
              </span>
            </div>
            <form action={deleteItem} className="inline">
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="danger">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}