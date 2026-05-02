## Análise da página Feed (admin) hoje

A página atual mostra apenas:
- 4 KPIs fixos em janela de 7 dias (Impressões, Cliques, CTR, Reações)
- Gráfico de impressões diárias
- Duas tabelas (boa/baixa performance) que mostram só o ID do post truncado, sem nome do estabelecimento, sem reações, sem imagem, sem link clicável

**Limitações principais:**
1. Sem seletor de período — sempre 7 dias fixos
2. Tabelas mostram `postId.slice(0,8)` — admin não consegue identificar qual post é
3. Sem comparação com período anterior (não há contexto se "1.200 impressões" é bom ou ruim)
4. CTR é o único critério de performance — ignora reações, salvamentos e check-ins gerados
5. Reações mostradas como número total, sem quebra por emoji (qual é a emoção dominante?)
6. Sem ranking de estabelecimentos (apenas posts isolados)
7. Sem visão de horários/dias da semana com mais engajamento
8. Sem funil (impressão → clique → ação no estabelecimento)
9. Sem distinção entre posts originados de fotos do estabelecimento vs. posts manuais
10. Categorias mais engajadas — invisíveis hoje

---

## O que vou construir

### 1. Filtro de período (topo da página)
Toggle com 4 opções: **7 dias / 30 dias / 90 dias / Todo período**. Todos os blocos abaixo recalculam.

### 2. KPIs com comparativo (6 cards em vez de 4)
Cada card mostra valor atual + variação % vs. período anterior equivalente (seta verde/vermelha).
- Impressões
- Cliques únicos (distintos por user_id)
- CTR
- Reações totais
- **Salvamentos** (de `user_saved_posts` no período)
- **Posts ativos** (posts com pelo menos 1 impressão no período)

### 3. Gráfico comparativo (substitui o gráfico atual)
Mesmo `LineChart`, mas com **duas linhas**: Impressões e Cliques no mesmo eixo, permitindo ver visualmente o gap (CTR ao longo do tempo). Tooltip mostra ambos.

### 4. Novo card: Engajamento por dia da semana
`BarChart` agregando eventos por dia da semana (Seg–Dom). Responde: "qual dia o público mais interage?".

### 5. Novo card: Distribuição de reações
Mini lista horizontal com cada emoji canônico (`CANONICAL_REACTIONS`) + contagem + barra de proporção. Mostra qual emoção predomina no feed.

### 6. Top 10 posts (substitui as duas tabelas atuais)
Uma única tabela ordenável (default por impressões desc) com:
- **Thumbnail** (imagem do post, 40x40 rounded)
- **Estabelecimento** (nome + categoria) — link para `/admin/estabelecimentos/:id`
- Impressões
- Cliques
- CTR (badge colorido: verde ≥5%, amarelo 2–5%, vermelho <2%)
- Reações
- Coluna ações: ícone "ver no app" abrindo `/estabelecimento/:slug` em nova aba

### 7. Top 5 estabelecimentos no feed
Card lateral/inferior agregando performance por estabelecimento (soma de impressões/cliques de todos os posts dele). Identifica quais parceiros estão dominando o feed.

### 8. Categorias mais engajadas
`BarChart` horizontal: categoria → CTR médio. Ajuda a entender qual tipo de conteúdo converte melhor.

### 9. Card de alertas/insights
Bloco textual gerado dinamicamente com até 3 insights, ex.:
- "Posts com fotos verticais (4:5) têm CTR X% maior" (se conseguirmos derivar)
- "3 estabelecimentos não tiveram nenhuma impressão nos últimos 30 dias"
- "Quinta-feira é o dia de maior engajamento"

---

## Mudanças técnicas

**`src/admin/services/adminAnalytics.ts`** — adicionar funções:
- `getFeedKPIs(days)` — incluir `uniqueClicks`, `savedCount`, `activePosts`, e retornar também os valores do período anterior para cálculo de delta
- `getClicksByDay(days)` — espelho de `getImpressionsByDay` para a segunda linha do gráfico
- `getEngagementByWeekday(days)` — agrega `feed_events` por `EXTRACT(DOW)`
- `getReactionsBreakdown(days)` — agrupa `user_reactions.emoji` no período
- `getPostsPerformance(days)` — enriquecer com join em `posts(image, caption, establishment:establishments(name, slug, category))` e adicionar contagem de reações por post
- `getTopEstablishmentsInFeed(days)` — soma de impressions/clicks por `establishment_id`
- `getCategoriesPerformance(days)` — CTR médio agrupado por categoria do estabelecimento
- `getFeedInsights(days)` — função que monta os 2-3 insights textuais

**`src/admin/pages/Feed.tsx`** — reescrever:
- Adicionar `useState` para `period` (7/30/90/all) e refetch quando mudar
- Substituir grid de 4 KPIs por 6 com componente `StatCard` estendido (ou wrapper local) para mostrar delta
- Substituir tabelas atuais pela nova tabela única de Top Posts com thumbnail e nome
- Adicionar os novos cards (weekday, reactions breakdown, top estabelecimentos, categorias, insights)

**Layout proposto (desktop, segue regra `min-w-[1024px]` do admin):**
```text
[ Filtro de período ]
[ KPI ][ KPI ][ KPI ][ KPI ][ KPI ][ KPI ]
[ Gráfico Impressões vs Cliques (col-span-2) ][ Insights ]
[ Engajamento por dia da semana ][ Distribuição de reações ]
[ Top 10 Posts (tabela completa, full width) ]
[ Top estabelecimentos ][ Categorias mais engajadas ]
```

**Sem alterações em:** schema do banco, componentes do app mobile, outras páginas do admin.
