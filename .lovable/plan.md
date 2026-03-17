

## Plan: 6 Adjustments

### 1. Establishment page: use GlobalHeader with logo
Replace the custom header in `Establishment.tsx` (lines 39-50) with `<GlobalHeader showBack />`. This ensures the Gramavel logo appears globally, including on establishment pages. The share/bookmark buttons can move into the page body or be kept as action buttons below the banner.

### 2. Notifications: fix close button & standardize icon colors
The Sheet component (`sheet.tsx` line 60) renders a default close button at `right-4 top-4`. Since `NotificationsSheet` uses `p-0` on `SheetContent`, the X overlaps the header area. Fix by adjusting `SheetHeader` padding to accommodate the close button, or hide default close and add a custom one inside the header.

For icon color standardization: currently notifications use mixed colors (amber, green, rose). Standardize all icon backgrounds to `bg-primary/10` and icon colors to `text-primary` (matching "Quase lá" and "Bem-vindo" style).

### 3. Profile "Cupons" stat: redirect to saved/used coupons page
Change the Cupons stat link in `Profile.tsx` from `/coupons` to `/perfil/cupons`. Create a new page `src/pages/profile/UserCoupons.tsx` with tabs for "Salvos" and "Usados", showing mock coupon data. Add route in `App.tsx`.

### 4. Custom route creation in Routes page
Add a FAB or button in `Routes.tsx` ("Criar Roteiro") that opens a sheet/dialog for creating a custom route. Include: title input, description, ability to add stops from a list of establishments. Also add this entry point from the Explore tab if the user taps the Roteiros stat badge.

### 5. Enlarge fullscreen images & show captions
In `ImageLightbox.tsx`:
- Increase image size: change `max-w-sm` to `max-w-md` (or wider) and reduce side padding from `px-12` to `px-4`
- Ensure captions (titles + captions props) are always visible when provided. Currently they render but may overlap with dots. Adjust bottom positioning to avoid overlap.
- Pass `titles` and `captions` from both `Establishment.tsx` and `Profile.tsx` when calling the lightbox.

### 6. Establishment lightbox: show reaction emojis
Add a new optional prop `reactions` to `ImageLightbox` (array of reaction data per image). In establishment page, pass the canonical reactions (❤️ ⭐ 😋 😍 📌) with counts. Render them as a horizontal row of small emoji chips inside the lightbox caption area.

### Files to create/edit
- `src/pages/Establishment.tsx` — replace header with GlobalHeader, pass titles/captions/reactions to lightbox
- `src/components/layout/NotificationsSheet.tsx` — standardize icon colors, adjust header for close button
- `src/pages/Profile.tsx` — change Cupons stat link to `/perfil/cupons`
- `src/pages/profile/UserCoupons.tsx` — new page with Salvos/Usados tabs
- `src/pages/profile/Routes.tsx` — add "Criar Roteiro" button + creation sheet
- `src/components/ui/ImageLightbox.tsx` — enlarge images, show captions better, add reactions prop
- `src/App.tsx` — add `/perfil/cupons` route

