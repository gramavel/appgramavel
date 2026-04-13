# Gramável: Guia de Design System e Boas Práticas

Este documento serve como o guia oficial para o desenvolvimento de interfaces e experiências de usuário no aplicativo Gramável. Ele estabelece os princípios, tokens de design, componentes e diretrizes de UX/UI para garantir consistência, escalabilidade e uma experiência de usuário de alta qualidade em todas as plataformas.

## 1. Princípios de Design

Nossos princípios guiam todas as decisões de design, garantindo que o Gramável seja:

*   **Intuitivo:** Fácil de usar e entender, minimizando a curva de aprendizado.
*   **Acolhedor:** Transmite uma sensação de hospitalidade e convida à exploração.
*   **Consistente:** Elementos visuais e interativos se comportam de forma previsível em todo o aplicativo.
*   **Eficiente:** Ajuda o usuário a atingir seus objetivos rapidamente e sem frustração.
*   **Moderno:** Adota uma estética limpa, contemporânea e alinhada às tendências de design.

## 2. Design Tokens

Os Design Tokens são as unidades fundamentais do nosso sistema visual, garantindo a padronização de cores, tipografia, espaçamento e outros atributos visuais.

### 2.1. Cores

As cores são definidas no `tailwind.config.ts` e `src/index.css`.

