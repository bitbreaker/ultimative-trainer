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

  useKeyboardMenu({
    itemCount: items.length,
    selectedIndex: selected,
    onChange: setSelected,
    onEnter: () => {
      if (selected === 0) {
        onTrain();
      }

      if (selected === 1) {
        onStats();
      }

      if (selected === 2) {
        alert("Beenden im Browser nicht aktiv");
      }
    },
  });

  return (
    <div className="menu-screen">
      <div className="menu-title">MAIN MENU</div>

      <div className="menu-subtitle">
        Willkommen...Bitte treffen Sie Ihre Auswahl
      </div>

      <MenuBox items={items} selected={selected} />

      <div className="footer-bar">
        <div>
          <span className="footer-key">↑↓</span> Navigation
        </div>
        <div>
          <span className="footer-key">ENTER</span> Auswählen
        </div>
      </div>

      <div className="status-line">
        <span>Der Ultimative Trainer</span>
        <span>Bereit</span>
      </div>
    </div>
  );
}