import { shuffleArray } from "./shuffle";
import type { QuizQuestion } from "../types/quiz";
import type { AllQuizStats, QuestionStats, QuizSetStats } from "../types/stats";

const STORAGE_KEY = "quiz-stats";

function isQuestionStats(value: unknown): value is QuestionStats {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.questionId === "string" &&
    typeof candidate.shown === "number" &&
    typeof candidate.correct === "number" &&
    typeof candidate.wrong === "number"
  );
}

function isLegacyFlatStats(value: unknown): value is Record<string, QuestionStats> {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(isQuestionStats);
}

function getCategoryPriorityBoost(question: QuizQuestion): number {
  if (question.categoryId === "basis") {
    return 700;
  }

  return 0;
}

function getQuestionBasePriority(question: QuizQuestion): number {
  return getCategoryPriorityBoost(question) + (question.priority ?? 0);
}

export function createEmptyQuestionStats(questionId: string): QuestionStats {
  return {
    questionId,
    shown: 0,
    correct: 0,
    wrong: 0,
  };
}

export function loadAllStats(): AllQuizStats {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed as AllQuizStats;
  } catch {
    return {};
  }
}

export function saveAllStats(stats: AllQuizStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function getSetStats(allStats: AllQuizStats, setId: string): QuizSetStats {
  const directSetStats = allStats[setId];

  if (directSetStats && typeof directSetStats === "object") {
    return directSetStats;
  }

  if (isLegacyFlatStats(allStats)) {
    return allStats;
  }

  return {};
}

export function getQuestionStats(
  setStats: QuizSetStats,
  questionId: string
): QuestionStats {
  return setStats[questionId] ?? createEmptyQuestionStats(questionId);
}

export function updateQuestionStats(
  allStats: AllQuizStats,
  setId: string,
  questionId: string,
  wasCorrect: boolean
): AllQuizStats {
  const currentSetStats = getSetStats(allStats, setId);
  const currentQuestionStats = getQuestionStats(currentSetStats, questionId);

  const updatedQuestionStats: QuestionStats = {
    ...currentQuestionStats,
    shown: currentQuestionStats.shown + 1,
    correct: currentQuestionStats.correct + (wasCorrect ? 1 : 0),
    wrong: currentQuestionStats.wrong + (wasCorrect ? 0 : 1),
  };

  return {
    ...allStats,
    [setId]: {
      ...currentSetStats,
      [questionId]: updatedQuestionStats,
    },
  };
}

export function getAccuracy(
  stat?: Pick<QuestionStats, "shown" | "correct">
): number {
  if (!stat || stat.shown === 0) {
    return 0;
  }

  return Math.round((stat.correct / stat.shown) * 100);
}

export function getPriorityScore(
  stat?: Pick<QuestionStats, "shown" | "wrong">
): number {
  if (!stat) {
    return 1000;
  }

  const wrongRate = stat.shown > 0 ? stat.wrong / stat.shown : 1;
  const unseenBonus = stat.shown === 0 ? 500 : 0;
  const wrongWeight = stat.wrong * 20;
  const lowExposureBonus = Math.max(0, 10 - stat.shown) * 5;

  return unseenBonus + wrongRate * 100 + wrongWeight + lowExposureBonus;
}

export function sortQuestionsByPriority(
  questions: QuizQuestion[],
  setStats: QuizSetStats
): QuizQuestion[] {
  return [...questions].sort((a, b) => {
    const scoreA = getPriorityScore(setStats[a.id]) + getQuestionBasePriority(a);
    const scoreB = getPriorityScore(setStats[b.id]) + getQuestionBasePriority(b);
    return scoreB - scoreA;
  });
}

export function buildSessionQuestions(
  questions: QuizQuestion[],
  setStats: QuizSetStats
): QuizQuestion[] {
  const groups = new Map<number, QuizQuestion[]>();

  for (const question of questions) {
    const score =
      getPriorityScore(setStats[question.id]) + getQuestionBasePriority(question);
    const bucket = Math.floor(score / 100);
    const bucketQuestions = groups.get(bucket) ?? [];
    bucketQuestions.push(question);
    groups.set(bucket, bucketQuestions);
  }

  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .flatMap(([, bucketQuestions]) => shuffleArray(bucketQuestions));
}

export function getWorstQuestions(
  questions: QuizQuestion[],
  setStats: QuizSetStats,
  limit: number
): QuizQuestion[] {
  return [...questions]
    .sort((a, b) => {
      const scoreA = getPriorityScore(setStats[a.id]) + getQuestionBasePriority(a);
      const scoreB = getPriorityScore(setStats[b.id]) + getQuestionBasePriority(b);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}