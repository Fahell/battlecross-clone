import { useState } from 'react';
import { MainMenu } from './ui/MainMenu';
import { RaceScreen } from './ui/RaceScreen';

type Screen = 'menu' | 'race';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [raceKey, setRaceKey] = useState(0);

  const startTest = (): void => {
    setRaceKey((k) => k + 1);
    setScreen('race');
  };

  if (screen === 'menu') {
    return <MainMenu onStartTest={startTest} />;
  }
  return (
    <RaceScreen
      key={raceKey}
      onExit={() => setScreen('menu')}
      onRestart={() => setRaceKey((k) => k + 1)}
    />
  );
}
