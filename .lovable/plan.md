

## Auditoria completa de UI/UX — Gramável Design System

Auditoria realizada em 17 arquivos. Abaixo, todas as inconsistencias encontradas e as correções a aplicar.

---

### 1. index.css — Adicionar utilitário global `animate-fade-in-up`

Adicionar keyframe `fadeInUp` e classe `.animate-fade-in-up` no `@layer utilities`. Isso permite remover todos os blocos `<style>` inline duplicados em 7 arquivos.

---

### 2. Remoção de `<style>` inline em 7 arquivos

Remover blocos `<style>{...fadeInUp...}</style>` e substituir por `className="animate-fade-in-up"` com `style={{ animationDelay }}` apenas para delays:

- `Profile.tsx` (L235-240)
- `Roteiros.tsx` (L351-356, L453-458, L201-206 scaleIn)
- `SavedPlaces.tsx` (L78-83)
- `Routes.tsx` (L196-201)
- `UserCoupons.tsx` (L83-88)
- `Badges.tsx` (L127-143) — fadeInScale e fadeInUp e shimmer. Mover fadeInScale e shimmer para index.css também.

---

### 3. Border Radius — Sistema de 3 níveis

**Cards → `rounded-xl`** (atualmente `rounded-lg`):
- `PostCard.tsx` L33: `rounded-lg` → `rounded-xl`
- `CouponCard.tsx` L22: Card component (usa default `rounded-lg` do Card) → adicionar `className` com `rounded-xl`
- `SavedPlaces.tsx` L47: `rounded-lg` → `rounded-xl`
- `UserCoupons.tsx` L14: `rounded-lg` → `rounded-xl`
- `Explore.tsx` L253, L278, L304: category grid e carousel cards `rounded-lg` → `rounded-xl`
- `Explore.tsx` L164, L345: list cards (Card component) → adicionar `rounded-xl`
- `Profile.tsx` L109: stats card `rounded-lg` → `rounded-xl`
- `Profile.tsx` L136: badge chips `rounded-lg` → `rounded-xl`
- `Profile.tsx` L168: timeline items `rounded-lg` → `rounded-xl`
- `ProximityCheckinCard.tsx` L13: `rounded-lg` → `rounded-xl`
- `NotificationsSheet.tsx`: items já não têm border-radius explícito (ok)
- `Settings.tsx` L51: notification card `rounded-lg` → `rounded-xl`
- `Routes.tsx` L53: RouteCard `rounded-lg` → `rounded-xl`

**Buttons → `rounded-full`** (remover `rounded-md`):
- `Auth.tsx` L58, L67: `rounded-md` → `rounded-full`
- `Settings.tsx` L63: `rounded-md` → `rounded-full`
- `Settings.tsx` L85, L86: AlertDialog buttons `rounded-md` → `rounded-full`
- `Establishment.tsx` L160: "Deixar avaliação" `rounded-md` → `rounded-full`
- `Establishment.tsx` L229, L232: Ligar/WhatsApp `rounded-md` → `rounded-full`
- `CouponCard.tsx` L51: "Ativar Cupom" `rounded-md` → `rounded-full`

**Modais/Dialogs → `rounded-2xl`**:
- `CouponCard.tsx` L62: DialogContent → adicionar `rounded-2xl`
- `Settings.tsx` L77: AlertDialogContent → adicionar `rounded-2xl`
- Roteiros.tsx L332: AlertDialogContent já tem `rounded-2xl` (ok)

**Photos grid → `rounded-lg`** (ok, é "pequeno"):
- `Establishment.tsx` L143: `rounded-md` → `rounded-lg`

**Card base component** (`src/components/ui/card.tsx`):
- L6: `rounded-lg` → `rounded-xl` para default, e `shadow-sm` → `shadow-card`

---

### 4. Sombras — Sistema unificado

**Remover `shadow-sm` e `shadow-md` de cards/componentes de app** (manter em shadcn internos):
- `card.tsx` L6: `shadow-sm` → `shadow-card`
- `ExploreMap.tsx` L192: `shadow-sm` → `shadow-card`
- `Roteiros.tsx` L522, L559: `shadow-sm hover:shadow-md` → `shadow-card hover:shadow-card-hover`
- `FilterChips.tsx` L18: `shadow-md` → remover (active chip não precisa shadow)
- `GlobalHeader.tsx` L22: `shadow-sm` → remover (header usa border-b, shadow desnecessário)

**Manter `shadow-md` em**: popover, dropdown, tooltip, select (shadcn internos — ok), FAB (ok usa `shadow-lg`), ExploreMap locate button (ok).

---

### 5. Tipografia — Hierarquia consistente

