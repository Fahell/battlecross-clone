# Battle Cross Clone — Plano de Implementação (Implementation Plan)

> **Status:** Aprovado (decisões fechadas em 2026-08-02 — 2 rodadas complementares de entrevista)
> **Documentos relacionados:** [`battlecross-clone-spec.md`](./battlecross-clone-spec.md) (visão/requisitos)
> **Convenções herdadas:** fullstack-app (pnpm, Prettier `singleQuote/printWidth 100`, TS strict, Vite 5, React 18)

---

## 1. Decisões Fechadas (lacunas sanadas)

| # | Lacuna (spec §10) | Decisão final | Justificativa |
|---|---|---|---|
| 1 | Áudio | **Assets royalty-free** (Kenney/OpenGameArt) via `howler` | Usuário aprovou; mais rápido que compor; sem direitos autorais |
| 2 | Estado global | **Zustand** | Leve, tipado, sem boilerplate; ideal para estado de corrida fora do React |
| 3 | HUD | **React overlay** (DOM sobre o Canvas) | i18n, estilização e testes com browser-use mais fáceis |
| 4 | Personagens | **Arquétipos sem nomes** (Garoto, Garota, Homem, Senhor) | Escopo v1; identidade nomeada fica para polimento |
| 5 | Licença | **MIT** | Padrão para clones/homenagens; confirmada como sugestão |
| 6 | Mobile/responsivo | **Fora de escopo v1** (desktop-first) | Sem necessidade de PWA |
| 7 | Sprites | **Placeholders geométricos** funcionais na v1 → pixel art na fase de polimento | Acelera F1–F4; arte detalhada depois |
| 8 | Estética final | **Pixel art nítido** (resolução nativa, cores vivas, sem scanlines) | Look 16-bit inspirado, legível em monitores modernos |
| 9 | Battle Mode | **Mini-campeonato: 1ª a N vitórias** (N = 1–5) | Fiel ao espírito do original (1–30 vitórias), escalável |
| 10 | Padrões iniciais | **7 voltas / dificuldade Normal** | Fiel ao original; configurável (3–30 voltas) |
| 11 | Recordes | **Todos:** tempos/pista, vitórias Battle, vitórias por piloto GP, últimas configs | Usuário escolheu todos |
| 12 | Gerenciador | **pnpm** | Convenção do fullstack-app |

---

## 2. Specs Técnicas (serão usadas na implementação)

### 2.1 Física (engine/physics.ts)

**Unidades:** pixels (px), tempo em segundos, ticks fixos de 1/60 s (accumulator + `requestAnimationFrame`) para determinismo.

**Espaço lógico:** 960 × 720 px (4:3, homenagem ao SNES), escalado via CSS mantendo proporção.

**Parâmetros base (jet-bike):**

| Parâmetro | Valor | Descrição |
|---|---|---|
| `maxSpeed` | 220 px/s | Velocidade máxima base |
| `accel` | 150 px/s² | Aceleração |
| `brake` | 240 px/s² | Frenagem |
| `coastDecel` | 40 px/s² | Desaceleração natural |
| `turnRate` | 2.4 rad/s | Velocidade de giro do heading |
| `grip` | 0.96/frame | Quão rápido a velocidade alinha ao heading (**<1 = derrapa**) |
| `racerRadius` | 14 px | Raio de colisão círculo-círculo |
| `wallBounce` | 0.55 | Fração de velocidade mantida ao bater na borda |
| `nitroBoost` | +260 px/s | Impulso do nitro (capped em 1.6 × maxSpeed) |
| `matchlessMult` | ×1.35 | Multiplicador de maxSpeed durante matchless |
| `stunTime` | 0.6 s | Tempo sem controle ao ser atingido |
| `weightSlow` | ×0.55 por 2.5 s | Desaceleração do disco azul |
| `turnoverTime` | 3.0 s | Duração dos controles invertidos |

**Modelo:** velocidade vetorial + heading; steering rotaciona o heading; a velocidade gira em direção ao heading conforme `grip` (slippery). Colisões: círculo-círculo entre racers (empurrão + stun curto); parede vs polígono da pista (projeção na normal + `wallBounce`).

### 2.2 Pista (engine/track.ts + tracks/*.ts)

Formato de dados (TS puro, sem JSON externo):

