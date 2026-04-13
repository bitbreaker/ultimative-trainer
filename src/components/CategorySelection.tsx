import { useMemo, useState } from "react";
import { useKeyboardMenu } from "../hooks/useKeyboardMenu";
import type { QuizSet } from "../types/quiz";
import { MenuBox } from "./MenuBox";

type Props = {
  quizSet: QuizSet;
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
};

export function CategorySelection({ quizSet, onBack, onSelectCategory }: Props) {
  const [selected, setSelected] = useState(0);

  const options = useMemo(() => {
    const categories = quizSet.categories ?? [];

    const allOption = {
      id: "all",
      label: `Alle Kategorien (${quizSet.questions.length} Fragen)`,
    };

    const categoryOptions = categories.map((category) => {
      const count = quizSet.questions.filter(
        (question) => question.categoryId === category.id
      ).length;
      const suffix = category.id === "basis" ? " - hoechste Prioritaet" : "";

      return {
        id: category.id,
        label: `${category.label} (${count} Fragen)${suffix}`,
      };
    });

    return [allOption, ...categoryOptions];
  }, [quizSet]);

  function activateIndex(index: number) {
    const option = options[index];

    if (!option) {
      return;
    }

    onSelectCategory(option.id);
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
      <div className="menu-title">KATEGORIEN</div>

      <div className="menu-subtitle">Bitte wählen Sie Ihren Trainingsbereich</div>

      <MenuBox
        items={options.map((option) => ({ label: option.label }))}
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
        <span>{quizSet.title}</span>
        <span>Basisfragen werden im Modus "Alle Kategorien" bevorzugt</span>
      </div>
    </div>
  );
}
