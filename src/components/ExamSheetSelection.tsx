import { useMemo, useState } from "react";
import { SBF_SEE_EXAM_SHEETS } from "../data/examSheets";
import { useKeyboardMenu } from "../hooks/useKeyboardMenu";
import { MenuBox, type MenuItemSpec } from "./MenuBox";

type Props = {
  onBack: () => void;
  onSelectSheet: (sheetNumber: number) => void;
};

export function ExamSheetSelection({ onBack, onSelectSheet }: Props) {
  const [selected, setSelected] = useState(0);

  const items = useMemo<MenuItemSpec[]>(() => {
    return [
      {
        label: "Zufälliger Bogen",
        badge: "Random",
      },
      ...SBF_SEE_EXAM_SHEETS.map((sheet) => ({
        label: `Bogen ${String(sheet.nummer).padStart(2, "0")}`,
        badge: "30",
      })),
    ];
  }, []);

  function activateIndex(index: number) {
    if (index === 0) {
      const randomSheet =
        SBF_SEE_EXAM_SHEETS[
          Math.floor(Math.random() * SBF_SEE_EXAM_SHEETS.length)
        ];
      onSelectSheet(randomSheet.nummer);
      return;
    }

    const sheet = SBF_SEE_EXAM_SHEETS[index - 1];
    if (!sheet) {
      return;
    }

    onSelectSheet(sheet.nummer);
  }

  useKeyboardMenu({
    itemCount: items.length,
    selectedIndex: selected,
    onChange: setSelected,
    onEnter: () => activateIndex(selected),
    onBack,
  });

  return (
    <div className="menu-screen">
      <div className="menu-title">PRÜFUNGSBÖGEN</div>

      <MenuBox
        items={items}
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
          Öffnen
        </button>
      </div>
    </div>
  );
}