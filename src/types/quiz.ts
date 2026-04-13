export type QuizOption = {
  id: string;
  text: string;
};

export type QuizMedia = {
  type: "image";
  src: string;
  alt?: string;
  caption?: string;
};

export type QuizCategory = {
  id: string;
  label: string;
  description?: string;
  priorityBoost?: number;
};

export type QuizQuestion = {
  id: string;
  number: number;
  categoryId?: string;
  priority?: number;
  question: string;
  options: QuizOption[];
  correctOptionIds: string[];
  explanation?: string;
  media?: QuizMedia[];
};

export type QuizSet = {
  id: string;
  title: string;
  description?: string;
  mode: "multiple-choice";
  categories?: QuizCategory[];
  questions: QuizQuestion[];
};
