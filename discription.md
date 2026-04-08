# Discription of the Brand UI Code

This file explains the finalized code for the brand listing feature. It describes what each file does and why important lines are used. The goal is for a beginner to understand how the feature works.

---

## 1. `frontend/types/brand.ts`

This file defines the shape of a `Brand` object. TypeScript uses this to check code correctness.

- `export type Brand = { ... }`: creates a reusable type called `Brand`.
- `id: string`: every brand needs an ID to identify it.
- `name: string`: the display name of the brand.
- `category: string`: the brand category, like electronics or accessories.
- `modelCount: number`: how many models the brand has.
- `image: string`: the URL of the brand logo or photo.
- `description: string`: a short text describing the brand.

Why this file is needed:
- It makes sure all brand objects have the same fields.
- It prevents mistakes like using `brand.name` when the object has a different shape.

---

## 2. `frontend/types/model.ts`

This file defines the shape of a `Model` object.

- `export type ModelStatus = "Shipped" | "Pending";`
  - This means `status` can only be `"Shipped"` or `"Pending"`.
  - It prevents invalid values like `"Done"` or `"InProgress"`.
- `export type Model = { ... }`: creates a reusable type called `Model`.
- `brandId: string`: connects the model to a specific brand.
- `code: string`: a model identifier shown in the UI.
- `name: string`: the model name.
- `category: string`: the model category.
- `image: string`: the model image URL.
- `daysToHandover: number`: how many days remain until delivery.
- `status: ModelStatus`: whether the model is shipped or pending.

Why this file is needed:
- It makes model data consistent.
- It helps the browser and editor catch mistakes when accessing model fields.

---

## 3. `frontend/src/lib/mock-data.ts`

This file stores sample data for brands and models.

Why it exists:
- It lets the UI render without a backend server.
- It gives real-looking data to test the interface.

Key parts:
- `export const brands: Brand[] = [...]`
  - The array contains several sample brand objects.
  - Each object uses the `Brand` type defined above.
- `export const models: Model[] = [...]`
  - The array contains sample model objects.
  - Each model has `brandId` to link it to a brand.

Example field explanations:
- `brandId: "tera"`: connects the model to the brand whose `id` is `tera`.
- `status: "Shipped"`: tells the UI whether the model is complete.
- `daysToHandover: 4`: shows the remaining time until delivery.

---

## 4. `frontend/src/brands/page.tsx`

This file renders the main brand listing page.

### Top section

```tsx
"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrandCard } from "@/components/cards/BrandCard";
import { brands } from "@/lib/mock-data";
```

- `"use client";`: tells Next.js this component runs in the browser.
- `useState`: creates state for the search input.
- `useMemo`: caches filtered results so the page updates efficiently.
- `motion`: provides animation behavior from Framer Motion.
- `BrandCard`: renders each brand as a card.
- `brands`: the sample brand list.

### Search state and filtering

```tsx
const [query, setQuery] = useState("");
const filteredBrands = useMemo(
  () => brands.filter((brand) =>
    [brand.name, brand.category, brand.description]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  ),
  [query],
);
```

- `query`: stores the current search text.
- `setQuery`: updates `query` when the user types.
- `filteredBrands`: filters the brand list using the search text.
- `.join(" ")`: combines name, category, and description into one string.
- `.toLowerCase()`: makes the search case-insensitive.
- `.includes(...)`: checks if the search text is in the brand data.

### Page structure

- `<main>`: the top-level page container.
- `<section>`: groups the page content.
- The first card area shows the page title, description, and buttons.
- The search input area lets the user filter brands.
- The summary cards show total brands, visible brands, and whether search is active.

### Brand grid

```tsx
<motion.div
  initial="hidden"
  animate="show"
  variants={listVariants}
  className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
>
  {filteredBrands.map((brand) => (
    <BrandCard key={brand.id} brand={brand} />
  ))}
</motion.div>
```

- `initial="hidden"` and `animate="show"`: animate the cards when they appear.
- `variants={listVariants}`: defines how children should stagger their animation.
- `filteredBrands.map(...)`: renders one `BrandCard` for each visible brand.

Why this file is needed:
- This is the main page users see when browsing brands.
- It connects search, brand data, and display cards.

---

## 5. `frontend/src/brands/[id]/page.tsx`

This file renders the detail page for one brand and shows its models.

### Page setup

```tsx
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ModelCard } from "@/components/cards/ModelCard";
import { brands, models } from "@/lib/mock-data";
```

- `useParams()`: reads the dynamic route parameter from the URL.
- `brandId`: the ID from the URL path, such as `/brands/tera`.
- `BrandModelsPage`: the page component for model listings.

### Brand lookup and filtering

```tsx
const brand = brands.find((item) => item.id === brandId);
const brandModels = useMemo(
  () => models
    .filter((model) => model.brandId === brandId)
    .filter((model) =>
      [model.code, model.name, model.category]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
    ),
  [brandId, query],
);
```

- `brands.find(...)`: selects the brand that matches the URL.
- `brandModels`: starts with all models for that brand.
- The second `.filter(...)`: applies the search text to the model list.
- This makes search work only for models belonging to the chosen brand.

### Model list rendering

```tsx
{brandModels.length > 0 ? (
  brandModels.map((model) => <ModelCard key={model.id} model={model} />)
) : (
  <div className="...">No models match your search criteria.</div>
)}
```

- If there are models, it shows a `ModelCard` for each.
- If none match, it shows a friendly message.

Why this file is needed:
- It shows details for a single brand.
- It connects brand pages with the model cards.
- It supports searching models inside that brand.

---

## 6. `frontend/components/cards/BrandCard.tsx`

This component renders one brand card.

### How it works

```tsx
export function BrandCard({ brand, isSelected = false }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.id}`}>
      <motion.div ...>
        <div className="...">
          <p className="...">{brand.category}</p>
          <div className="...">
            <img src={brand.image} alt={brand.name} className="..." />
          </div>
          <button className="...">✎</button>
        </div>
      </motion.div>
    </Link>
  );
}
```

- `Link`: makes the whole card clickable and routes to `/brands/{brand.id}`.
- `motion.div`: adds animation to each card.
- `isSelected`: changes the style if a card is selected.
- The card displays the brand category and image.

Why this file is needed:
- It separates the brand card layout from the page.
- It makes the page code cleaner and reusable.

---

## 7. `frontend/components/cards/ModelCard.tsx`

This component renders one model card.

### Main logic

```tsx
const statusColor = model.status === "Shipped" ? "text-[var(--accent)]" : "text-amber-300";
const badgeColor = model.status === "Shipped" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-amber-500/15 text-amber-300";
const delayed = model.status === "Pending" && model.daysToHandover > 10;
```

- These variables choose colors based on `model.status`.
- `delayed`: checks if a pending model has more than 10 days left.

### Card content

- Top image area shows the model photo.
- A small badge shows the model status on top.
- The card shows:
  - model code
  - model name
  - category
  - handover days
  - shipped/pending status
- If the model is delayed, it shows a warning box.

Why this file is needed:
- It makes each model display consistently.
- It keeps the model page clean by moving card layout out.

---

## Why this is a good structure

- The types files keep data consistent and safe.
- The mock data file allows the UI to work without a backend.
- The page files contain screen logic and layout.
- The card components contain reusable visual pieces.
- The code is split into small, understandable files.

If you want, I can also add a second file with a shorter summary for the team leader.
