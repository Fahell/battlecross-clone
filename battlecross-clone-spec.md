# Battle Cross Clone — Especificação do Projeto (Spec)

> **Status:** Draft — coletado via entrevista (5 rodadas) + pesquisa do jogo original.
> **Data:** 2026-08-02
> **Próximo passo:** criação do repositório + scaffolding (sem código ainda).

---

## 1. Visão Geral

Projeto de teste para criar, em navegador, um **clone do jogo *Battle Cross*** (Super Nintendo / Super Famicom), originalmente desenvolvido pela **A-Max** e publicado pela **Imagineer** em **9 de dezembro de 1994** (exclusivo Japão).

O clone será uma **homenagem** com código e arte 100% originais (sem extração de assets da ROM, por questões de direitos autorais), recriando o espírito caótico do jogo: corridas em tela única, jet-bikes escorregadias, power-ups devastadores e até 6 pilotos disputando o mesmo espaço.

| Item | Decisão |
|---|---|
| Nome do repo | `battlecross-clone` |
| Hospedagem | GitHub **público** (via `gh`, já autenticado) |
| Stack | **Vite + TypeScript + React** |
| Renderização do jogo | **Canvas 2D** (menus/UI em React) |
| Modos | **Battle Mode** (1 jogador + 5 CPU) e **Grand Prix** |
| Pistas | 3: **Cidade**, **Neve**, **Praia** |
| Perspectiva | **Tela única top-down** (fiel ao original) |
| Idioma | **Bilíngue PT-BR / EN** (seletor persistido em `localStorage`) |

---

## 2. Pesquisa — O Jogo Original (referência)

