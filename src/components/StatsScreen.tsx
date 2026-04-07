import { useMemo } from "react";
import type { QuizSet } from "../types/quiz";
import {
  getAccuracy,
  getQuestionStats,
  getPriorityScore,
  getSetStats,
  loadAllStats,
} from "../lib/stats";
import { useWindowKeydown } from "../hooks/useWindowKeydown";

type Props = {
  quizSet: QuizSet;
  onBack: () => void;
};

export function StatsScreen({ quizSet, onBack }: Props) {
  useWindowKeydown((event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
    }
  });

  const rows = useMemo(() => {
    const allStats = loadAllStats();
    const setStats = getSetStats(allStats, quizSet.id);

    return quizSet.questions
      .map((question) => {
        const stat = getQuestionStats(setStats, question.id);

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
  }, [quizSet]);

  const totalShown = rows.reduce((sum, row) => sum + row.shown, 0);
  const totalCorrect = rows.reduce((sum, row) => sum + row.correct, 0);
  const totalWrong = rows.reduce((sum, row) => sum + row.wrong, 0);
  const totalAccuracy =
    totalShown > 0 ? Math.round((totalCorrect / totalShown) * 100) : 0;

  function shorten(text: string, max = 72) {
    if (text.length <= max) {
      return text;
    }

    return text.slice(0, max - 3) + "...";
  }

  return (
    <div className="stats-screen">
      <div className="menu-title">STATISTIK</div>

      <div className="stats-summary-box">
        <div>Set: {quizSet.title}</div>
        <div>Fragen im Set: {quizSet.questions.length}</div>
        <div>Beantwortet: {totalShown}</div>
        <div>Richtig: {totalCorrect}</div>
        <div>Falsch: {totalWrong}</div>
        <div>Gesamtquote: {totalAccuracy}%</div>
      </div>

      <div className="stats-table-box">
        <div className="stats-table-header">
          <div className="col-question">Frage</div>
          <div className="col-small">G</div>
          <div className="col-small">R</div>
          <div className="col-small">F</div>
          <div className="col-small">%</div>
        </div>

        {rows.slice(0, 12).map((row, index) => (
          <div key={row.id} className="stats-table-row">
            <div className="col-question">
              {index + 1}. {shorten(row.question)}
            </div>
            <div className="col-small">{row.shown}</div>
            <div className="col-small">{row.correct}</div>
            <div className="col-small">{row.wrong}</div>
            <div className="col-small">{row.accuracy}</div>
          </div>
        ))}
      </div>

      <div className="status-line">
        <span>ESC Zurück</span>
        <span>Top 12 schwierige Fragen</span>
      </div>
    </div>
  );
}