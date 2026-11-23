# Hiking Club Shared Packing List

## Summary
A hiking club needs a single shared packing list for one trip so members can see what to bring, who is bringing each item, and what is already packed. Members (no login; they just type a first name) add items with a category and quantity, mark them packed/unpacked, filter by category, and delete items. The outcome is one authoritative, reload-safe list everyone can view and update.

## Similar initiatives
- **P-t01 — Another POC project (tracker)** (fastapi-crud): Same "tracker" shape, but different stack (FastAPI). We reuse the conceptual CRUD-tracker pattern, not its code.
- **LP-018 — New joiner checklist** (nextjs-crud): Reuse the same packed/unpacked style toggle (checklist tick) and persistence approach via server actions + Firestore.
- **LP-006 — Team skills directory** (nextjs-crud): Reuse the single-collection list + filter pattern (filter by skill there, by category here) and the no-login "type your name" convention.

## Scope
1. **Add an item**
   - *As a club member, I want to add an item with a name, category, quantity and who brings it so the group knows what is covered.*
   - Given the add form, When I submit a name, category, quantity ≥ 1 and a "brought by" name, Then the item appears in the shared list.
   - Given I submit an empty name or a quantity below 1, When I save, Then the item is rejected with a clear inline message and is not added.

2. **View the shared packing list**
   - *As a club member, I want to see the whole shared list so I know the current state of packing.*
   - Given items exist, When I open the page, Then all items show name, category, quantity, who brings it and packed status.
   - Given no items exist, When I open the page, Then I see a friendly empty state.

3. **Mark an item packed or unpacked**
   - *As a club member, I want to toggle an item's packed status so progress is visible.*
   - Given an unpacked item, When I mark it packed, Then its status updates and persists after a reload.
   - Given a packed item, When I mark it unpacked, Then its status reverts and persists after a reload.

4. **Filter the list by category**
   - *As a club member, I want to filter by category so I can focus on one type of gear.*
   - Given a category filter is chosen, When it is applied, Then only items in that category are shown.
   - Given a filter is active, When I clear it, Then all items are shown again.

5. **Delete an item**
   - *As a club member, I want to delete an item so mistakes or no-longer-needed items go away.*
   - Given an item in the list, When I delete it, Then it no longer appears after a reload.

## Out of scope
- Logins or user accounts (members only type a first name).
- Notifications, email or SMS.
- Multiple trips or multiple lists (single shared list only).
- Editing items after they are added (add, toggle, delete only).
- Storing personal or confidential data.

## Data model
**Collection: `packingItems`**

| Field | Type | Notes |
|---|---|---|
| `id` | string | Firestore document id |
| `name` | string | Required, non-empty (trimmed) |
| `category` | string | Required; from a fixed list (e.g. Shelter, Cooking, Clothing, Food, Safety, Other) |
| `quantity` | number | Integer ≥ 1 |
| `broughtBy` | string | First name of the member bringing it; non-empty |
| `packed` | boolean | Defaults to `false` |
| `createdAt` | timestamp | Server-set on creation; used for ordering |

## Pages and endpoints
This stack uses the App Router with server actions (no custom REST endpoints beyond the template health route).

| Path | Purpose | Who uses it |
|---|---|---|
| `/` | Main page: add form, category filter, shared packing list with toggle/delete | Hiking club members |
| `addItem` (server action) | Validate and create a `packingItems` document | Invoked by add form |
| `togglePacked` (server action) | Flip an item's `packed` field | Invoked by list rows |
| `deleteItem` (server action) | Remove an item document | Invoked by list rows |
| `/api/health` (template, unchanged) | Health check | CI / ops |

## Test plan
**Automated tests (builder must add):**
- Unit test for validation helper: rejects empty/whitespace name; rejects quantity < 1 and non-integer quantity; rejects empty `broughtBy`; accepts valid input.
- Unit test for category filtering helper: returns only matching items; returns all items when filter is empty/"All".
- Unit/action test (mocked Firestore) for `addItem`: valid input creates a doc with `packed=false` and a `createdAt`; invalid input returns an error and creates nothing.
- Unit/action test (mocked Firestore) for `togglePacked` and `deleteItem`: correct field update / document removal is requested.

**Manual UAT checklist (requester on staging):**
1. POC banner is visible on the page.
2. Add an item with valid name, category, quantity and name — it appears in the list.
3. Try adding with empty name → clear rejection message; list unchanged.
4. Try adding with quantity 0 or negative → clear rejection message; list unchanged.
5. Mark an item packed, reload → still packed; mark unpacked, reload → still unpacked.
6. Choose a category filter → only that category shows; clear filter → all show.
7. Delete an item, reload → it is gone.
8. Confirm no login prompt appears anywhere.

## Risks and guardrails
- **No authentication (template rule):** Members are identified only by a typed first name in `broughtBy`; do not add any auth provider.
- **No outbound HTTP / external services (template rule):** All data stays in Firestore; no email/SMS/notifications even though a shared list might invite them.
- **POC banner must stay:** Keep the template's banner intact and visible; it satisfies the "visible POC banner" acceptance criterion.
- **Single shared list:** Use one collection with no trip/list scoping; avoid building multi-list structures.
- **Data trust:** All members share one list and can delete any item (no per-user ownership); acceptable for a POC — call this out in UAT.
- **Validation server-side:** Enforce name/quantity/broughtBy rules in the server action, not only in the browser, so bad data cannot persist.
- **Keep scope small:** No edit feature; respect the one-session (<40 min) constraint.

## Builder instructions
Implement on the `nextjs-crud` template. **Do not change** the template banner, `/api/health` endpoint, `Dockerfile`, or CI files.

1. **Data access layer** — In the template's data/lib folder, add a `packingItems.ts` module exposing: `listItems()`, `addItem(input)`, `togglePacked(id, packed)`, `deleteItem(id)`. Use the template's existing Firestore client; set `createdAt` to a server timestamp and `packed` to `false` on create. Order `listItems()` by `createdAt`.
2. **Validation helper** — Add a pure `validateItem(input)` function: trim and require `name`; require `broughtBy`; coerce `quantity` to an integer and require ≥ 1; require `category` from the fixed category list. Return typed `{ ok, errors }`. This is the unit-tested core.
3. **Server actions** — In the App Router actions file, add `addItem`, `togglePacked`, `deleteItem` as server actions that call the data layer; `addItem` runs `validateItem` first and returns field errors on failure. Call `revalidatePath('/')` after each mutation.
4. **Main page (`app/page.tsx`)** — Fetch items server-side via `listItems()`. Render (keeping the existing banner):
   - An **Add form** (name, category select, quantity number input, broughtBy) wired to `addItem`, showing inline validation messages.
   - A **category filter** control (All + fixed categories); apply filtering using the filter helper (via query param or client state).
   - The **list**, each row showing name, category, quantity, broughtBy, a packed toggle (calls `togglePacked`) and a delete button (calls `deleteItem`). Include an empty state.
5. **Styling** — Reuse the template's existing components/styles; keep it minimal and readable.
6. **Tests** — Add the automated tests listed in the Test plan under the template's test directory, mocking Firestore for the action tests.
7. **Verify** — Run the template's lint/test/build locally; confirm the POC banner and `/api/health` still work and all six acceptance criteria pass.
