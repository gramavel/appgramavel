## Opção A — Card de "Meus Roteiros" leva ao Detalhe com CTA contextual

Hoje o card em `/perfil/roteiros` navega genericamente para `/roteiros`. Vamos mandar para `/roteiros/:id` (página de detalhe já existente) e adaptar o botão principal conforme o status do usuário (em andamento / concluído / não iniciado).

### Mudança 1 — Navegação do card

**Arquivo:** `src/pages/profile/Routes.tsx`

No `RouteRow`, trocar:
```tsx
onClick={() => navigate("/roteiros")}
```
por:
```tsx
onClick={() =>
  navigate(`/roteiros/${route.id}`, {
    state: { userStatus: route.status, completedStops: route.completedStops },
  })
}
```

Passamos o status via `location.state` para que o detalhe saiba que veio de "Meus Roteiros" e renderize o CTA correto sem precisar buscar nada novo.

### Mudança 2 — CTA contextual no Detalhe

**Arquivo:** `src/pages/RoteiroDetail.tsx`

Ler `userStatus` e `completedStops` de `useLocation().state` e renderizar o bloco de ações (linhas 127–138) condicionalmente:

- **Em andamento** (`userStatus === "in_progress"`):
  - Botão primário: **"Continuar roteiro"** (ícone `Play`) → `/roteiros/:id/navegar`
  - Mostra um pequeno indicador acima do botão: `X de N paradas concluídas`
  - Botão secundário (outline): **"Ver no mapa"** ou ocultar o "Salvar"
- **Concluído** (`userStatus === "completed"`):
  - Badge verde no topo do bloco: `CheckCircle2` + "Roteiro concluído"
  - Botão primário: **"Refazer roteiro"** (ícone `RotateCcw`) → `/roteiros/:id/navegar`
  - Botão secundário (outline): **"Ver memórias"** → por enquanto navega para `/perfil/check-ins` (página existente); placeholder até existir uma página de memórias por roteiro
- **Não iniciado** (sem `userStatus`, fluxo atual da descoberta):
  - Mantém os botões originais: **"Iniciar roteiro"** + **"Salvar nos meus roteiros"**

### Detalhes técnicos

- Usar `useLocation` do `react-router-dom` para ler `state` (já importado parcialmente no arquivo).
- Tipagem leve: `(location.state as { userStatus?: "in_progress" | "completed"; completedStops?: number } | null)`.
- Ícones novos do Lucide: `Play`, `RotateCcw`, `CheckCircle2`.
- Tokens de cor: `text-success` para o indicador de concluído, `bg-primary` para o CTA.
- Acessibilidade: botões mantêm altura padrão (≥48px) e `gap-2` com ícone.
- Sem alterações de rota — `/roteiros/:id` e `/roteiros/:id/navegar` já existem e funcionam.

### Arquivos afetados

- `src/pages/profile/Routes.tsx` — apenas o `onClick` do `RouteRow`.
- `src/pages/RoteiroDetail.tsx` — ler `location.state` e tornar o bloco de ações (linhas 127–138) condicional pelo status.
