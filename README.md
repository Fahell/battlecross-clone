# Battle Cross Clone

Clone para navegador do jogo **Battle Cross** (Super Famicom, 1994 — desenvolvido por A-Max, publicado por Imagineer).
Uma **homenagem** com código e arte 100% originais: corridas caóticas em tela única, jet-bikes escorregadias e power-ups devastadores para até 6 pilotos.

> ⚠️ Projeto de teste/estudo. Não afiliado à A-Max, Imagineer ou Nintendo. Nenhum asset original do jogo é usado.

## Stack

- [Vite](https://vitejs.dev) + [TypeScript](https://www.typescriptlang.org) (strict)
- [React](https://react.dev) 18 para menus/UI
- [Canvas 2D](https://developer.mozilla.org/docs/Web/API/Canvas_API) para o motor do jogo
- [Vitest](https://vitest.dev) para testes
- [Prettier](https://prettier.io) + [ESLint](https://eslint.org) para qualidade de código

## Quickstart

```bash
pnpm install     # instala dependências
pnpm dev         # dev server em http://localhost:5173
pnpm typecheck   # checagem de tipos
pnpm lint        # lint
pnpm test        # testes unitários
pnpm build       # build de produção em dist/
```

## Como jogar (F1)

No menu, clique em **"Corrida de teste — Cidade"** para pilotar uma jet-bike no circuito urbano
(3 voltas, 1 piloto — os outros 5 CPUs chegam na F3):

| Ação           | Tecla     |
| -------------- | --------- |
| Acelerar       | ↑ / W     |
| Frear          | ↓ / S     |
| Virar          | ← → / A D |
| Pausar         | Esc / P   |
| Voltar ao menu | Backspace |

Flags de desenvolvimento (via URL):

- `?autopilot` — piloto automático (usado nos testes E2E)
- `?debug` — desenha centerline, checkpoints e start line

## Documentação

- [Especificação do projeto](./battlecross-clone-spec.md)
- [Plano de implementação](./implementation-plan.md)

## Roadmap

| Fase                   | Status       | Entrega                           |
| ---------------------- | ------------ | --------------------------------- |
| F0 — Fundação          | ✅ concluída | Repo, scaffolding, CI             |
| F1 — Engine & Pista    | ✅ concluída | Loop, física escorregadia, Cidade |
| F2 — Itens             | —            | Sistema de itens (8)              |
| F3 — IA & 6 pilotos    | —            | CPUs com rubber-band              |
| F4 — Battle Mode       | —            | Menus, HUD, mini-campeonato       |
| F5 — Grand Prix        | —            | Arquétipos, pontuação, campanha   |
| F6 — Áudio & polimento | —            | Música/SFX, pistas 2–3, arte      |
| F7 — Validação         | —            | E2E browser + perf                |

## Licença

[MIT](./LICENSE) © 2026 Fahell
