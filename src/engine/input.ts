export type ActionName =
  'up' | 'down' | 'left' | 'right' | 'mine' | 'fire' | 'nitro' | 'pause' | 'confirm' | 'back';

export type ActionState = Record<ActionName, boolean>;

export const createActionState = (): ActionState => ({
  up: false,
  down: false,
  left: false,
  right: false,
  mine: false,
  fire: false,
  nitro: false,
  pause: false,
  confirm: false,
  back: false,
});

export const DEFAULT_KEYMAP: Record<string, ActionName> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  KeyC: 'mine',
  KeyJ: 'mine',
  KeyX: 'fire',
  KeyK: 'fire',
  KeyZ: 'nitro',
  KeyL: 'nitro',
  Escape: 'pause',
  KeyP: 'pause',
  Enter: 'confirm',
  Backspace: 'back',
};

/** Teclado → ações normalizadas. Movimento por polling; ações pontuais via consumePressed. */
export class KeyboardInput {
  private held = new Set<string>();
  private pressed = new Set<string>();

  constructor(private actionMap: Record<string, ActionName> = DEFAULT_KEYMAP) {}

  private handleDown = (e: KeyboardEvent): void => {
    const action = this.actionMap[e.code];
    if (!action) return;
    e.preventDefault();
    if (!this.held.has(e.code)) this.pressed.add(e.code);
    this.held.add(e.code);
  };

  private handleUp = (e: KeyboardEvent): void => {
    if (!this.actionMap[e.code]) return;
    e.preventDefault();
    this.held.delete(e.code);
  };

  private handleBlur = (): void => {
    this.held.clear();
    this.pressed.clear();
  };

  attach(): void {
    window.addEventListener('keydown', this.handleDown);
    window.addEventListener('keyup', this.handleUp);
    window.addEventListener('blur', this.handleBlur);
  }

  detach(): void {
    window.removeEventListener('keydown', this.handleDown);
    window.removeEventListener('keyup', this.handleUp);
    window.removeEventListener('blur', this.handleBlur);
    this.held.clear();
    this.pressed.clear();
  }

  poll(): ActionState {
    const state = createActionState();
    for (const code of this.held) {
      const action = this.actionMap[code];
      if (action) state[action] = true;
    }
    return state;
  }

  consumePressed(): ActionName[] {
    const out: ActionName[] = [];
    for (const code of this.pressed) out.push(this.actionMap[code]);
    this.pressed.clear();
    return out;
  }
}
