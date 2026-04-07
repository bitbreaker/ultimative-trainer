import type { QuizStats } from "../types/stats";

const STORAGE_KEY = "quiz-stats";

export function loadStats(): QuizStats {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

export function saveStats(stats: QuizStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function updateStats(
  stats: QuizStats,
  questionId: string,
  correct: boolean
): QuizStats {
  const current = stats[questionId] || {
    questionId,
    shown: 0,
    correct: 0,
    wrong: 0,
  };

  current.shown += 1;

  if (correct) {
    current.correct += 1;
  } else {
    current.wrong += 1;
  }

  return {
    ...stats,
    [questionId]: current,
  };
}

// ✅ DAS HAT GEFEHLT
export function getAccuracy(stat?: {
  correct: number;
  shown: number;
}) {
  if (!stat || stat.shown === 0) return 0;
  return Math.round((stat.correct / stat.shown) * 100);
}

// ✅ UND DAS
export function getPriorityScore(stat?: {
  shown: number;
  wrong: number;
}) {
  if (!stat) return 1000;

  const wrongRate = stat.shown > 0 ? stat.wrong / stat.shown : 0;

  return wrongRate * 100 + stat.wrong * 10 - stat.shown;
}