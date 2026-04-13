import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ExamScreen } from "./components/ExamScreen";
import { ExamSheetSelection } from "./components/ExamSheetSelection";
import { Menu } from "./components/Menu";
import { QuizScreen } from "./components/QuizScreen";
import { StatsScreen } from "./components/StatsScreen";
import {
  type TrainingModeId,
  TrainingModeSelection,
} from "./components/TrainingModeSelection";
import { getExamSheetQuestionIds } from "./data/examSheets";
import sbfSeeData from "./data/sbf-see.json";
import { getSetStats, getWorstQuestions, loadAllStats } from "./lib/stats";
import type { QuizQuestion, QuizSet } from "./types/quiz";

const APP_VERSION = "v0.8.2";
const CATALOG_LABEL = "SBF See · August 2023";

type Screen =
  | "menu"
  | "training-modes"
  | "exam-sheets"
  | "training"
  | "exam"
  | "stats";

type TrainingSession = {
  label: string;
  quizSet: QuizSet;
};

type ExamSession = {
  sheetNumber: number;
  quizSet: QuizSet;
};

const baseQuizSet = sbfSeeData as QuizSet;

function buildTrainingQuestions(modeId: TrainingModeId): QuizQuestion[] {
  const allStats = loadAllStats();
  const setStats = getSetStats(allStats, baseQuizSet.id);

  if (modeId === "basis") {
    return baseQuizSet.questions.filter(
      (question) => question.categoryId === "basis"
    );
  }

  if (modeId === "see") {
    return baseQuizSet.questions.filter(
      (question) => question.categoryId === "see"
    );
  }

  if (modeId === "worst20") {
    return getWorstQuestions(baseQuizSet.questions, setStats, 20);
  }

  return baseQuizSet.questions;
}

function buildTrainingLabel(modeId: TrainingModeId): string {
  if (modeId === "basis") {
    return "Basisfragen";
  }

  if (modeId === "see") {
    return "Spezifische Fragen";
  }

  if (modeId === "worst20") {
    return "Worst 20";
  }

  return "Alle Fragen";
}

function buildExamQuestions(sheetNumber: number): QuizQuestion[] {
  const questionIds = getExamSheetQuestionIds(sheetNumber);
  const questionMap = new Map(
    baseQuizSet.questions.map((question) => [question.id, question])
  );

  return questionIds
    .map((questionId) => questionMap.get(questionId))
    .filter((question): question is QuizQuestion => Boolean(question));
}

type AppFrameProps = {
  children: ReactNode;
  footerLeft: string;
  footerCenter?: string;
};

function AppFrame({
  children,
  footerLeft,
  footerCenter = APP_VERSION,
}: AppFrameProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const footerRight = `${now.toLocaleDateString("de-DE")} ${now.toLocaleTimeString(
    "de-DE",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  )}`;

  return (
    <div className="app-shell">
      <div className="app-window">
        <header className="frame-top">
          <div className="title-box">
            <div className="title-line">ULTIMATIVE TRAINER</div>
            <div className="subtitle-line">Jörn Priebe · 2026</div>
          </div>
        </header>

        <main className="frame-main">
          <div className="frame-main-scroll">{children}</div>
        </main>

        <footer className="frame-bottom">
          <span className="footer-left">{footerLeft}</span>
          <span className="footer-center">{footerCenter}</span>
          <span className="footer-right">{footerRight}</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [trainingSession, setTrainingSession] = useState<TrainingSession | null>(
    null
  );
  const [examSession, setExamSession] = useState<ExamSession | null>(null);

  function startTraining(modeId: TrainingModeId) {
    const questions = buildTrainingQuestions(modeId);
    const label = buildTrainingLabel(modeId);

    setTrainingSession({
      label,
      quizSet: {
        ...baseQuizSet,
        questions,
      },
    });
    setScreen("training");
  }

  function startExam(sheetNumber: number) {
    const questions = buildExamQuestions(sheetNumber);

    setExamSession({
      sheetNumber,
      quizSet: {
        ...baseQuizSet,
        questions,
      },
    });
    setScreen("exam");
  }

  const footerLeft = useMemo(() => {
    if (screen === "menu") {
      return CATALOG_LABEL;
    }

    if (screen === "training-modes") {
      return "Lernmodus";
    }

    if (screen === "exam-sheets") {
      return "Prüfungsbögen";
    }

    if (screen === "training" && trainingSession) {
      return `Lernen · ${trainingSession.label}`;
    }

    if (screen === "exam" && examSession) {
      return `Bogen ${String(examSession.sheetNumber).padStart(2, "0")}`;
    }

    if (screen === "stats") {
      return "Statistik";
    }

    return CATALOG_LABEL;
  }, [screen, trainingSession, examSession]);

  return (
    <AppFrame footerLeft={footerLeft}>
      {screen === "menu" && (
        <Menu
          onTraining={() => setScreen("training-modes")}
          onExamSheets={() => setScreen("exam-sheets")}
          onStats={() => setScreen("stats")}
        />
      )}

      {screen === "training-modes" && (
        <TrainingModeSelection
          onBack={() => setScreen("menu")}
          onSelectMode={startTraining}
        />
      )}

      {screen === "exam-sheets" && (
        <ExamSheetSelection
          onBack={() => setScreen("menu")}
          onSelectSheet={startExam}
        />
      )}

      {screen === "training" && trainingSession && (
        <QuizScreen
          quizSet={trainingSession.quizSet}
          sessionLabel={trainingSession.label}
          onBack={() => setScreen("training-modes")}
        />
      )}

      {screen === "exam" && examSession && (
        <ExamScreen
          quizSet={examSession.quizSet}
          sheetNumber={examSession.sheetNumber}
          onBack={() => setScreen("exam-sheets")}
        />
      )}

      {screen === "stats" && (
        <StatsScreen quizSet={baseQuizSet} onBack={() => setScreen("menu")} />
      )}
    </AppFrame>
  );
}