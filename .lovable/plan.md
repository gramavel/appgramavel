

## Corrigir mensagem incorreta de "Ative a localização"

### Problema
O `LocationContext` chama `getCurrentPosition` apenas uma vez no boot do app, com timeout curto (5s) e sem `enableHighAccuracy`. Se essa primeira chamada falhar (timeout, demora do GPS, navegador desktop, troca de aba), `coords` fica `null` para sempre. O `MapSheet` então mostra "Ative a localização para ver a rota" e desabilita o botão "Iniciar navegação", mesmo com a permissão concedida.

### Correções

**`src/contexts/LocationContext.tsx`**
- Verificar `navigator.permissions.query({ name: 'geolocation' })` antes de pedir posição (quando disponível) para diferenciar `denied` de `prompt/granted`.
- Substituir o `getCurrentPosition` único por uma estratégia mais robusta:
  1. Primeira tentativa rápida com `enableHighAccuracy: false`, `maximumAge: 60000`, `timeout: 8000`.
  2. Em paralelo iniciar `watchPosition` com `enableHighAccuracy: true` para atualizar `coords` quando o GPS responder, mesmo que a chamada inicial falhe.
- Expor `permissionState` (`'granted' | 'denied' | 'prompt' | 'unknown'`) e uma função `requestLocation()` que força nova tentativa.
- Em vez de `loading` ficar `false` apenas no callback do `getCurrentPosition`, marcar `loading=false` quando: (a) recebermos a primeira posição, (b) o erro for `PERMISSION_DENIED`, ou (c) timeout total de 10s expirar — para a UI não travar em "Carregando…".
- Limpar o `watchPosition` no unmount.

**`src/components/map/MapSheet.tsx`**
- Trocar a lógica do estado vazio para usar `permissionState`:
  - `permissionState === 'denied'` → "Ative a localização nas configurações do navegador para ver a rota."
  - `loading` ou ainda sem coords mas permissão `granted/prompt` → mostrar skeleton dos chips (já existe) em vez da mensagem.
  - Botão "Tentar novamente" chamando `requestLocation()` quando `coords` ainda é null e não está mais carregando.
- Manter o disable do botão "Iniciar navegação" apenas quando realmente sem `coords` ou sem `routeData`, mas adicionar texto auxiliar consistente.

### Resultado esperado
- Quando a permissão está concedida, `coords` é preenchido pelo `watchPosition` mesmo se a chamada inicial demorar; a UI deixa de mostrar "Ative a localização" indevidamente.
- Quando a permissão está negada de fato, mensagem clara orientando ir às configurações.
- Botão para retry manual sem precisar fechar/reabrir o app.

### Arquivos a modificar
- `src/contexts/LocationContext.tsx`
- `src/components/map/MapSheet.tsx`

