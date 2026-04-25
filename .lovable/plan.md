## Diagnóstico de performance — gargalos encontrados

### 🔴 Críticos (bloqueiam o primeiro pixel)

1. **`src/main.tsx` faz await do Service Worker antes do `render`**  
   `setupServiceWorker()` é aguardado antes de `createRoot().render(<App/>)`. Em produção isso significa esperar `register('/sw.js')` + handshake; em preview/iframe ainda chama `unregisterAllSW()` (que itera registrations + caches). A UI só pinta depois.

2. **Contextos rodam queries Supabase no boot sem esperar autenticação**  
   `FavoritesProvider`, `ReactionsProvider`, `CouponsProvider` chamam `load()` em `useEffect([])` no mount, sem checar `user`. Cada `load()` ainda faz `supabase.auth.getUser()` (round-trip extra). Resultado: 4–6 queries paralelas competindo com o `getSession()` inicial → muitas voltam vazias por RLS (auth ainda null) e o app fica num "estado fantasma".

3. **`DEV_USER_ID` (`00000000-0000-0000-0000-000000000001`) usado como fallback em produção**  
   `src/lib/auth.ts` e `src/services/coupons.ts` retornam esse UUID quando o usuário está deslogado. Causa queries inúteis + erros 401/RLS no console + lentidão no primeiro carregamento, antes do redirect para `/auth/login`.

4. **`getPosts()` sem `.limit()`**  
   Pode trazer todos os posts da base + JOINs com `establishments` e `reactions`. Custo cresce linearmente com o tempo. Limite explícito de 30 já cobre o feed inicial.

5. **LCP do Feed sem prioridade**  
   `PostCard` recebe `isFirst` mas não passa `loading="eager"` + `fetchpriority="high"` na primeira `<img>`. Demais ficam com `loading="lazy"`.

### 🟡 Importantes

6. **`Feed.tsx loadRouteEstablishments`**: 3 queries sequenciais (`user_routes` → `user_route_stops` → `establishments`). Pode virar 1 query com JOIN ou rodar em paralelo via `Promise.all` + uma única `.in()`.

7. **GA com placeholder `G-XXXXXXXXXX`** carrega `gtag.js` que falha em produção. ~100ms + erro no console. Remover até ter ID real (ou condicionar).

8. **Service Worker pré-cacheia ícones** (`/icons/icon-192.png`, `/icons/icon-512.png`) que talvez não existam em `public/icons/`. Falha silenciosa, mas atrasa o `install`.

### 🟢 Menores

9. Reload duplo em alguns cenários do bootstrap do SW (lógica `__gramavel_sw_dev_reload_done__`).

---

## Correções propostas

### 1. `src/main.tsx` — render imediato, SW em background
- Renderizar `<App/>` **imediatamente** (síncrono, sem await).
- Mover `setupServiceWorker()` para depois, em `requestIdleCallback` (fallback `setTimeout`).
- Manter o toast "Nova versão disponível" e o `controllerchange → reload`.
- Em iframe/preview, fazer `unregisterAllSW()` em background sem bloquear.

### 2. `src/contexts/AuthContext.tsx` — expor `userId` resolvido cedo
Já está OK, mas garantir que `loading=false` só após `getSession`. Sem mudança grande.

### 3. `src/contexts/FavoritesContext.tsx` / `ReactionsContext.tsx` / `CouponsContext.tsx` — gate por `user`
- Importar `useAuth`.
- `useEffect` deve depender de `user?.id`. Se sem user, marcar `loaded=true` com listas vazias e **não chamar Supabase**.
- Passar `user.id` direto pros services para eliminar `supabase.auth.getUser()` redundante.

### 4. `src/lib/auth.ts` e `src/services/coupons.ts` — eliminar `DEV_USER_ID`
- `getCurrentUserId` deve **lançar** ou retornar `null` se sem sessão; nunca o UUID fake.
- Services devem receber `userId` obrigatório (ou não rodar quando ausente).

### 5. `src/services/posts.ts` — `.limit(30)` + `.order('created_at', desc)`
- Adicionar `.limit(30)` no `getPosts`.
- Manter signature mas opcionalmente aceitar `limit`.

### 6. `src/components/feed/PostCard.tsx` — LCP eager
- Quando `isFirst`, passar `loading="eager"` + `fetchpriority="high"` + `decoding="async"` na `<img>` principal.
- Demais: `loading="lazy"` + `decoding="async"`.

### 7. `src/pages/Feed.tsx` — paralelizar carregamento de roteiros
- Trocar 3 queries em série por: 1 query `user_routes` → 1 query única que une `user_route_stops` + `establishments` via `select` aninhado do Supabase (`user_route_stops(establishment_id, visited, establishment:establishments(id,name,slug,latitude,longitude))`).
- Adicionar `.limit()` apropriado.

### 8. `index.html` — remover GA placeholder
- Comentar/remover bloco `gtag.js` enquanto `G-XXXXXXXXXX` for placeholder. Adicionar TODO.

### 9. `public/sw.js` — pré-cache resiliente
- Manter o `Promise.all` com `.catch(()=>{})` por URL (já está). Verificar se `/icons/icon-192.png` existe; se não, remover dos `PRECACHE_URLS`.

---

## Resultado esperado

- **Primeiro paint**: queda significativa (sem await do SW + sem race de queries fantasma).
- **Feed inicial**: TTI mais rápido por `.limit(30)` + LCP image com `fetchpriority=high`.
- **Console limpo**: sem erros RLS de `DEV_USER_ID` nem GA 404.
- **Navegação entre páginas**: continua usando os mesmos providers sem refetch redundante.

## Arquivos a modificar

- `src/main.tsx`
- `src/contexts/FavoritesContext.tsx`
- `src/contexts/ReactionsContext.tsx`
- `src/contexts/CouponsContext.tsx`
- `src/lib/auth.ts`
- `src/services/coupons.ts`
- `src/services/posts.ts`
- `src/components/feed/PostCard.tsx`
- `src/pages/Feed.tsx`
- `index.html`
- `public/sw.js` (verificar lista de pré-cache)