```ts
interface TrackPoint { x: number; y: number }          // centerline (loop fechado)
interface Checkpoint { from: TrackPoint; to: TrackPoint; index: number }
interface Track {
  id: 'city' | 'snow' | 'beach'
  nameKey: string                                       // i18n
  centerline: TrackPoint[]                              // polilinha fechada
  width: number                                         // 70 px
  startLine: { from: TrackPoint; to: TrackPoint; heading: number }
  checkpoints: Checkpoint[]                             // >= 3; para contar volta
  itemSpawns: { x: number; y: number }[]                // 6–8 pontos
  hazards: Hazard[]                                     // ex.: canhão periódico
  shortcuts: Shortcut[]                                 // portões que abrem/fecham
  theme: { ground: string; border: string; decor: string[] }
}
```

- Volta conta ao cruzar `startLine` na ordem certa (passou por todos os checkpoints desde a última volta).
- Perigos v1: canhão periódico (Cidade), bloco de gelo/monstro periódico (Neve/Praia) — 1 por pista.

### 2.3 Itens (engine/items.ts + data/items-def.ts)

| id | tipo | ativação | efeito / duração |
|---|---|---|---|
| `mine` | ativo | Y | solta mina atrás (acumulável até 3); explosão = stun 0.6 s; pode ferir o dono |
| `missile` | ativo | R | teleguiado: 300 px/s, vida 4 s, mira o 1º à frente; stun 0.6 s |
| `nitro` | ativo | X | boost instantâneo (ver física) |
| `speedup` | passivo | — | +8% maxSpeed cumulativo (cap +24%) na corrida |
| `matchless` | passivo | — | 4 s invencível + ×1.35; atropela rivais |
| `weight` | ativo | R | projétil 240 px/s; desacelera alvo 2.5 s |
| `turnover` | ativo | R | projétil 240 px/s; inverte controles 3 s |
| `fairy` | passivo | coleta | cura status negativos (turnover/weight) |

- Spawn: rotação nos pontos fixos; qualquer piloto coleta (sem restrição por posição — fiel).
- Slot único + passivos automáticos na coleta.
- Arquitetura de itens permite adicionar `laser` depois (não está na v1).

### 2.4 IA (engine/ai.ts)

- **Path-following:** alvo = ponto da centerline à frente (lookahead ∝ velocidade); steering proporcional ao erro angular; desacelera em curvas fechadas.
- **Rubber-band leve:** `effMaxSpeed = baseMax × (1 + k × distPlayer/3000)`, `k = 0.35`, clamp para evitar trapaça visível.
- **Dificuldade:**

| Nível | maxSpeed | uso de itens | ruído de decisão |
|---|---|---|---|
| Fácil | ×0.90 | 20% | alto |
| Normal | ×1.00 | 40% | médio |
| Difícil | ×1.12 | 70% | baixo |

- Decisões de item: míssil/weight/turnover quando o jogador está à frente no alcance; mina quando perseguido; nitro em retas.

### 2.5 Storage (state/storage.ts)

| Chave | Conteúdo | Versão |
|---|---|---|
| `battlecross.settings.v1` | `{ lang, lastTrack, laps, difficulty, keymap, volume }` | 1 |
| `battlecross.records.v1` | `{ bestLap: {city,snow,beach}, bestRace: {...}, battleWins, gpWins: {kid,girl,man,elder} }` | 1 |

- Leitura com fallback para defaults; migração por `version`; tolerância a dados corrompidos (try/catch + defaults).

### 2.6 i18n (i18n/)

- Dicionários `pt-BR.json` e `en.json`; chaves por domínio: `menu.*`, `hud.*`, `items.*`, `tracks.*`, `pilots.*`, `results.*`, `gp.*`, `controls.*`.
- Helper `t(key, params)` + hook `useI18n`. **Teste de paridade:** toda chave de `pt-BR` existe em `en` e vice-versa.

### 2.7 Input (input/)

- **Ações normalizadas:** `up, down, left, right, mine, fire, nitro, pause, confirm, back`.
- **Teclado** (configurável, persistido): ↑/W, ↓/S, ←→/AD; mina = C/J; item = X/K; nitro = Z/L; pause = Esc/P; confirm = Enter; back = Backspace.
- **Gamepad:** Gamepad API (axes[0] + direcional; RT=acelerar, LT=frear, RB=item, A=mina, X=nitro, Start=pausa). Eventos `gamepadconnected`.

