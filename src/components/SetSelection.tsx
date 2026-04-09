import { useState } from "react";
import { useKeyboardMenu } from "../hooks/useKeyboardMenu";
import { MenuBox } from "./MenuBox";

type SetOption = {
  id: string;
  label: string;
};

type Props = {
  sets: SetOption[];
  onBack: () => void;
  onSelectSet: (setId: string) => void;
};

export function SetSelection({ sets, onBack, onSelectSet }: Props) {
  const [selected, setSelected] = useState(0);

  function activateIndex(index: number) {
    const selectedSet = sets[index];

    if (!selectedSet) {
      return;
    }

    onSelectSet(selectedSet.id);
  }

  useKeyboardMenu({
    itemCount: sets.length,
    selectedIndex: selected,
    onChange: setSelected,
    onEnter: () => activateIndex(selected),
    onBack,
  });

  return (
    <div className="menu-screen">
      <div className="menu-title">SET AUSWAHL</div>

      <div className="menu-subtitle">Bitte wählen Sie ein Trainingsset</div>

      <MenuBox
        items={sets.map((set) => set.label)}
        selected={selected}
        onSelect={setSelected}
        onActivate={activateIndex}
      />

      <div className="footer-bar">
        <div>
          <span className="footer-key">ESC</span> Zurück
        </div>
        <div>
          <span className="footer-key">ENTER</span> Starten
        </div>
        <div>
          <span className="footer-key">TAP</span> Direkt öffnen
        </div>
      </div>

      <div className="status-line">
        <span>Set-Auswahl</span>
        <span>{sets.length} Set(s) verfügbar</span>
      </div>
    </div>
  );
}
