## Refatorar página "Meus Roteiros" (perfil)

Remover a divisão em duas tabs ("Em andamento" / "Concluídos") e apresentar uma única lista unificada, mais limpa, onde os roteiros concluídos são identificados apenas por um check discreto.

### O que muda visualmente

**Antes:** 2 tabs no topo + cards grandes (imagem 2.5:1 com gradiente, badge colorido "Em andamento"/"Concluído", barra de progresso, miniaturas das paradas, data).

**Depois:** Lista única, vertical, com cards horizontais compactos e clean — estilo das outras sub-páginas do perfil (Lugares Salvos, Badges).

### Estrutura do novo card (horizontal, ~80–88px de altura)

```text
┌─────────────────────────────────────────────────┐
│ [thumb 64x64]  Título do Roteiro          ✓     │
│   rounded-xl   3 paradas · 2h            ────►  │
│                ▓▓▓▓▓▓▓░░░  60%                  │
└─────────────────────────────────────────────────┘
```

- **Thumbnail:** 64×64, `rounded-xl`, imagem da capa do roteiro.
- **Título:** `font-semibold text-sm` truncado em 1 linha.
- **Subtítulo:** `text-xs text-muted-foreground` — `N paradas · duração`.
- **Barra de progresso:** linha fina (`h-1`) só aparece em roteiros em andamento.
- **Indicador concluído:** ícone `CheckCircle2` em `text-success` (sem badge, sem texto), no canto superior direito do card. Roteiros em andamento não exibem nada nesse espaço (só o `ChevronRight` ao final).
- **ChevronRight** sutil à direita para indicar navegação.
- Roteiros concluídos: opacidade levemente reduzida (`opacity-90`) e thumb com leve overlay para diferenciar visualmente sem poluir.

### Ordenação e agrupamento

Lista única ordenada assim:
1. Em andamento primeiro (mais recente no topo).
2. Concluídos em seguida (mais recente no topo).

Sem subtítulos de seção — a transição é natural pelos próprios indicadores. Se o usuário não tiver nenhum roteiro, mostrar `EmptyState` único com CTA "Ver roteiros" → `/roteiros`.

### Arquivos afetados

- `src/pages/profile/Routes.tsx` — remover `Tabs/TabsList/TabsContent`, remover `useState` do tab, redesenhar `RouteCard` no novo formato horizontal compacto, juntar `IN_PROGRESS_ROUTES` e `COMPLETED_ROUTES` em uma única lista ordenada.

### Detalhes técnicos

- Manter o uso de `MOCK_ROUTES` e os mocks atuais de `IN_PROGRESS_ROUTES` / `COMPLETED_ROUTES` (mesma fonte de dados, só muda a renderização).
- Continuar usando `GlobalHeader showBack title="Meus Roteiros"`, container `max-w-2xl mx-auto px-4 pb-20 pt-20` e `BottomNav`.
- Tokens HSL do design system: `bg-card`, `border-border`, `text-success`, `text-muted-foreground`, `shadow-card`.
- Animação `animate-fade-in-up` mantida com `delay` escalonado por item.
- Acessibilidade: card é botão clicável (área ≥48px), `aria-label` no ícone de check ("Roteiro concluído").
- Navegação ao clicar segue para `/roteiros` (comportamento atual preservado).