### 2.8 Áudio (audio/)

- `howler` + assets royalty-free (Kenney *Interface Sounds* / *Racing* packs; OpenGameArt p/ música).
- Canais: música (loop por pista), SFX (item, explosão, boost, UI).
- Volume configurável (música/efeitos) persistido.

---

## 3. Estratégia de Testes

### 3.1 Unit (Vitest) — engine pura (sem DOM)
- **physics:** aceleração/frenagem, decay de derrapagem (grip), colisão parede (bounce), colisão círculo, cap de boost.
- **laps/checkpoints:** contagem correta cruzando startLine na ordem, sem dupla contagem, volta para trás não conta.
- **items:** pickup, mina auto-dano, míssil teleguiado, matchless invencibilidade, weight/turnover + fadinha cura, speedup cumulativo.
- **ai:** faixa do rubber-band (clamp), diferenças por dificuldade, decisões de item.
- **storage:** defaults, save/load, migração de versão, dados corrompidos.
- **i18n:** paridade de chaves entre idiomas.
- **input:** normalização de keymap.

### 3.2 Component (Vitest + Testing Library)
- Menu principal renderiza modos; TrackSelect reflete config; ResultsScreen mostra posições/pódio.

### 3.3 E2E (browser-use + Chrome persistente do Cloud Shell)
- **Modo autopilot (flag dev `?autopilot`):** roda a corrida automaticamente — permite E2E estável até a tela de resultados sem depender de input humano.
- Cenários:
  1. Menu → Battle → TrackSelect → config (7 voltas) → corrida inicia (canvas presente, sem erros de console)
  2. Corrida roda ~5 s com `?autopilot` → sem erros de console
  3. Fluxo completo até ResultsScreen (autopilot) — pódio renderizado
  4. Grand Prix: seleção de piloto → 1ª corrida inicia
  5. Troca de idioma PT/EN persiste (localStorage)

### 3.4 Performance
- Check de 60 fps com 6 pilotos + partículas (devtools/metrics); alvo: nenhum frame drop > 5 ms em hardware básico.

---

## 4. Objetivo Final — Jogabilidade & Estética

### 4.1 Jogabilidade (feel)
- **Núcleo:** *party racer* caótico — corridas curtas, tela única, tudo pode acontecer até a última curva.
- **Física:** escorregadia, mas *justa* — o jogador sente progresso ao dominar a derrapagem; curvas bem feitas dão vantagem real.
- **Ritmo:** rubber-band leve mantém a disputa; 7 voltas (padrão) = ~1,5–2 min por corrida.
- **Itens:** momentos de virada — míssil na reta final, mina em ponto cego, turn over no líder.
- **Modos:** Battle (mini-campeonato) = tensão progressiva; GP = progressão cômica com arquétipos.
- **Frases de efeito (Definition of Fun):** "uma corrida nunca acaba antes da linha", "perdi por causa de uma mina na última curva", "mais uma corrida!".

### 4.2 Estética (look & feel)
- **Pixel art nítido:** sprites e cenários em pixel art, resolução nativa (960×720), cores vivas e contrastadas — inspiração 16-bit sem scanlines.
- **Temas reconhecíveis de imediato:** Cidade (asfalto, prédios), Neve (branco/azul, gelo), Praia (areia, turquesa, monstro).
- **Juiciness:** partículas de boost/explosão, screenshake leve em colisões, popups de item ("NITRO!", "MATCHLESS!"), animações de pódio.
- **HUD React limpo:** trem de posições (6 vagões), contador de voltas, slot de item — legível, sem poluir a pista.
- **UI dos menus:** coerente com a estética do jogo (fonte pixelada para títulos, cantos arredondados com bordas retrô).

---

## 5. Fases de Desenvolvimento (com critérios de aceite)

### F0 — Fundação
- [x] Decisões fechadas (este documento)
- [ ] `gh repo create battlecross-clone --public --source . --push` + README + MIT LICENSE
- [ ] Scaffold Vite (React+TS) com pnpm; Prettier/ESLint (convenções fullstack-app); tsconfig strict
- [ ] CI GitHub Actions: `typecheck + lint + test + build` (mirror do fullstack-app)
- **Aceite:** `pnpm typecheck && pnpm test && pnpm build` verdes no CI.

