import { useMemo, useState } from "react";
import { CategorySelection } from "./components/CategorySelection";
import { Frame } from "./components/Frame";
import { Menu } from "./components/Menu";
import { QuizScreen } from "./components/QuizScreen";
import { SetSelection } from "./components/SetSelection";
import { StatsScreen } from "./components/StatsScreen";
import sbfSeeData from "./data/sbf-see.json";
import type { QuizSet } from "./types/quiz";

const header = `
╔════════════════════════════════════════════════════════════════════╗
║                     DER ULTIMATIVE TRAINER                        ║
║               Ein Trainer von Jörn Priebe (c) 2026                ║
╚════════════════════════════════════════════════════════════════════╝
`;

type Screen = "menu" | "set-select" | "category-select" | "quiz" | "stats";

const quizSets: QuizSet[] = [sbfSeeData as QuizSet];

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [activeSetId, setActiveSetId] = useState<string>(quizSets[0]?.id ?? "");
  const [activeCategorySelection, setActiveCategorySelection] =
    useState<string>("all");

  const activeBaseSet = useMemo(() => {
    return quizSets.find((set) => set.id === activeSetId) ?? quizSets[0];
  }, [activeSetId]);

  const activeQuizSession = useMemo(() => {
    if (!activeBaseSet) {
      return null;
    }

    const categories = activeBaseSet.categories ?? [];
    const selectedCategoryIds =
      activeCategorySelection === "all"
        ? categories.map((category) => category.id)
        : [activeCategorySelection];

    const filteredQuestions =
      categories.length === 0
        ? activeBaseSet.questions
        : activeBaseSet.questions.filter((question) =>
            selectedCategoryIds.includes(question.categoryId)
          );

    const selectionLabel =
      activeCategorySelection === "all"
        ? "Alle Kategorien"
        : categories.find((category) => category.id === activeCategorySelection)
            ?.label ?? "Alle Kategorien";

    return {
      quizSet: {
        ...activeBaseSet,
        questions: filteredQuestions,
      },
      selectionLabel,
    };
  }, [activeBaseSet, activeCategorySelection]);

  function handleSetSelection(setId: string) {
    const selectedSet = quizSets.find((set) => set.id === setId) ?? quizSets[0];
    const categoryCount = selectedSet?.categories?.length ?? 0;

    setActiveSetId(setId);

    if (categoryCount > 1) {
      setActiveCategorySelection("all");
      setScreen("category-select");
      return;
    }

    setActiveCategorySelection("all");
    setScreen("quiz");
  }

  return (
    <div className="app-shell">
      <div className="outer-frame">
        <Frame title={header}>
          {screen === "menu" && (
            <Menu
              onTrain={() => setScreen("set-select")}
              onStats={() => setScreen("stats")}
            />
          )}

          {screen === "set-select" && (
            <SetSelection
              sets={quizSets.map((set) => ({ id: set.id, label: set.title }))}
              onBack={() => setScreen("menu")}
              onSelectSet={handleSetSelection}
            />
          )}

          {screen === "category-select" && activeBaseSet && (
            <CategorySelection
              quizSet={activeBaseSet}
              onBack={() => setScreen("set-select")}
              onSelectCategory={(categoryId) => {
                setActiveCategorySelection(categoryId);
                setScreen("quiz");
              }}
            />
          )}

          {screen === "quiz" && activeQuizSession && (
            <QuizScreen
              quizSet={activeQuizSession.quizSet}
              sessionLabel={activeQuizSession.selectionLabel}
              onBack={() =>
                (activeBaseSet?.categories?.length ?? 0) > 1
                  ? setScreen("category-select")
                  : setScreen("set-select")
              }
            />
          )}

          {screen === "stats" && activeBaseSet && (
            <StatsScreen quizSet={activeBaseSet} onBack={() => setScreen("menu")} />
          )}
        </Frame>
      </div>
    </div>
  );
}
