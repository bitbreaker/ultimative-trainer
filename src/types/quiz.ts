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

export type QuizQuestion = {
  id: string;
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
  questions: QuizQuestion[];
};
