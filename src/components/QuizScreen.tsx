import { useEffect, useMemo, useState } from "react";
import type { QuizSet } from "../types/quiz";
import { shuffleArray } from "../lib/shuffle";
import {
  loadStats,
  saveStats,
  updateStats,
  getAccuracy,
  getPriorityScore,
} from "../lib/stats";

type Props = {
  quizSet: QuizSet;
  onBack: () => void;
};

export function QuizScreen({ quizSet, onBack }: Props) {
  const [stats, setStats] = useState(loadStats());

  const sortedQuestions = useMemo(() => {
    return [...quizSet.questions].sort((a, b) => {
      const scoreA = getPriorityScore(stats[a.id]);
      const scoreB = getPriorityScore(stats[b.id]);
      return scoreB - scoreA;
    });
  }, [quizSet.questions, stats]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const question = sortedQuestions[questionIndex];

  const shuffledOptions = useMemo(() => {
    return shuffleArray(question.options);
  }, [question]);

  const currentStat = stats[question.id];
  const accuracy = getAccuracy(currentStat);

  useEffect(() => {
    setSelectedOptionIndex(0);
    setChecked(false);
    setIsCorrect(false);
  }, [questionIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!checked && event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedOptionIndex((prev) =>
          (prev - 1 + shuffledOptions.length) % shuffledOptions.length
        );
      }

      if (!checked && event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedOptionIndex((prev) => (prev + 1) % shuffledOptions.length);
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }

      if (event.key === "Enter") {
        event.preventDefault();

        if (!checked) {
          const selectedOption = shuffledOptions[selectedOptionIndex];
          const correct = question.correctOptionIds.includes(selectedOption.id);

          setIsCorrect(correct);
          setChecked(true);

          const newStats = updateStats(stats, question.id, correct);
          setStats(newStats);
          saveStats(newStats);
        } else {
          if (questionIndex === sortedQuestions.length - 1) {
            onBack();
          } else {
            setQuestionIndex((prev) => prev + 1);
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    checked,
    selectedOptionIndex,
    shuffledOptions,
    question,
    questionIndex,
    sortedQuestions.length,
    stats,
    onBack,
  ]);

  return (
    <div className="quiz-screen">
      <div className="menu-title">TRAINING</div>

      <div className="quiz-progress">
        Frage {questionIndex + 1} von {sortedQuestions.length}
      </div>

      <div className="quiz-progress">Erfolgsquote: {accuracy}%</div>

      <div className="quiz-question-box">
        <div className="quiz-question">{question.question}</div>
      </div>

      <div className="quiz-options-box">
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
              {String.fromCharCode(65 + index)}) {option.text}
            </div>
          );
        })}
      </div>

      <div className="result-box">
        {!checked && (
          <div>
            <span className="footer-key">ENTER</span> Prüfen
          </div>
        )}

        {checked && (
          <>
            <div className={isCorrect ? "result-correct" : "result-wrong"}>
              {isCorrect ? "RICHTIG" : "FALSCH"}
            </div>

            {question.explanation && (
              <div className="result-explanation">{question.explanation}</div>
            )}

            <div className="result-next">
              <span className="footer-key">ENTER</span> Weiter
            </div>
          </>
        )}
      </div>

      <div className="status-line">
        <span>ESC Zurück</span>
        <span>{quizSet.title}</span>
      </div>
    </div>
  );
}