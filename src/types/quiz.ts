export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanation?: string;
};

export type QuizSet = {
  id: string;
  title: string;
  mode: "multiple-choice";
  questions: QuizQuestion[];
};