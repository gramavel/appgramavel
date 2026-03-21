

## Plan: Melhorar navegação e interação nos Roteiros

### Problema atual
- Clicar em roteiros sugeridos abre um bottom sheet genérico sem hierarquia clara
- A criação de roteiro é um formulário básico sem feedback visual de progresso
- Falta interação clara: não há indicadores visuais de que os cards são clicáveis

### Mudanças

#### 1. Roteiros Sugeridos — Navegação em página dedicada
Ao clicar num roteiro sugerido, em vez de abrir o bottom sheet atual (`RouteDetailSheet`), navegar para uma **view inline** dentro da mesma página (estado `selectedRoute`) com:

- **Banner hero** com imagem do roteiro (aspect-[2/1]), gradient overlay, título e badges (duração, dificuldade, paradas)
- **Botão voltar** no GlobalHeader via `onBack` (reseta `selectedRoute` sem sair da aba)
- **Descrição** do roteiro
- **Lista de paradas numerada** com linha conectora vertical (timeline visual): número em circle primary → thumb → nome + categoria
- **Botões de ação**: "Iniciar roteiro" (primary, full width) e "Salvar nos meus" (outline)
- Remover o `RouteDetailSheet` como overlay escuro e substituir por essa view inline

#### 2. Cards sugeridos — Feedback visual de clicabilidade
- Adicionar `active:scale-[0.98]` nos cards da lista
- No card featured (hero), adicionar um sutil indicador "Toque para ver" ou ícone ChevronRight no canto

#### 3. Criação de roteiro — Fluxo em etapas
Substituir o Sheet único por um **fluxo em 3 etapas** dentro do mesmo Sheet:

- **Etapa 1**: Nome do roteiro + Descrição (com indicador de progresso: 3 dots/steps)
- **Etapa 2**: Selecionar paradas (com barra de busca para filtrar estabelecimentos, chips de categoria, e reordenação drag visual com números)
- **Etapa 3**: Revisão — resumo visual do roteiro antes de criar (preview com as paradas selecionadas em formato timeline, duração estimada)
- Botões "Voltar" e "Próximo" em cada etapa, "Criar" na última
- Progress indicator no topo (3 circles com linha conectora)

#### 4. Meus Roteiros — Ações de edição
- Adicionar botão de menu (MoreVertical) em cada roteiro do usuário para editar/excluir
- Ao clicar em um roteiro do usuário, abrir a mesma view de detalhe dos sugeridos, mas com botão "Editar" no lugar de "Salvar nos meus"

### Arquivos a editar
- `src/pages/Roteiros.tsx` — refatorar toda a lógica de navegação e criação

### Detalhes técnicos
- A view de detalhe será controlada por estado (`selectedRoute`) renderizando condicionalmente em vez do `<main>` principal
- O fluxo de criação usará um estado `createStep` (1, 2, 3) dentro do Sheet existente
- Timeline visual das paradas: `border-l-2 border-primary/20` com circles numerados posicionados com `absolute`
- Animações de entrada: `fadeInUp` keyframe já existente no projeto

