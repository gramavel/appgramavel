

## Plan: 7 Adjustments

### 1. Lightbox: add breathing room for reactions, raise image
In `ImageLightbox.tsx`:
- Move the caption+reactions card from `bottom-12` to `bottom-16` to create space above the bottom nav/dots
- Move dots from `bottom-4` to `bottom-6`
- Adjust the image container: reduce `flex-1` padding or shift the image area up slightly by adding `mb-auto` logic so the image sits higher in the viewport

### 2. Establishment: move Share/Bookmark buttons next to rating pill
In `Establishment.tsx`:
- Remove the Share2 and Bookmark buttons from the banner overlay (lines 63-70)
- Add them as small icon buttons next to the rating pill row (line 81), making them `w-8 h-8 rounded-full bg-secondary` style chips sitting to the right of the rating pill, in a single `flex items-center justify-center gap-2` row

### 3. Establishment details: two-column hours layout
In the Details Dialog of `Establishment.tsx`:
- Replace the single `opening_hours` text (line 177) with a two-column grid showing each day of the week with hours
- Use a `grid grid-cols-2` layout: left column = day name (text-sm font-medium), right column = hours or a red "Fechado" badge
- Mock data: Mon-Sat with hours derived from `est.opening_hours`, Sunday = "Fechado" with a red badge styled like the "Aberto" badge

### 4. Explore: category pages with banner
In `Explore.tsx`, when a category is selected from the grid (not filter chips):
- Add a `selectedCategory` state separate from `activeFilter`
- When a category grid button is clicked, set `selectedCategory` and show a dedicated view: banner image at top (category-specific unsplash image), category title overlay, then filtered establishments below (max 10)
- Add a back button to return to the main explore view
- Filter chips continue to work as they do now (showing results inline with map toggle)

### 5. Explore: keep category filter chips showing max 10 results with map link
The current filter chip behavior already filters and shows results. Ensure:
- When clicking a category from the grid, limit to 10 results via `.slice(0, 10)`
- The "Ver mapa" button remains visible to toggle back

### 6. Explore: add "Recomendados" section after "Populares agora"
In `Explore.tsx`:
- Add a `RECOMMENDED_PLACES` array (similar to `POPULAR_PLACES`) with different places
- Render a new section "Recomendados" with the same horizontal scroll card design as "Populares agora", placed right after it

### 7. Profile: replace quick links with more memory photos
In `Profile.tsx`:
- Remove the "Quick links" section (lines 137-151) with "Lugares Salvos" and "Roteiros Salvos" buttons
- Add 6 more images to the `MEMORIES` array (total 12), so the grid shows 4 rows of 3 photos instead of 2 rows

### Files to edit
- `src/components/ui/ImageLightbox.tsx` — spacing adjustments
- `src/pages/Establishment.tsx` — move share/bookmark, two-column hours
- `src/pages/Explore.tsx` — category pages with banner, Recomendados section
- `src/pages/Profile.tsx` — remove quick links, add more memory photos