### F1 — Engine & Pista 1 (Cidade)
- [ ] Loop com fixed timestep; mundo/entidades
- [ ] Física escorregadia (grip, aceleração, colisões parede/círculo)
- [ ] Modelo de pista + render de Cidade (placeholders) + centerline/checkpoints/startLine
- [ ] Input teclado → ações
- [ ] 1 racer controlável; contagem de volta
- **Aceite:** unit tests de física e laps verdes; corrida dirigível com derrapagem.

### F2 — Itens
- [ ] Sistema de slots/spawn/coleta
- [ ] 8 itens (mina, míssil, nitro, speedup, matchless, weight, turnover, fadinha)
- [ ] Partículas básicas + efeitos
- **Aceite:** testes de itens verdes; todos os itens coletáveis e aplicáveis.

### F3 — IA & 6 pilotos
- [ ] Path-following; rubber-band; 3 dificuldades
- [ ] Uso de itens pela CPU; 5 CPUs na pista
- **Aceite:** corrida completa com 6 pilotos; testes de IA verdes.

### F4 — Battle Mode completo
- [ ] Telas React: menu, mode select, track select, config (voltas/dificuldade/N vitórias)
- [ ] HUD React overlay (trem de posições, voltas, item, popups)
- [ ] Mini-campeonato 1ª a N; resultados/pódio
- [ ] Gamepad; recordes (localStorage); telas de resultados
- **Aceite:** fluxo menu→corrida→resultados jogável; component tests verdes.

### F5 — Grand Prix
- [ ] 4 arquétipos (sprite, stats, texto cômico)
- [ ] Pontuação 10/8/6/4/3/2; 3 corridas sequenciais (Cidade→Neve→Praia)
- [ ] Interlúdios de texto (narrador-coelho); classificação final
- **Aceite:** GP completo jogável do início ao troféu.

### F6 — Áudio, Pistas 2–3 e Polimento
- [ ] howler + assets royalty-free (música + SFX); volumes persistidos
- [ ] Pistas Neve e Praia completas (armadilhas, atalhos, temas)
- [ ] i18n completo PT/EN; juice (screenshake, popups, pódio animado)
- [ ] Pixel art dos sprites (substituindo placeholders) e cenários
- **Aceite:** 3 pistas jogáveis com áudio e arte; teste de paridade i18n verde.

### F7 — Validação final
- [ ] Suíte Vitest completa verde (unit + component)
- [ ] Cenários E2E browser-use (autopilot): menu→corrida→resultados; GP; idioma; sem erros de console
- [ ] Check de performance 60 fps
- **Aceite:** todos os itens dos requisitos funcionais do spec (§7) marcados como cumpridos.

---

## 6. Ordem de Execução e Dependências

```
F0 ─▶ F1 ─▶ F2 ─▶ F3 ─▶ F4 ─▶ F5 ─▶ F6 ─▶ F7
        ▲     ▲     ▲      │            ▲
        └─────┴─────┴──────┴────────────┘   (F6 usa motor/pistas de F1–F3)
```

- F1–F3 são o motor e podem ser desenvolvidos em qualquer ordem relativa (itens e IA dependem da física).
- F4 (Battle) é o marco jogável principal — recomendado priorizar.
- F5 (GP) reutiliza tudo do Battle (telas, corrida, resultados).
- F6 (áudio/arte) pode ser intercalado a partir de F3.
- F7 é a validação contínua (testes rodam em todas as fases, não só no final).

---

## 7. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Física escorregadia "mole" | Sliders de calibração + testes de engine; iterar com browser-use |
| 60 fps com 6 pilotos + partículas | Canvas em camadas, offscreen, pool de partículas |
| Assets royalty-free de qualidade inconsistente | Selecionar packs Kenney (interface + racing) primeiro; verificar licenças |
| E2E dependente de input real | Modo `?autopilot` dev-only para fluxos estáveis |
| Escopo crescer (modo bônus, laser, nomes) | Arquitetura preparada; itens/modos registrados via config extensível |

---

## 8. Próximos Passos (Fase 0)

1. Criar repositório GitHub público `battlecross-clone` (via `gh`) e clonar/init na pasta `~/projects/battlecross-clone`
2. `pnpm create vite` (react-ts) + ajustes de config (tsconfig strict, Prettier, ESLint)
3. Adicionar CI (GitHub Actions) + README + LICENSE MIT
4. Iniciar F1 (engine + física + Cidade) com testes
