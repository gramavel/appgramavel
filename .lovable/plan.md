

## Plan: Navegação ativa entre paradas do roteiro ("Iniciar Roteiro")

### Conceito
Ao clicar em "Iniciar roteiro", o usuário entra em um **modo de navegação guiada** — uma view dedicada que mostra a parada atual em destaque, progresso visual, e controles para avançar entre os pontos.

### Fluxo de navegação

```text
┌─────────────────────────────────┐
│  GlobalHeader [showBack]        │
│  "Roteiro em andamento"         │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │   Imagem parada atual     │  │
│  │   aspect-[4/5]            │  │
│  │   gradient overlay        │  │
│  │                           │  │
│  │   "Parada 2 de 5"        │  │
│  │   Nome do Estabelecimento │  │
│  │   Categoria               │  │
│  └───────────────────────────┘  │
│                                 │
│  ● ── ● ── ○ ── ○ ── ○        │  ← progress dots
│                                 │
│  ┌───────────────────────────┐  │
│  │  Info card:               │  │
│  │  Endereço + Categoria     │  │
│  │  Botão "Como chegar" →    │  │
│  └───────────────────────────┘  │
│                                 │
│  [Próxima parada strip]        │  ← preview da próxima
│  Thumbnail + nome + "A seguir" │
│                                 │
│  ┌──────────┐ ┌──────────────┐ │
│  │  Pular   │ │ Já visitei ✓ │ │
│  │ (outline)│ │  (primary)   │ │
│  └──────────┘ └──────────────┘ │
│                                 │
│  Na última: "Concluir roteiro" │
└─────────────────────────────────┘
```

### Funcionalidades

1. **Estado `activeNavigation`**: objeto `{ route, currentStopIndex }` — quando setado, renderiza a view de navegação no lugar da view de detalhe/lista
2. **Imagem hero da parada atual**: foto do estabelecimento com gradient e metadata overlay (número da parada, nome, categoria)
3. **Progress dots**: circles conectados por linha, preenchidos até a parada atual (primary para visitados, muted para pendentes, ring animado na atual)
4. **Card de informações**: endereço e categoria do estabelecimento, com botão "Como chegar" que abre Google Maps com coordenadas
5. **Preview da próxima parada**: strip horizontal com thumbnail e nome (oculto na última parada)
6. **Botões de ação**: "Pular" (outline, avança sem marcar) e "Já visitei ✓" (primary, marca e avança). Na última parada, botão único "Concluir roteiro 🎉"
7. **Tela de conclusão**: ao concluir, exibir uma tela de parabéns com confetti visual (animação CSS), resumo das paradas visitadas vs puladas, e botão "Voltar aos roteiros"
8. **Botão voltar no header**: abre diálogo de confirmação "Deseja sair do roteiro? Seu progresso será perdido"

### Integração com dados
- Buscar dados do estabelecimento (endereço, coordenadas, imagem) cruzando `stop.name` com `MOCK_ESTABLISHMENTS`
- Link "Como chegar": `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

### Arquivos a editar
- `src/pages/Roteiros.tsx` — adicionar estado `activeNavigation`, renderizar view de navegação, progress tracker, tela de conclusão
- `src/data/mock.ts` — sem mudanças necessárias (dados já existentes são suficientes)

### Detalhes técnicos
- Nova variável de estado: `activeNavigation: { route: RouteItem; currentStop: number; visited: boolean[] } | null`
- Progress dots: `flex items-center gap-1` com circles de 10px e linhas de 16px entre eles
- Animação de transição entre paradas: reusar `fadeInUp` keyframe existente
- Tela de conclusão: keyframe `scaleIn` para o ícone de check + `confetti` animation com pseudo-elements

