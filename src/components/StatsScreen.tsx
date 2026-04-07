import { useEffect } from "react";
import { loadStats, getAccuracy, getPriorityScore } from "../lib/stats";
import type { QuizSet } from "../types/quiz";

type Props = {
  quizSet: QuizSet;
  onBack: () => void;
};

export function StatsScreen({ quizSet, onBack }: Props) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  const stats = loadStats();

  const rows = quizSet.questions
    .map((question) => {
      const stat = stats[question.id] || {
        questionId: question.id,
        shown: 0,
        correct: 0,
        wrong: 0,
      };

      return {
        id: question.id,
        question: question.question,
        shown: stat.shown,
        correct: stat.correct,
        wrong: stat.wrong,
        accuracy: getAccuracy(stat),
        priority: getPriorityScore(stat),
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const totalShown = rows.reduce((sum, row) => sum + row.shown, 0);
  const totalCorrect = rows.reduce((sum, row) => sum + row.correct, 0);
  const totalWrong = rows.reduce((sum, row) => sum + row.wrong, 0);
  const totalAccuracy =
    totalShown > 0 ? Math.round((totalCorrect / totalShown) * 100) : 0;

  function shorten(text: string, max = 58) {
    if (text.length <= max) return text;
    return text.slice(0, max - 3) + "...";
  }

  return (
    <div className="stats-screen">
      <div className="menu-title">STATISTIK</div>

      <div className="stats-summary-box">
        <div>Fragen im Set: {quizSet.questions.length}</div>
        <div>Beantwortet: {totalShown}</div>
        <div>Richtig: {totalCorrect}</div>
        <div>Falsch: {totalWrong}</div>
        <div>Gesamtquote: {totalAccuracy}%</div>
      </div>

      <div className="stats-table-box">
        <div className="stats-table-header">
          <span className="col-question">Frage</span>
          <span className="col-small">G</span>
          <span className="col-small">R</span>
          <span className="col-small">F</span>
          <span className="col-small">%</span>
        </div>

        {rows.slice(0, 12).map((row, index) => (
          <div key={row.id} className="stats-table-row">
            <span className="col-question">
              {index + 1}. {shorten(row.question)}
            </span>
            <span className="col-small">{row.shown}</span>
            <span className="col-small">{row.correct}</span>
            <span className="col-small">{row.wrong}</span>
            <span className="col-small">{row.accuracy}</span>
          </div>
        ))}
      </div>

      <div className="footer-bar">
        <div>
          <span className="footer-key">ESC</span> Zurück
        </div>
      </div>

      <div className="status-line">
        <span>Top 12 schwierige Fragen</span>
        <span>{quizSet.title}</span>
      </div>
    </div>
  );
}