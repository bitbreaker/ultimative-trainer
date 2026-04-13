import { useState } from "react";
import { useKeyboardMenu } from "../hooks/useKeyboardMenu";
import { MenuBox, type MenuItemSpec } from "./MenuBox";

type Props = {
  onTraining: () => void;
  onExamSheets: () => void;
  onStats: () => void;
};

const items: MenuItemSpec[] = [
  {
    label: "Lernen",
    badge: "Training",
  },
  {
    label: "Prüfungsbögen",
    badge: "15",
  },
  {
    label: "Statistik",
    badge: "Stats",
  },
];

export function Menu({ onTraining, onExamSheets, onStats }: Props) {
  const [selected, setSelected] = useState(0);

  function activateIndex(index: number) {
    if (index === 0) {
      onTraining();
      return;
    }

    if (index === 1) {
      onExamSheets();
      return;
    }

    onStats();
  }

  useKeyboardMenu({
    itemCount: items.length,
    selectedIndex: selected,
    onChange: setSelected,
    onEnter: () => activateIndex(selected),
  });

  return (
    <div className="menu-screen">
      <div className="menu-title">HAUPTMENÜ</div>

      <MenuBox
        items={items}
        selected={selected}
        onSelect={setSelected}
        onActivate={activateIndex}
      />
    </div>
  );
}