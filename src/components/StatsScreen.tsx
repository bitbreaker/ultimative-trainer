import { useMemo } from "react";
import {
  getAccuracy,
  getPriorityScore,
  getQuestionStats,
  getSetStats,
  loadAllStats,
} from "../lib/stats";
import { useWindowKeydown } from "../hooks/useWindowKeydown";
import type { QuizSet } from "../types/quiz";

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

  const summary = useMemo(() => {
    const allStats = loadAllStats();
    const setStats = getSetStats(allStats, quizSet.id);

    const rows = quizSet.questions.map((question) => {
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
    });

    const answeredRows = rows.filter((row) => row.shown > 0);
    const topRows = [...answeredRows]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);

    const totalShown = rows.reduce((sum, row) => sum + row.shown, 0);
    const totalCorrect = rows.reduce((sum, row) => sum + row.correct, 0);
    const totalWrong = rows.reduce((sum, row) => sum + row.wrong, 0);
    const totalAccuracy =
      totalShown > 0 ? Math.round((totalCorrect / totalShown) * 100) : 0;

    return {
      totalShown,
      totalCorrect,
      totalWrong,
      totalAccuracy,
      answeredQuestions: answeredRows.length,
      topRows,
    };
  }, [quizSet]);

  return (
    <div className="stats-screen">
      <div className="menu-title">STATISTIK</div>

      <div className="screen-scroll-area">
        <div className="stats-summary-box">
          <div>Set: {quizSet.title}</div>
          <div>Fragen im Set: {quizSet.questions.length}</div>
          <div>Beantwortete Fragen: {summary.answeredQuestions}</div>
          <div>Antworten gesamt: {summary.totalShown}</div>
          <div>Richtig: {summary.totalCorrect}</div>
          <div>Falsch: {summary.totalWrong}</div>
          <div>Gesamtquote: {summary.totalAccuracy}%</div>
        </div>

        <div className="stats-table-box">
          <div className="stats-table-header">
            <div className="col-question">Top 10 Fragen</div>
            <div className="col-small">G</div>
            <div className="col-small">R</div>
            <div className="col-small">F</div>
            <div className="col-small">%</div>
          </div>

          {summary.topRows.length === 0 ? (
            <div className="stats-empty">
              Noch keine beantworteten Fragen vorhanden.
            </div>
          ) : (
            summary.topRows.map((row, index) => (
              <div key={row.id} className="stats-table-row">
                <div className="col-question">
                  {index + 1}. {row.question}
                </div>
                <div className="col-small">{row.shown}</div>
                <div className="col-small">{row.correct}</div>
                <div className="col-small">{row.wrong}</div>
                <div className="col-small">{row.accuracy}%</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="action-bar">
        <button type="button" className="action-button primary" onClick={onBack}>
          Zurück
        </button>
      </div>

      <div className="status-line">
        <span>{quizSet.title}</span>
        <span>Top 10 nach Priorität</span>
      </div>
    </div>
  );
}
