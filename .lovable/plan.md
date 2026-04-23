
## Auditoria do Mapa de Navegação — Bugs encontrados e correções

Após análise de `NavigationView.tsx`, `RouteMap.tsx`, `MapSheet.tsx` e `lib/routing.ts`, identifiquei os seguintes problemas e proponho as correções abaixo.

### Bugs identificados

**1. Pin de destino com transform conflitante (renderização quebrada)**
Em `NavigationView.tsx` linha 101, há dois `transform:` no mesmo style inline — o segundo sobrescreve o primeiro, fazendo o ícone não centralizar corretamente.

**2. Polyline não é removida ao recalcular rota**
Em `NavigationView.tsx` linha 128, o `removeLayer` só funciona para `Polyline`, mas armazenamos um `LayerGroup` (linha 144). Resultado: ao recalcular a rota (linha 256), as linhas antigas ficam acumuladas no mapa.

**3. Recálculo de rota dispara em loop**
A condição da linha 254 (`>120m do step atual`) pode ser satisfeita continuamente em vias longas, disparando `getRoute` repetidamente sem debounce. Falta um guard de tempo/flag de "já recalculando".

**4. Marcador do usuário recriado a cada heading change**
Em `NavigationView.tsx` linhas 190–217, o `useEffect` depende de `heading`, recriando o `divIcon` e fazendo `setIcon` a cada mudança — perde a transição suave da seta e força reflow.

**5. ETA usa velocidade fixa de 40 km/h**
Linha 292 calcula ETA assumindo 40 km/h independente do tempo real retornado pelo OSRM. Devíamos usar `route.steps[i].durationS` restante.

**6. `arrived` nunca é resetado**
Se o usuário se afastar do destino após chegar, o estado `arrived` permanece `true` permanentemente até fechar a tela.

**7. `getCurrentPosition` redundante**
Linhas 150–154: chamada one-shot antes do `watchPosition`, sem necessidade — o watch já entrega a primeira posição rapidamente. Causa duplo `setCoords` e potencial flicker inicial.

**8. Speech anuncia step inicial mesmo após retomar do background**
`lastSpokenRef` é resetado ao montar, mas se o componente re-renderizar com novo `route` (após recálculo), reanuncia o passo 0 desnecessariamente.

**9. Pulse animation pesada em mobile**
A animação `nav-pulse` (linha 199) escala 4x continuamente — em iOS pode causar jank. Reduzir intensidade.

**10. CartoDB tile maxZoom=20 inválido**
CartoDB Voyager suporta até zoom 19; pedir 20 retorna 404 nas tiles em zoom máximo.

**11. Falta cleanup do `speechSynthesis` ao trocar de step rapidamente**
A fila de voz pode acumular se o usuário passar por muitas manobras curtas seguidas.

### Correções propostas

**`src/components/map/NavigationView.tsx`**
- Corrigir transform do pin de destino (consolidar em um único `transform`).
- Trocar armazenamento da polyline por `L.LayerGroup` tipado e remover via `polylineGroupRef.current.remove()`.
- Adicionar `recalcInProgressRef` + `lastRecalcAtRef` (debounce de 8s) antes de chamar `getRoute` no recálculo.
- Separar effect do marker em dois: criação/posição (deps: coords, recentering) e rotação (deps: heading), aplicando `transform` via DOM diretamente no elemento do ícone.
- Calcular ETA somando `durationS` dos steps restantes + proporção do step atual baseado em `distanceToManeuver`.
- Resetar `arrived` se `distToDest > 60m` novamente.
- Remover `getCurrentPosition` redundante.
- Resetar `lastSpokenRef.current = -1` quando `route` mudar (após recálculo) e cancelar fila de voz antes de cada `speak`.
- Reduzir keyframes do pulse (scale 0.8 → 1.8, opacity 0.6 → 0).
- Trocar `maxZoom: 20` por `19` e limitar `setView` para `Math.min(18, 19)`.

**`src/components/map/RouteMap.tsx`**
- Mesma correção do tile `maxZoom` (já está em 19, ok — manter).
- Garantir que `routeRequestedRef` seja resetado quando `destination` mudar (atualmente depende só do user).

**`src/lib/routing.ts`**
- Expor `totalDurationS` no `RouteResult` para o ETA real (ou usar soma dos steps já existentes — sem mudança necessária).

### Resultado esperado
- Pin de destino renderiza corretamente.
- Linhas da rota não se acumulam.
- Sem chamadas repetidas ao OSRM.
- Seta do usuário gira suavemente (transição CSS preservada).
- ETA condizente com a rota OSRM.
- Estado de "chegou" responsivo.
- Sem 404s de tiles em zoom alto.
- Fila de voz limpa entre manobras.

### Arquivos a modificar
- `src/components/map/NavigationView.tsx` (principal)
- `src/components/map/RouteMap.tsx` (ajuste menor)
