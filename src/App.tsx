import { useState } from "react";
import { Frame } from "./components/Frame";
import { Menu } from "./components/Menu";
import { SetSelection } from "./components/SetSelection";
import { QuizScreen } from "./components/QuizScreen";
import { StatsScreen } from "./components/StatsScreen";
import sbfSeeData from "./data/sbf-see.json";
import type { QuizSet } from "./types/quiz";

const header = `
╔════════════════════════════════════════════════════════════════════╗
║                     DER ULTIMATIVE TRAINER                        ║
║               Ein Trainer von Jörn Priebe (c) 2026                ║
╚════════════════════════════════════════════════════════════════════╝
`;

type Screen = "menu" | "set-select" | "quiz" | "stats";

const quizSets: Record<string, QuizSet> = {
  "sbf-see": sbfSeeData as QuizSet,
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [activeSetId, setActiveSetId] = useState<string>("sbf-see");

  const activeQuizSet = quizSets[activeSetId];

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
              onBack={() => setScreen("menu")}
              onSelectSet={(setId) => {
                setActiveSetId(setId);
                setScreen("quiz");
              }}
            />
          )}

          {screen === "quiz" && activeQuizSet && (
            <QuizScreen
              quizSet={activeQuizSet}
              onBack={() => setScreen("set-select")}
            />
          )}

          {screen === "stats" && activeQuizSet && (
            <StatsScreen
              quizSet={activeQuizSet}
              onBack={() => setScreen("menu")}
            />
          )}
        </Frame>
      </div>
    </div>
  );
}