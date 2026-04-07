import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion, QuizSet } from "../types/quiz";
import { shuffleArray } from "../lib/shuffle";
import {
  getAccuracy,
  getQuestionStats,
  getSetStats,
  loadAllStats,
  saveAllStats,
  sortQuestionsByPriority,
  updateQuestionStats,
} from "../lib/stats";
import { useWindowKeydown } from "../hooks/useWindowKeydown";

type Props = {
  quizSet: QuizSet;
  onBack: () => void;
};

export function QuizScreen({ quizSet, onBack }: Props) {
  const [allStats, setAllStats] = useState(() => loadAllStats());
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const latestAllStats = loadAllStats();
    setAllStats(latestAllStats);

    const setStats = getSetStats(latestAllStats, quizSet.id);
    const sorted = sortQuestionsByPriority(quizSet.questions, setStats);

    setSessionQuestions(sorted);
    setQuestionIndex(0);
    setSelectedOptionIndex(0);
    setChecked(false);
    setIsCorrect(false);
  }, [quizSet]);

  const question = sessionQuestions[questionIndex];

  const shuffledOptions = useMemo(() => {
    if (!question) {
      return [];
    }

    return shuffleArray(question.options);
  }, [question]);

  const setStats = useMemo(() => {
    return getSetStats(allStats, quizSet.id);
  }, [allStats, quizSet.id]);

  const currentStat = question ? getQuestionStats(setStats, question.id) : undefined;
  const accuracy = getAccuracy(currentStat);

  useEffect(() => {
    setSelectedOptionIndex(0);
    setChecked(false);
    setIsCorrect(false);
  }, [questionIndex]);

  useWindowKeydown((event) => {
    if (!question || shuffledOptions.length === 0) {
      return;
    }

    if (!checked && event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedOptionIndex((prev) => {
        return (prev - 1 + shuffledOptions.length) % shuffledOptions.length;
      });
      return;
    }

    if (!checked && event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedOptionIndex((prev) => {
        return (prev + 1) % shuffledOptions.length;
      });
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    if (!checked) {
      const selectedOption = shuffledOptions[selectedOptionIndex];
      const wasCorrect = question.correctOptionIds.includes(selectedOption.id);

      setIsCorrect(wasCorrect);
      setChecked(true);

      const updatedAllStats = updateQuestionStats(
        allStats,
        quizSet.id,
        question.id,
        wasCorrect
      );

      setAllStats(updatedAllStats);
      saveAllStats(updatedAllStats);
      return;
    }

    if (questionIndex >= sessionQuestions.length - 1) {
      onBack();
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  });

  if (!question) {
    return (
      <div className="quiz-screen">
        <div className="menu-title">TRAINING</div>
        <div className="quiz-progress">Keine Fragen gefunden.</div>
        <div className="quiz-footer">ESC Zurück {quizSet.title}</div>
      </div>
    );
  }

  return (
    <div className="quiz-screen">
      <div className="menu-title">TRAINING</div>

      <div className="quiz-meta">
        <div className="quiz-progress">
          Frage {questionIndex + 1} von {sessionQuestions.length}
        </div>
        <div className="quiz-progress">Erfolgsquote: {accuracy}%</div>
      </div>

      <div className="quiz-question-box">{question.question}</div>

      <div className="quiz-options">
        {shuffledOptions.map((option, index) => {
          const isSelected = index === selectedOptionIndex;
          const isRightAnswer = question.correctOptionIds.includes(option.id);

          let className = "quiz-option";

          if (!checked && isSelected) {
            className += " active";
          }

          if (checked && isSelected && !isCorrect) {
            className += " wrong";
          }

          if (checked && isRightAnswer) {
            className += " correct";
          }

          return (
            <div key={option.id} className={className}>
              <div className="quiz-option-label">
                {String.fromCharCode(65 + index)})
              </div>
              <div className="quiz-option-text">{option.text}</div>
            </div>
          );
        })}
      </div>

      {!checked && (
        <div className="quiz-hint">
          <span className="highlight">ENTER</span> Prüfen
        </div>
      )}

      {checked && (
        <>
          <div className={`quiz-result ${isCorrect ? "correct" : "wrong"}`}>
            {isCorrect ? "RICHTIG" : "FALSCH"}
          </div>

          {question.explanation && (
            <div className="quiz-explanation">{question.explanation}</div>
          )}

          <div className="quiz-hint">
            <span className="highlight">ENTER</span> Weiter
          </div>
        </>
      )}

      <div className="quiz-footer">ESC Zurück {quizSet.title}</div>
    </div>
  );
}