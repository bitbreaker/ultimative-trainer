import { useMemo } from "react";
import { useWindowKeydown } from "../hooks/useWindowKeydown";
import {
  getAccuracy,
  getPriorityScore,
  getQuestionStats,
  getSetStats,
  loadAllStats,
} from "../lib/stats";
import type { QuizQuestion, QuizSet } from "../types/quiz";
import type { QuestionStats } from "../types/stats";

type Props = {
  quizSet: QuizSet;
  onBack: () => void;
};

type Summary = {
  label: string;
  totalQuestions: number;
  answeredQuestions: number;
  shown: number;
  correct: number;
  wrong: number;
  accuracy: number;
};

function getWeightedAccuracy(stats: QuestionStats[]): number {
  const shown = stats.reduce((sum, stat) => sum + stat.shown, 0);
  const correct = stats.reduce((sum, stat) => sum + stat.correct, 0);

  if (shown === 0) {
    return 0;
  }

  return Math.round((correct / shown) * 100);
}

function getSummary(
  label: string,
  questions: QuizQuestion[],
  stats: QuestionStats[]
): Summary {
  return {
    label,
    totalQuestions: questions.length,
    answeredQuestions: stats.filter((stat) => stat.shown > 0).length,
    shown: stats.reduce((sum, stat) => sum + stat.shown, 0),
    correct: stats.reduce((sum, stat) => sum + stat.correct, 0),
    wrong: stats.reduce((sum, stat) => sum + stat.wrong, 0),
    accuracy: getWeightedAccuracy(stats),
  };
}

export function StatsScreen({ quizSet, onBack }: Props) {
  useWindowKeydown((event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
  });

  const view = useMemo(() => {
    const allStats = loadAllStats();
    const setStats = getSetStats(allStats, quizSet.id);

    const rows = quizSet.questions.map((question) => {
      const stat = getQuestionStats(setStats, question.id);
      const accuracy = getAccuracy(stat);
      const priority = getPriorityScore(stat) + (question.priority ?? 0);

      return {
        question,
        stat,
        accuracy,
        priority,
      };
    });

    const allSummary = getSummary(
      "Gesamt",
      rows.map((row) => row.question),
      rows.map((row) => row.stat)
    );

    const basisRows = rows.filter((row) => row.question.categoryId === "basis");
    const seeRows = rows.filter((row) => row.question.categoryId === "see");

    const basisSummary = getSummary(
      "Basisfragen",
      basisRows.map((row) => row.question),
      basisRows.map((row) => row.stat)
    );

    const seeSummary = getSummary(
      "Spezifische Fragen See",
      seeRows.map((row) => row.question),
      seeRows.map((row) => row.stat)
    );

    const hardestRows = [...rows].sort((a, b) => b.priority - a.priority).slice(0, 10);
    const worst20Rows = [...rows].sort((a, b) => b.priority - a.priority).slice(0, 20);

    const worst20Summary = getSummary(
      "Worst 20",
      worst20Rows.map((row) => row.question),
      worst20Rows.map((row) => row.stat)
    );

    return {
      allSummary,
      basisSummary,
      seeSummary,
      worst20Summary,
      hardestRows,
    };
  }, [quizSet]);

  return (
    <div className="stats-screen">
      <div className="menu-title">STATISTIK</div>

      <div className="screen-scroll-area">
        <div className="stats-grid">
          {[view.allSummary, view.basisSummary, view.seeSummary, view.worst20Summary].map(
            (summary) => (
              <div key={summary.label} className="panel stat-card">
                <div className="stat-label">{summary.label}</div>
                <div className="stat-value">{summary.accuracy}%</div>

                <div className="mini-bar">
                  <div
                    className="mini-bar-fill"
                    style={{ width: `${summary.accuracy}%` }}
                  />
                </div>

                <div className="stat-meta">Fragen: {summary.totalQuestions}</div>
                <div className="stat-meta">
                  Beantwortete Fragen: {summary.answeredQuestions}
                </div>
                <div className="stat-meta">Antworten: {summary.shown}</div>
                <div className="stat-meta">
                  Richtig / Falsch: {summary.correct} / {summary.wrong}
                </div>
              </div>
            )
          )}
        </div>

        <div className="panel stats-table-panel">
          <div className="section-title">Top 10 schwierigste Fragen</div>

          {view.hardestRows.length === 0 ? (
            <div className="stats-empty">Noch keine Statistik vorhanden.</div>
          ) : (
            <div className="stats-list">
              {view.hardestRows.map((row, index) => {
                const label = row.stat.shown > 0 ? `${row.accuracy}%` : "Neu";
                const fill = row.stat.shown > 0 ? row.accuracy : 0;

                return (
                  <div key={row.question.id} className="stats-list-row">
                    <div className="stats-list-head">
                      <div className="stats-question-title">
                        {index + 1}. #{row.question.number} {row.question.question}
                      </div>
                      <div className="stats-question-metrics">
                        <span>{label}</span>
                        <span>
                          {row.stat.correct}/{row.stat.shown}
                        </span>
                      </div>
                    </div>

                    <div className="mini-bar">
                      <div
                        className="mini-bar-fill"
                        style={{ width: `${fill}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="action-bar">
        <button type="button" className="action-button primary" onClick={onBack}>
          Zurück
        </button>
      </div>
    </div>
  );
}