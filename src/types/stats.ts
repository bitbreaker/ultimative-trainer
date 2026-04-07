export type QuestionStats = {
  questionId: string;
  shown: number;
  correct: number;
  wrong: number;
};

export type QuizSetStats = Record<string, QuestionStats>;

export type AllQuizStats = Record<string, QuizSetStats>;