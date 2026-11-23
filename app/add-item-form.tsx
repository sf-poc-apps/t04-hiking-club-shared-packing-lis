"use client";

import { useActionState } from "react";
import { addItem, type ActionState } from "./actions";

const initial: ActionState = { errors: {} };
const CATEGORIES = ["Shelter", "Cooking", "Clothing", "Food", "Safety", "Other"];

export default function AddItemForm() {
  const [state, action, pending] = useActionState(addItem, initial);
  return (
    <form action={action} className="card">
      <label>
        Item
        <input name="name" maxLength={200} placeholder="e.g. Tent" />
      </label>
      {state.errors.name && <p className="error">{state.errors.name}</p>}
      <label>
        Category
        <select name="category" defaultValue="">
          <option value="" disabled>
            Choose a category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      {state.errors.category && <p className="error">{state.errors.category}</p>}
      <label>
        Quantity
        <input name="quantity" type="number" min={1} step={1} placeholder="1" />
      </label>
      {state.errors.quantity && <p className="error">{state.errors.quantity}</p>}
      <label>
        Brought by
        <input name="broughtBy" maxLength={100} placeholder="First name" />
      </label>
      {state.errors.broughtBy && <p className="error">{state.errors.broughtBy}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add item"}
      </button>
    </form>
  );
}