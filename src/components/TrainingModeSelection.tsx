import { useState } from "react";
import { useKeyboardMenu } from "../hooks/useKeyboardMenu";
import { MenuBox, type MenuItemSpec } from "./MenuBox";

export type TrainingModeId = "all" | "basis" | "see" | "worst20";

type Props = {
  onBack: () => void;
  onSelectMode: (modeId: TrainingModeId) => void;
};

const options: Array<MenuItemSpec & { id: TrainingModeId }> = [
  {
    id: "all",
    label: "Alle Fragen",
    badge: "285",
  },
  {
    id: "basis",
    label: "Basisfragen",
    badge: "72",
  },
  {
    id: "see",
    label: "Spezifische Fragen",
    badge: "213",
  },
  {
    id: "worst20",
    label: "Worst 20",
    badge: "20",
  },
];

export function TrainingModeSelection({ onBack, onSelectMode }: Props) {
  const [selected, setSelected] = useState(0);

  function activateIndex(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }
    onSelectMode(option.id);
  }

  useKeyboardMenu({
    itemCount: options.length,
    selectedIndex: selected,
    onChange: setSelected,
    onEnter: () => activateIndex(selected),
    onBack,
  });

  return (
    <div className="menu-screen">
      <div className="menu-title">LERNMODUS</div>

      <MenuBox
        items={options}
        selected={selected}
        onSelect={setSelected}
        onActivate={activateIndex}
      />

      <div className="action-bar">
        <button type="button" className="action-button" onClick={onBack}>
          Zurück
        </button>
        <button
          type="button"
          className="action-button primary"
          onClick={() => activateIndex(selected)}
        >
          Starten
        </button>
      </div>
    </div>
  );
}