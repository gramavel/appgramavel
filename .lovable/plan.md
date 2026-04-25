## Implementar pré-cache do shell + botão "Limpar cache"

### 1. `public/sw.js` — Pré-cachear o shell e separar caches persistentes

- Adicionar `/` e `/index.html` ao `PRECACHE_URLS` para garantir que o shell da última versão instalada esteja sempre disponível offline.
- Renomear o cache de runtime para `SHELL_CACHE` versionado (`gramavel-shell-${VERSION}`).
- Tornar `ASSET_CACHE` e `IMAGE_CACHE` **persistentes entre versões** (sem prefixo `${VERSION}`):
  - `ASSET_CACHE = 'gramavel-assets-v1'`
  - `IMAGE_CACHE = 'gramavel-images-v1'`
- No `activate`, deletar apenas caches `gramavel-shell-*` que não sejam o atual; preservar assets/images.
- Manter estratégias atuais (network-first p/ navegação com fallback ao `/index.html` cacheado, cache-first para hashed assets, SWR com TTL para imagens).
- Adicionar handler de mensagem `GET_VERSION` que responde com a versão atual via `event.ports[0]`.
- Logar `VERSION` no `install` e `activate`.

### 2. `src/pages/profile/Settings.tsx` — Botão "Limpar cache do app"

- Adicionar Card "Avançado" com botão `variant="outline"` (ícone `Trash2`) "Limpar cache do app".
- Ao clicar: abrir `AlertDialog` de confirmação.
- Ao confirmar:
  1. `caches.keys()` → deletar todas.
  2. `navigator.serviceWorker.getRegistrations()` → `unregister()` em todas.
  3. Toast "Cache limpo. Recarregando…"
  4. `window.location.reload()`.
- Tratar ausência de `caches`/`serviceWorker` (fallback: apenas reload).

### 3. `src/main.tsx` — Log de versão do SW

- Após registrar o SW e ele ficar `active`, enviar `{ type: 'GET_VERSION' }` via `MessageChannel` e logar `[SW] versão ativa: …`.

### Resultado
- Offline carrega sempre a **última versão instalada** do shell (não uma "fóssil").
- Imagens e bundles hashed permanecem cacheados entre deploys (sem re-download desnecessário).
- Usuário tem escape manual em Configurações se algo travar.
- Console mostra a versão do SW ativo para diagnóstico.

### Arquivos
- `public/sw.js`
- `src/pages/profile/Settings.tsx`
- `src/main.tsx`