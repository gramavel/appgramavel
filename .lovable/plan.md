

## Plan: 6 Adjustments

### 1. Reduce logo size slightly in GlobalHeader
Change `h-5` to `h-[18px]` on the logo `<img>` in `GlobalHeader.tsx`. The logo is already shown globally via this component.

### 2. Fix reaction emojis in PostCard chip to match defined set
The mock data in `mock.ts` uses emojis like `🔥`, `👏`, `✨` which don't match the defined set (❤️, ⭐, 😋, 😍, 📌). Fix the `MOCK_POSTS` reactions array to only use the 5 canonical emojis. Also update `displayReactions` in `PostCard.tsx` to always show the first 3 of the canonical set.

### 3. Create Notifications panel
Add a notifications sheet/drawer that opens when clicking the bell icon in `GlobalHeader.tsx`:
- Create `src/components/layout/NotificationsSheet.tsx` using the existing `Sheet` component
- Mock notification data (coupon alerts, badge progress, new places nearby, etc.)
- Each notification: icon, title, description, timestamp, read/unread state
- Style consistent with design system (card borders, muted-foreground text, primary accents)
- Wire the bell button in `GlobalHeader` to toggle the sheet

### 4. Add ImageLightbox to Establishment page images
In `Establishment.tsx`:
- Add lightbox state and wire clicks on the banner image and the post grid images to open `ImageLightbox` with `aspect-[4/5]` maintained via CSS on the lightbox image
- Update `ImageLightbox.tsx` to accept an optional `aspectRatio` prop, applying `aspect-[4/5]` + `object-cover` instead of `max-h-[80vh] object-contain` when set

Profile page already has lightbox on memories. Ensure profile memory images also use 4:5 aspect ratio in lightbox.

### 5. Clean up Profile page buttons
In `Profile.tsx`:
- Remove the "Sair" button next to "Editar perfil"
- Center the "Editar perfil" button (remove `flex items-center gap-2`, use `flex justify-center`)
- Remove "Configurações" from the quick links list at the bottom (keep only "Lugares Salvos" and "Roteiros Salvos")

### 6. Make profile sub-pages more dynamic (SavedPlaces, Routes, Badges)

**SavedPlaces.tsx**: Add empty state illustration, animated entrance (stagger), swipe-to-remove hint, and a search/filter bar at top.

**Routes.tsx (RoutesPage)**: Expand each route card to show a cover image, duration/difficulty badges, and a horizontal scroll of stop thumbnails. Add animated entrance.

**Badges.tsx**: Add animated progress rings instead of flat progress bars for in-progress badges. Add a celebratory shimmer effect on earned badges. Show earned date.

### Files to create/edit
- `src/components/layout/GlobalHeader.tsx` — logo size, bell click handler
- `src/components/layout/NotificationsSheet.tsx` — new file
- `src/data/mock.ts` — fix reactions emojis, add notifications mock data
- `src/components/feed/PostCard.tsx` — fix displayReactions to use canonical emojis
- `src/pages/Establishment.tsx` — add ImageLightbox
- `src/components/ui/ImageLightbox.tsx` — add aspectRatio prop
- `src/pages/Profile.tsx` — remove Sair button, remove Configurações link, center edit button
- `src/pages/profile/SavedPlaces.tsx` — richer layout
- `src/pages/profile/Routes.tsx` — expanded cards with images and stops
- `src/pages/profile/Badges.tsx` — animated progress, richer visuals