**Section labels → `text-[11px] font-bold tracking-widest uppercase`**:
- `Explore.tsx` L247: `text-lg font-semibold` → `text-base font-semibold tracking-tight` (é título de seção, não label)
- `Explore.tsx` L274, L300, L326, L342: `text-lg font-semibold` → `text-base font-semibold tracking-tight`
- `Profile.tsx` L129, L152, L197: já usa `text-xs font-bold tracking-widest uppercase` (ok)

**Badges section labels** em `Badges.tsx` L61, L94: `text-xs font-semibold` → `text-[11px] font-bold tracking-widest uppercase` para consistência com Profile.

---

### 6. Espaçamento — Card padding `p-4`

- `Roteiros.tsx` L522, L559: route list items `p-3` → `p-4`
- `Roteiros.tsx` L285: next stop preview `p-3` → `p-4`
- `Roteiros.tsx` L407: timeline stop items `p-3` → `p-4`
- `Roteiros.tsx` L718: establishment selection items `p-2.5` → `p-4` (ou manter menor para lista densa — aceitar `p-3` mínimo)

---

### 7. Empty States — Padrão unificado

Padronizar com icon `w-12 h-12` em circle `w-16 h-16 rounded-full bg-secondary`, título `text-sm font-semibold`, descrição `text-xs text-muted-foreground`:

- `Explore.tsx` L155, L187: texto simples → padrão com ícone
- `Coupons.tsx` L27: texto simples → padrão com ícone Ticket
- `Feed.tsx` L28: texto simples → padrão com ícone
- `Roteiros.tsx` L538: texto simples → padrão com ícone (Meus roteiros já tem o padrão correto L597-608, só o sugeridos vazio precisa)
- `UserCoupons.tsx` L61, L72: já tem ícone mas falta circle bg-secondary wrapper e título semibold
- `Routes.tsx` L156, L175: idem
- `SavedPlaces.tsx` L39: idem — já tem ícone, falta wrapper

---

### 8. Sheets — Padrão unificado

- `SaveSheet.tsx` L33: já `rounded-t-2xl` (ok)
- `Establishment.tsx` L188: já `rounded-t-2xl` (ok)
- `Roteiros.tsx` L625: já `rounded-t-2xl` (ok)
- `NotificationsSheet.tsx` L67: é side="right", não bottom — ok sem rounded-t

---

### 9. Animações — Centralizar no index.css

Adicionar ao `index.css`:
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out both;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in-scale {
  animation: fadeInScale 0.5s ease-out both;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in {
  animation: scaleIn 0.5s ease-out both;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.animate-shimmer {
  animation: shimmer 3s infinite;
}
```

---

### Resumo de arquivos a editar (14 arquivos)

| Arquivo | Mudanças |
|---------|----------|
| `src/index.css` | Adicionar 4 keyframes + classes utilitárias |
| `src/components/ui/card.tsx` | `rounded-lg` → `rounded-xl`, `shadow-sm` → `shadow-card` |
| `src/components/ui/FilterChips.tsx` | Remover `shadow-md` do active chip |
| `src/components/layout/GlobalHeader.tsx` | Remover `shadow-sm` |
| `src/components/feed/PostCard.tsx` | `rounded-lg` → `rounded-xl` |
| `src/components/feed/ProximityCheckinCard.tsx` | `rounded-lg` → `rounded-xl` |
| `src/components/coupons/CouponCard.tsx` | `rounded-xl`, button `rounded-full`, dialog `rounded-2xl` |
| `src/components/SaveSheet.tsx` | Card items `rounded-lg` → `rounded-xl` |
| `src/pages/Auth.tsx` | Buttons `rounded-full` |
| `src/pages/Explore.tsx` | Cards `rounded-xl`, section titles `text-base`, empty states padronizados |
| `src/pages/Establishment.tsx` | Buttons `rounded-full`, photo grid `rounded-lg`, review cards `rounded-xl` |
| `src/pages/Roteiros.tsx` | Shadows → `shadow-card`, padding `p-4`, remover `<style>` inline |
| `src/pages/Profile.tsx` | Cards `rounded-xl`, remover `<style>` inline |
| `src/pages/Feed.tsx` | Empty state padronizado |
| `src/pages/Coupons.tsx` | Empty state padronizado |
| `src/pages/profile/SavedPlaces.tsx` | Cards `rounded-xl`, empty state, remover `<style>` |
| `src/pages/profile/Settings.tsx` | Buttons `rounded-full`, card `rounded-xl`, dialog `rounded-2xl` |
| `src/pages/profile/Routes.tsx` | Card `rounded-xl`, empty states, remover `<style>` |
| `src/pages/profile/UserCoupons.tsx` | Cards `rounded-xl`, empty states, remover `<style>` |
| `src/pages/profile/Badges.tsx` | Section labels, card radius `rounded-xl`, remover `<style>` |
| `src/components/map/ExploreMap.tsx` | `shadow-sm` → `shadow-card` |

Nenhuma mudança em lógica, dados mock, rotas ou Supabase — apenas classes Tailwind.