| Token | Exemplo | Descrição |
| :--- | :--- | :--- |
| `--primary` | ![#6366F1](https://via.placeholder.com/15/6366F1/000000?text=+) | Cor principal da marca, usada para elementos interativos e destaque. |
| `--secondary` | ![#A78BFA](https://via.placeholder.com/15/A78BFA/000000?text=+) | Cor secundária, para elementos de suporte e diferenciação. |
| `--accent` | ![#FBBF24](https://via.placeholder.com/15/FBBF24/000000?text=+) | Cor de destaque, para alertas, notificações ou elementos que exigem atenção. |
| `--background` | ![#F8FAFC](https://via.placeholder.com/15/F8FAFC/000000?text=+) | Cor de fundo principal do aplicativo. |
| `--foreground` | ![#1E293B](https://via.placeholder.com/15/1E293B/000000?text=+) | Cor do texto principal sobre o fundo. |
| `--muted` | ![#64748B](https://via.placeholder.com/15/64748B/000000?text=+) | Cor para textos secundários, ícones inativos ou elementos de baixo contraste. |
| `--border` | ![#E2E8F0](https://via.placeholder.com/15/E2E8F0/000000?text=+) | Cor para bordas de componentes. |
| `--card` | ![#FFFFFF](https://via.placeholder.com/15/FFFFFF/000000?text=+) | Cor de fundo para cards e superfícies elevadas. |
| `--destructive` | ![#EF4444](https://via.placeholder.com/15/EF4444/000000?text=+) | Cor para ações destrutivas ou mensagens de erro. |

**Gradientes:**
*   `bg-gradient-primary`: Gradiente principal da marca, usado em elementos de destaque.
*   `bg-gradient-secondary`: Gradiente secundário, usado em estados inativos ou elementos de suporte.

### 2.2. Tipografia

*   **Fonte Principal:** Definida globalmente para garantir legibilidade e consistência.
*   **Escala Tipográfica:** Utilizar as classes de texto do Tailwind (ex: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.) para manter a hierarquia visual.

### 2.3. Espaçamento

Utilizar as classes de espaçamento do Tailwind (ex: `p-4`, `m-2`, `space-y-4`, `gap-2`) para garantir espaçamentos consistentes entre elementos e seções.

### 2.4. Border Radius

*   **`rounded-full`:** Para botões principais, inputs e elementos que exigem um visual mais suave e amigável.
*   **`rounded-2xl` (16px):** Para cards, imagens, skeletons e outros elementos de superfície.
*   **`rounded-3xl` (24px):** Para modais, dialogs e elementos de maior destaque que exigem um arredondamento mais pronunciado.

### 2.5. Sombras

*   `shadow-card`: Sombra padrão para cards e elementos elevados, definida no `tailwind.config.ts`.

## 3. Componentes UI

Todos os componentes devem ser construídos utilizando a biblioteca Shadcn UI e customizados de acordo com os Design Tokens e diretrizes abaixo.

### 3.1. Botões (`Button`)

*   **Padrão:** `rounded-full` para todos os botões principais e secundários.
*   **Tamanhos:** Utilizar `size="sm"`, `size="default"`, `size="lg"` conforme a necessidade, mantendo a consistência.
*   **Variantes:** `default`, `outline`, `ghost`, `link`, `destructive`.

### 3.2. Inputs (`Input`, `Textarea`)

*   **Padrão:** `rounded-full` para `Input` e `rounded-2xl` para `Textarea`.
*   **Altura:** `h-11` para `Input`.
*   **Estados:** `focus`, `disabled`, `error` devem seguir os tokens de cor e borda definidos.

### 3.3. Cards (`Card`)

*   **Padrão:** `rounded-2xl`.
*   **Sombra:** `shadow-card`.

### 3.4. Paginação (`Pagination`)

*   **Idioma:** Sempre em Português Brasileiro (ex: "Anterior", "Próximo").
*   **Arredondamento:** Botões de paginação devem seguir o `rounded-full`.

### 3.5. Diálogos e Alertas (`Dialog`, `AlertDialog`)

*   **Padrão:** `rounded-3xl`.
*   **Idioma:** Textos de cabeçalho e botões de ação em Português Brasileiro.

### 3.6. Skeletons (`Skeleton`)

*   **Padrão:** `rounded-2xl` para elementos retangulares e `rounded-full` para elementos circulares (avatares, ícones).
*   **Uso:** Implementar skeletons detalhados para simular a estrutura do conteúdo que está sendo carregado, evitando "saltos" visuais.

### 3.7. Ícones

*   **Biblioteca:** Utilizar exclusivamente ícones da biblioteca Lucide React.
*   **Tamanho:** Padronizar `h-4 w-4` ou `h-5 w-5` para ícones inline com texto, e tamanhos maiores para ícones de destaque.
*   **Acessibilidade:** Sempre incluir `aria-label` para ícones interativos.

## 4. Diretrizes de UX

### 4.1. Empty States (Estados Vazios)

*   **Componente:** Utilizar o componente `EmptyState` criado para listas vazias (ex: "Você ainda não salvou nenhum lugar.").
*   **Conteúdo:** Mensagem clara, ícone ilustrativo e um botão de ação relevante (ex: "Explorar Lugares").

### 4.2. Loading States (Estados de Carregamento)

*   **Skeletons:** Usar skeletons para carregamento de conteúdo principal.
*   **Loaders:** Para ações rápidas (ex: clique em um botão), usar `Loader2` (spinner) dentro do botão ou um `toast` de "Carregando...".

### 4.3. Feedback Messages (Mensagens de Feedback)

*   **Biblioteca:** Utilizar `sonner` para `toast` messages.
*   **Tom de Voz:** Acolhedor, claro e em Português Brasileiro. Evitar jargões técnicos.
    *   **Sucesso:** "Que bom ver você de novo!", "Imagem enviada com sucesso!"
    *   **Erro:** "Ops! Tivemos um problema ao entrar. Verifique sua conexão.", "E-mail ou senha incorretos."
*   **Consistência:** Mensagens de erro devem ser específicas e ajudar o usuário a entender o que deu errado e como corrigir.

### 4.4. Acessibilidade

*   **Labels:** Todos os elementos interativos (botões, links, inputs) devem ter `aria-label` ou `alt text` descritivos.
*   **Contraste:** Garantir que as combinações de cores de texto e fundo tenham contraste suficiente para usuários com deficiência visual.

## 5. Copywriting

*   **Idioma:** Português Brasileiro.
*   **Tom de Voz:** Amigável, convidativo e informativo. Evitar formalidades excessivas.
*   **Padronização:** Termos como "Gramável", "Roteiros", "Cupons", "Estabelecimentos" devem ser usados de forma consistente.

---

Este guia será atualizado conforme o Design System evolui. Qualquer alteração no código deve estar em conformidade com estas diretrizes. Em caso de dúvida, consulte este documento ou a equipe de design.