### 2.1 Ficha técnica
- **Título:** Battle Cross (バトルクロス)
- **Desenvolvedora:** A-Max | **Publicadora:** Imagineer
- **Lançamento:** 9 de dezembro de 1994 (Super Famicom, Japão)
- **Gênero:** corrida de festa / *party racer* — mistura de *Super Sprint* (top-down) com itens estilo *Mario Kart*/*Bomberman*

### 2.2 Gameplay
- **Perspectiva:** tela única estática com visão superior (top-down) — toda a pista cabe na tela, todos os competidores visíveis simultaneamente (o que gera o caos característico).
- **Veículos:** jet-bikes (aeromotos) com física **escorregadia** e leveza, exigindo domínio de derrapagem em curvas fechadas.
- **Caos:** sem punição por posição — qualquer piloto pode pegar qualquer item em qualquer posição; um erro pode derrubar o líder para último instantaneamente.
- **Assistência:** o original tem *auto-steering* opcional (modo humano-CPU) para iniciantes/crianças — **decidimos NÃO incluir** na v1.

### 2.3 Modos do original
1. **Grand Prix:** campanha single-player com 4 personagens caricatos, cada um com motivação cômica (prêmio de 10.000.000G); cutscenes narradas por um mestre de cerimônias fantasiado de coelho.
2. **Battle Mode:** o coração do jogo — até 6 jogadores (multitap) com CPUs de dificuldade customizável; regras configuráveis (1–30 vitórias, 7–27 voltas).
3. **Bônus (estilo Pac-Man):** coletar pontos espalhados pela pista desviando/atirando em slimes azuis. — **Fora do escopo v1** (decisão do usuário).

### 2.4 Power-ups (original)
| Item | Ativação | Efeito |
|---|---|---|
| Laser | R (ilimitado) | Tiro frontal, atordoa levemente; atirar custa pequena velocidade |
| Mina terrestre | Y | Planta minas atrás; acumulável (várias em sequência); pode acertar quem plantou |
| Míssil | R (1 uso) | Teleguiado, persegue até acertar/expirar |
| Nitro | X (1 uso) | Turbo de velocidade; ideal em subidas |
| Speed Up | automático | Aumenta permanentemente a velocidade máxima na corrida |
| Matchless | automático | Invencibilidade + aceleração (estilo estrela do Mario Kart); atropela |
| Weight | R (1 uso) | Disco azul que desacelera o alvo |
| Turn Over | R (1 uso) | Disco amarelo que **inverte os controles** da vítima |
| Fadinha de cura | coleta | Cura efeitos negativos (ex.: controles invertidos) |

### 2.5 Pistas e armadilhas do original
- ~9–12 circuitos em tela única, cada um com armadilhas/atalhos únicos: canhões que disparam periodicamente, pilares móveis, portões-atalho que abrem/fecham, pinballs gigantes, saltos (botão L), monstros marinhos, lobos, bonecos de neve, palhaços.
- Voltas configuráveis; ritmo rápido e punitivo.

### 2.6 HUD e apresentação
- Posições exibidas de forma criativa (ex.: como **vagões de trem**).
- Velocidade indicada por movimento/efeitos visuais (sem velocímetro numérico tradicional).
- Resultados com animações cômicas e recompensas irônicas por personagem.

### 2.7 Fontes consultadas
- Wikipedia — *Battle Cross (1994 video game)*
- Snes Central — *Battle Cross Review* (Evan G.)
- VGJunk / retrovania-vgjunk — análise aprofundada
- The King of Grabs — dados de lançamento/desenvolvimento
- GameFAQs — lançamento e plataforma

> ⚠️ **Nota sobre números:** o usuário citou "9 circuitos" e "até 30 voltas" (a pesquisa indica 12 circuitos totais incl. bônus e 7–27 voltas configuráveis). Para o clone usaremos os números do usuário: **3 pistas** e **voltas configuráveis de 3 a 30**.

---

## 3. Decisões do Usuário (entrevista)

| # | Tema | Decisão |
|---|---|---|
| 1 | Repositório | GitHub **público** via `gh` |
| 2 | Stack | **Vite + TypeScript + React** |
| 3 | Nome | **battlecross-clone** |
| 4 | Modos | **Battle Mode + Grand Prix** (sem modo bônus Pac-Man) |
| 5 | Perspectiva | **Tela única top-down** (fiel) |
| 6 | Temas das 3 pistas | **Cidade, Neve, Praia** |
| 7 | Itens na v1 | Mina, Míssil, Nitro, Speed Up, Matchless, Weight, Turn Over, Fadinha de cura (**sem Laser**) |
| 8 | IA | **Rubber-band leve** |
| 9 | Física | **Escorregadia (fiel ao original)** |
| 10 | Voltas | **Configurável 3–30** |
| 11 | Controles | **Teclado + Gamepad** (Gamepad API) |
| 12 | Auto-steer | **Não** |
| 13 | Áudio | Aberto: **criar chiptune OU usar assets de terceiros** — o que for mais eficiente; deps npm permitidas |
| 14 | Idioma | **Bilíngue PT/EN** (persistido) |
| 15 | Arte | **Pixel art original em homenagem** (16-bit, criada do zero, livre de direitos) |
| 16 | Testes | **Sim, validar com o agente browser-use** (Chrome persistente já configurado) |
| 17 | Persistência | **Configurações + recordes** em `localStorage` |
| 18 | HUD | **Fiel ao original** (posições como vagões de trem) |

---

## 4. Arquitetura Técnica

### 4.1 Stack e dependências (propostas)
- **Build:** Vite (React + TS template)
- **UI:** React 18+ + CSS modules (ou vanilla-extract — a decidir)
- **Jogo:** Canvas 2D API nativa; **React** apenas para menus/HUD/menus overlay
- **Áudio:** Web Audio API (se criarmos chiptune) **ou** `howler` + assets royalty-free (ex.: Kenney, OpenGameArt) — a decidir na fase de áudio
- **Gamepad:** Gamepad API nativa (sem dep)
- **i18n:** leve, próprio (dicionários PT/EN) — sem lib pesada
- **Testes:** Vitest (unit) + **browser-use** (E2E de menus e corrida)

### 4.2 Estrutura de pastas (proposta)
```
battlecross-clone/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── i18n/
│   │   ├── pt-BR.json
│   │   └── en.json
│   ├── state/
│   │   ├── game-store.ts        # estado global da corrida (Zustand ou Context — a decidir)
│   │   └── storage.ts           # localStorage: configs + recordes
│   ├── engine/                  # core do jogo (loop, world, física) — independente de React
│   │   ├── loop.ts
│   │   ├── world.ts
│   │   ├── physics.ts           # derrapagem, colisões
│   │   ├── racer.ts
│   │   ├── ai.ts                # rubber-band leve + path-following
│   │   ├── items.ts             # sistema de itens
│   │   ├── track.ts             # modelo de pista (polilinhas, checkpoints)
│   │   └── camera.ts
│   ├── render/
│   │   ├── canvas-renderer.ts   # desenho da pista, sprites, partículas
│   │   ├── sprites.ts           # carregamento/atlas de sprites
│   │   └── hud.ts               # HUD "trem de posições"
│   ├── tracks/
│   │   ├── city.ts
│   │   ├── snow.ts
│   │   └── beach.ts
│   ├── data/
│   │   ├── pilots.ts            # 4 personagens do GP
│   │   └── items-def.ts
│   ├── audio/
│   │   └── audio.ts
│   ├── input/
│   │   ├── keyboard.ts
│   │   └── gamepad.ts
│   └── ui/                      # telas React (menu, seleção, corrida overlay, resultados)
│       ├── MainMenu.tsx
│       ├── ModeSelect.tsx
│       ├── PilotSelect.tsx
│       ├── TrackSelect.tsx
│       ├── RaceScreen.tsx
│       └── ResultsScreen.tsx
└── e2e/                         # cenários browser-use (validação)
```

### 4.3 Separação React ↔ Canvas
- O **mundo do jogo roda no Canvas** com `requestAnimationFrame` (loop próprio, 60 fps).
- **React gerencia:** telas de menu, seleções, opções, overlay de pausa e a tela de resultados — comunicando via um *game-store* (estado global) + eventos.
- O HUD da corrida pode ser Canvas (fiel ao estilo SNES) ou React overlay — **a decidir**; recomendação: Canvas para fidelidade.

---

## 5. Game Design — Especificação de Jogabilidade

### 5.1 Fluxo de telas
```
Menu Principal
 └─ ▶ Battle Mode
 │    ├─ Seleção de Pista (Cidade/Neve/Praia)
 │    ├─ Configurações de corrida (voltas 3–30, dificuldade IA, pilotos CPU)
 │    ├─ Corrida (6 pilotos: 1 humano + 5 CPU)
 │    └─ Resultados (pódio + pontos)
 └─ ▶ Grand Prix
      ├─ Seleção de Personagem (4 pilotos com motivações cômicas)
      ├─ Sequência de 3 corridas (Cidade → Neve → Praia)
      ├─ Entre corridas: mini-cutscene de resultados
      └─ Campeonato finalizado (troféu + classificação)
 └─ ▶ Opções (idioma, som, controles, recordes)
```

### 5.2 Pilotos / Personagens (Grand Prix)
Recriados como pixel art original (nomes próprios criados por nós, em homenagem aos arquétipos):
1. **O garoto rebelde** — quer o prêmio para gastar com comida
2. **A garota anime** — quer construir uma mansão gigantesca
3. **O homem de meia-idade** — quer construir sua própria pista
4. **O senhor comum** — desejos... peculiares

Cada piloto terá: sprite (moto + piloto), cor distinta, stats leves (velocidade/aderência) e texto de vitória/derrota cômico (PT/EN).

### 5.3 Pistas (3)
Todas em **tela única top-down**, com pista de asfalto/terra definida por polígono + borda, checkpoints e linha de chegada.

| Pista | Tema | Armadilhas/Atalhos (propostos) |
|---|---|---|
| **Cidade** | Ruas urbanas, prédios, semáforos | Canhões de prédios, portões-atalho que abrem/fecham, postes |
| **Neve** | Paisagem nevada, bonecos de neve gigantes | Gelo escorregadio (aderência reduzida), bonecos que giram, túneis |
| **Praia** | Ilha tropical, monstro marinho estilo Godzilla | Monstro que bloqueia a pista periodicamente, pinball de palmeiras, onda |

Cada pista terá:
- Layout único desenhado como polilinha fechada (2D) — 3 layouts diferentes
- Zonas de itens (spawns de power-ups espalhados)
- 1–2 atalhos (portões/desvios) por pista
- Perigos ambientais simples na v1 (canhão/perigo periódico)

### 5.4 Itens (v1) — comportamento
| Item | Tipo | Comportamento no clone |
|---|---|---|
| **Mina terrestre** | Ativo (Y) | Solta mina atrás; acumulável (até 3); explode ao toque (atordoa); pode ferir o dono |
| **Míssil teleguiado** | Ativo (R) | Mira o 1º à frente; persegue até acertar ou expirar; atordoa |
| **Nitro** | Ativo (X) | Boost instantâneo de velocidade (1 uso) |
| **Speed Up** | Passivo | Ao coletar: aumenta `maxSpeed` permanente na corrida |
| **Matchless** | Passivo | Invencibilidade temporária + aceleração; colisões atropelam rivais |
| **Weight** | Ativo (R) | Disco azul; desacelera o alvo por tempo curto |
| **Turn Over** | Ativo (R) | Disco amarelo; **inverte controles** do alvo por tempo curto |
| **Fadinha de cura** | Passivo | Cura status negativos (controles invertidos/desaceleração) ao colidir |

- **Spawn:** itens aparecem aleatoriamente em pontos fixos da pista; qualquer piloto pode coletar (sem restrição por posição — fiel ao original).
- **Slot único** + itens passivos automáticos (Speed Up/Matchless aplicam na coleta).
- **Sem Laser** na v1 (decisão do usuário) — fácil de adicionar depois.

### 5.5 Física (escorregadia)
- Modelo de velocidade + direção com **inércia e derrapagem** (drift com fator de atrito baixo).
- Aceleração/brake; colisão com bordas da pista (perde velocidade, ricochete leve).
- Colisão entre veículos (empurrões e atordoamentos curtos).
- Boosts (nitro/matchless) afetam velocidade máxima instantaneamente.

### 5.6 IA (rubber-band leve)
- CPU segue o caminho da pista via *path following* (waypoints/checkpoints).
- Rubber-band: escala de aceleração/velocidade máxima da CPU ajusta conforme distância para o jogador (leva leve — evita trapaça visível).
- 3 níveis de dificuldade (Fácil/Normal/Difícil) que alteram agressividade de uso de itens e margem de erro.
- CPUs usam itens de forma inteligente (míssil/weight/turn over mirando o jogador com probabilidade por dificuldade).

### 5.7 HUD (fiel — "trem de posições")
- **Posições:** ícone de vagão de trem por piloto; o trem inteiro visível (6 vagões) com o jogador destacado.
- **Volta:** contador (ex.: `LAP 2/7`).
- **Item equipado:** ícone no slot.
- **Velocidade:** barra/efeito visual (sem velocímetro numérico — fiel).
- **Mini-evento:** avisos visuais de item coletado ("NITRO!", "MATCHLESS!").

### 5.8 Grand Prix
- Seleção de personagem → 3 corridas em sequência (Cidade → Neve → Praia).
- Pontuação por posição (ex.: 10/8/6/4/3/2) — acumulada.
- Cutscene curta entre corridas (texto cômico do personagem + narrador-coelho).
- Tela final: classificação + mensagem de vitória/derrota.

---

## 6. Controles (proposta — ajustável)

| Ação | Teclado | Gamepad |
|---|---|---|
| Acelerar | ↑ / W | RT / gatilho direito |
| Frear/Ré | ↓ / S | LT |
| Virar | ←/→ / A/D | Analógico esquerdo / direcional |
| Soltar mina (Y) | C / J | Botão Y / A |
| Disparar item (R: míssil/weight/turn over) | X / K | Botão R / RB |
| Nitro (X) | Z / L | Botão X / X |
| Pausa | Esc / P | Start |
| Voltar/Cancelar | Backspace | Botão B |

> Mapeamento final será confirmado na implementação; as teclas de item precisam ser configuráveis (persistido em localStorage).

---

## 7. Requisitos Funcionais (checklist v1)

- [ ] Repo GitHub público `battlecross-clone` com README + licença (MIT sugerida)
- [ ] Menu principal (PT/EN) com Modo: Battle / Grand Prix / Opções
- [ ] Seleção de pista (3) com preview mini
- [ ] Configuração de corrida (voltas 3–30, dificuldade IA)
- [ ] Corrida em tela única top-down, 6 pilotos, 60 fps
- [ ] Física escorregadia (aceleração, derrapagem, colisões)
- [ ] 8 itens funcionais (mina, míssil, nitro, speed up, matchless, weight, turn over, fadinha)
- [ ] IA com rubber-band leve + 3 dificuldades
- [ ] HUD "trem de posições" + voltas + item + avisos
- [ ] Grand Prix: 4 personagens, 3 corridas, pontuação, cutscenes de texto
- [ ] Tela de resultados (pódio/classificação) + recordes
- [ ] Controles teclado + gamepad, configuráveis
- [ ] Idioma PT/EN selecionável, persistido
- [ ] localStorage: configurações + recordes (melhores tempos, vitórias)
- [ ] Áudio: trilha chiptune e/ou SFX (definir abordagem)
- [ ] Validação com browser-use: fluxo menu→corrida→resultados sem erros de console
- [ ] README com instruções e controles

---

## 8. Requisitos Não-Funcionais

- **Performance:** 60 fps estáveis (6 pilotos + partículas + itens no Canvas); `requestAnimationFrame` com delta-time.
- **Compatibilidade:** navegadores modernos (Chrome, Edge, Firefox, Safari); desktop-first (não é requisito mobile).
- **Acessibilidade básica:** contraste de cores, pausa acessível.
- **Código limpo:** TS estrito, componentes pequenos, engine desacoplada de React.
- **Testabilidade:** engine com lógica pura (sem DOM) para unit tests (Vitest).
- **Licença:** MIT (decisão sugerida — confirmar).

---

## 9. Plano de Desenvolvimento (fases)

| Fase | Entrega |
|---|---|
| **F0 — Fundação** | `gh repo create` público + git init + Vite(React+TS) + CI básica |
| **F1 — Engine & Pista** | Loop, física escorregadia, 1 pista (Cidade), movimento/colisões, teclado |
| **F2 — Itens** | Sistema de itens + spawn + 8 itens + partículas básicas |
| **F3 — IA & 6 pilotos** | Path-following, rubber-band, dificuldades, uso de itens pela CPU |
| **F4 — Battle completo** | Seleções (pista/opções), HUD trem, gamepad, resultados, recordes |
| **F5 — Grand Prix** | Personagens, pontuação, cutscenes, campeonato |
| **F6 — Áudio & polimento** | Trilha/SFX (decisão da F0), i18n completo, ajustes visuais |
| **F7 — Validação** | Testes Vitest + cenários browser-use (menu→corrida→resultados) |

---

## 10. Decisões em Aberto / Pendências

> ✅ **Todas as decisões foram fechadas em 2026-08-02 — ver [`implementation-plan.md`](./implementation-plan.md) §1.**

| # | Pendência | Decisão final |
|---|---|---|
| 1 | Áudio | **Assets royalty-free** (Kenney/OpenGameArt) via `howler` |
| 2 | Estado global | **Zustand** |
| 3 | HUD | **React overlay** sobre o Canvas |
| 4 | Nomes dos personagens | **Arquétipos sem nomes** na v1 (nomes em polimento) |
| 5 | Licença | **MIT** |
| 6 | Mobile/responsivo | **Fora de escopo v1** (desktop-first) |
| 7 | Modo bônus Pac-Man | **Fora de escopo v1** (arquitetura permite adicionar) |
| 8 | Laser | **Fora da v1** (sistema de itens extensível) |
| 9 | Battle Mode | **Mini-campeonato 1ª a N vitórias** (N=1–5) |
| 10 | Estética | **Pixel art nítido** (resolução nativa, sem scanlines) |
| 11 | Sprites | **Placeholders na v1** → pixel art no polimento |
| 12 | Padrões iniciais | **7 voltas / Normal** |
| 13 | Recordes | **Todos:** tempos/pista, vitórias Battle, vitórias GP, últimas configs |

---

## 11. Riscos

- **Direitos autorais:** evitar qualquer extração/uso de assets da ROM do SNES — arte e som 100% originais.
- **Complexidade da física 2D em canvas:** derrapagem realista exige tuning; mitigar com testes de engine e sliders de calibração.
- **Performance:** partículas/efeitos com 6 pilotos em telas de alta resolução — usar Canvas otimizado (offscreen, camadas).
- **Fidelidade vs. tempo:** recriar tudo do original é inviável; escopo v1 focado em Battle + GP enxuto (3 pistas).

---

## Apêndice A — Resumo da Entrevista (5 rodadas)

1. **Rodada 1:** Repo público GitHub (gh) · Vite+TS+React · nome `battlecross-clone`
2. **Rodada 2:** Modos Battle + Grand Prix · tela única top-down · pistas Cidade/Neve/Praia
3. **Rodada 3:** Itens (8, sem laser) · IA rubber-band leve · física escorregadia · voltas 3–30
4. **Rodada 4:** Teclado+Gamepad · sem auto-steer · áudio aberto (criar ou deps) · bilíngue PT/EN
5. **Rodada 5:** Pixel art original · validar com browser-use · localStorage (configs+recordes) · HUD trem de posições
