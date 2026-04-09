import { useState } from "react";
import { useKeyboardMenu } from "../hooks/useKeyboardMenu";
import { MenuBox } from "./MenuBox";

type Props = {
  onTrain: () => void;
  onStats: () => void;
};

const items = ["Trainieren", "Statistik anzeigen", "Beenden"];

export function Menu({ onTrain, onStats }: Props) {
  const [selected, setSelected] = useState(0);

  function activateIndex(index: number) {
    if (index === 0) {
      onTrain();
      return;
    }

    if (index === 1) {
      onStats();
      return;
    }

    alert("Der Browser kann nicht direkt von der App beendet werden.");
  }

  useKeyboardMenu({
    itemCount: items.length,
    selectedIndex: selected,
    onChange: setSelected,
    onEnter: () => activateIndex(selected),
  });

  return (
    <div className="menu-screen">
      <div className="menu-title">MAIN MENU</div>

      <div className="menu-subtitle">
        Willkommen... Bitte treffen Sie Ihre Auswahl
      </div>

      <MenuBox
        items={items}
        selected={selected}
        onSelect={setSelected}
        onActivate={activateIndex}
      />

      <div className="footer-bar">
        <div>
          <span className="footer-key">↑↓</span> Navigation
        </div>
        <div>
          <span className="footer-key">ENTER</span> Auswählen
        </div>
        <div>
          <span className="footer-key">TAP</span> Tippen / Klicken
        </div>
      </div>

      <div className="status-line">
        <span>Der Ultimative Trainer</span>
        <span>Bereit für Tastatur und Touch</span>
      </div>
    </div>
  );
}
