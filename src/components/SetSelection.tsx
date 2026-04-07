import { useState } from "react";
import { useKeyboardMenu } from "../hooks/useKeyboardMenu";
import { MenuBox } from "./MenuBox";

type Props = {
  onBack: () => void;
  onSelectSet: (setId: string) => void;
};

const sets = [
  { id: "sbf-see", label: "SBF See - Multiple Choice" }
];

export function SetSelection({ onBack, onSelectSet }: Props) {
  const [selected, setSelected] = useState(0);

  useKeyboardMenu({
    itemCount: sets.length,
    selectedIndex: selected,
    onChange: setSelected,
    onEnter: () => {
      onSelectSet(sets[selected].id);
    },
    onBack,
  });

  return (
    <div className="menu-screen">
      <div className="menu-title">Set Auswahl</div>

      <div className="menu-subtitle">
        Bitte wählen Sie ein Trainingsset
      </div>

      <MenuBox items={sets.map((set) => set.label)} selected={selected} />

      <div className="footer-bar">
        <div>
          <span className="footer-key">ESC</span> Zurück
        </div>
        <div>
          <span className="footer-key">ENTER</span> Starten
        </div>
      </div>

      <div className="status-line">
        <span>Set-Auswahl</span>
        <span>Bereit</span>
      </div>
    </div>
  );
}