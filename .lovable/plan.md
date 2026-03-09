

## Alterações baseadas nos prints do Design System

### 1. CategoryBar — Adicionar chip "Todos"
O print mostra "Todos" como primeiro chip (ativo = primary). Atualmente só lista as categorias sem opção "Todos".
- Adicionar botão "Todos" antes do map de categorias
- Quando `selected === null`, "Todos" fica ativo

### 2. PostCard — Rating com contagem
O print mostra `★ 4.8 (324)` com o número de avaliações entre parênteses. Atualmente só mostra `★ 4.8`.
- Adicionar campo `total_reviews` ao tipo `Post` e aos mock data
- Exibir `(N)` ao lado do rating

### 3. PostCard — Reações simplificadas
O print mostra emojis sem pills individuais: `❤️ 🔥 😊 +248` seguido de avatares. O formato atual usa bg-secondary rounded-full por reação.
- Remover pills individuais
- Mostrar até 3 emojis inline + total consolidado `+N`
- Manter avatares à direita

### 4. CouponCard — Texto do botão por status
O print mostra textos distintos: "Ativar Cupom" (ativo), "Cupom Usado" (usado), "Cupom Expirado" (expirado). Atualmente o texto é sempre "Ativar Cupom".
- Mapear texto do botão por status no objeto `STATUS_BADGE` ou similar

### 5. ProximityCheckinCard — Novo componente
O print mostra um card flutuante: ícone MapPin + "Você está perto!" + nome do local + distância + botão "Check-in" primary.
- Criar `src/components/feed/ProximityCheckinCard.tsx`
- Card com `shadow-2xl rounded-2xl`, posição flutuante (fixed bottom acima do BottomNav)
- Exibir quando houver estabelecimento a < 300m (mock por enquanto)

### Arquivos afetados
- `src/components/layout/CategoryBar.tsx`
- `src/components/feed/PostCard.tsx`
- `src/components/coupons/CouponCard.tsx`
- `src/data/mock.ts` (adicionar `total_reviews` nos posts)
- `src/components/feed/ProximityCheckinCard.tsx` (novo)
- `src/pages/Feed.tsx` (incluir ProximityCheckinCard)

