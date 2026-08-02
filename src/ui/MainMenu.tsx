interface MainMenuProps {
  onStartTest: () => void;
}

export function MainMenu({ onStartTest }: MainMenuProps) {
  return (
    <div className="screen menu-screen">
      <h1 className="title">BATTLE CROSS</h1>
      <p className="subtitle">clone para navegador — homenagem ao clássico de 1994</p>
      <div className="menu-actions">
        <button type="button" className="btn btn-primary" onClick={onStartTest}>
          ▶ Corrida de teste — Cidade
        </button>
      </div>
      <p className="hint">↑/W acelerar · ←→/AD virar · ↓/S frear · Esc pausar</p>
      <p className="phase-tag">FASE 1 — ENGINE &amp; PISTA</p>
    </div>
  );
}
