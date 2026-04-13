import { useEffect, useState } from "react";
import { useWindowKeydown } from "../hooks/useWindowKeydown";
import { shuffleArray } from "../lib/shuffle";
import {
  buildSessionQuestions,
  getSetStats,
  loadAllStats,
  saveAllStats,
  updateQuestionStats,
} from "../lib/stats";
import type { QuizOption, QuizQuestion, QuizSet } from "../types/quiz";
import { QuestionMediaGallery } from "./QuestionMediaGallery";

type Props = {
  quizSet: QuizSet;
  sessionLabel: string;
  onBack: () => void;
};

type PreparedQuestion = {
  question: QuizQuestion;
  options: QuizOption[];
};

function countTrue(values: boolean[]): number {
  return values.filter(Boolean).length;
}

export function QuizScreen({ quizSet, sessionLabel, onBack }: Props) {
  const [allStats, setAllStats] = useState(() => loadAllStats());
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>(
    []
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);

  useEffect(() => {
    const latestAllStats = loadAllStats();
    const setStats = getSetStats(latestAllStats, quizSet.id);
    const orderedQuestions = buildSessionQuestions(quizSet.questions, setStats);

    setAllStats(latestAllStats);
    setPreparedQuestions(
      orderedQuestions.map((question) => ({
        question,
        options: shuffleArray(question.options),
      }))
    );
    setQuestionIndex(0);
    setSelectedOptionIndex(null);
    setChecked(false);
    setIsCorrect(false);
    setSessionResults([]);
  }, [quizSet]);

  const current = preparedQuestions[questionIndex];
  const question = current?.question;
  const options = current?.options ?? [];
  const isLastQuestion = questionIndex >= preparedQuestions.length - 1;

  useEffect(() => {
    setSelectedOptionIndex(null);
    setChecked(false);
    setIsCorrect(false);
  }, [question?.id]);

  const sessionCorrectCount = countTrue(sessionResults);
  const completedCount = questionIndex + (checked ? 1 : 0);
  const progressPercent =
    preparedQuestions.length > 0
      ? Math.round((completedCount / preparedQuestions.length) * 100)
      : 0;

  function handleSelectOption(index: number) {
    if (checked) {
      return;
    }

    setSelectedOptionIndex(index);
  }

  function handleCheck() {
    if (
      !question ||
      checked ||
      options.length === 0 ||
      selectedOptionIndex === null
    ) {
      return;
    }

    const selectedOption = options[selectedOptionIndex];

    if (!selectedOption) {
      return;
    }

    const wasCorrect = question.correctOptionIds.includes(selectedOption.id);
    const updatedAllStats = updateQuestionStats(
      allStats,
      quizSet.id,
      question.id,
      wasCorrect
    );

    setIsCorrect(wasCorrect);
    setChecked(true);
    setSessionResults((previous) => [...previous, wasCorrect]);
    setAllStats(updatedAllStats);
    saveAllStats(updatedAllStats);
  }

  function handleNext() {
    if (isLastQuestion) {
      onBack();
      return;
    }

    setQuestionIndex((previous) => previous + 1);
  }

  function handlePrimaryAction() {
    if (!checked) {
      handleCheck();
      return;
    }

    handleNext();
  }

  useWindowKeydown((event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onBack();
      return;
    }

    if (!question || options.length === 0) {
      return;
    }

    if (!checked && event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedOptionIndex((previous) => {
        if (previous === null) {
          return options.length - 1;
        }
        return (previous - 1 + options.length) % options.length;
      });
      return;
    }

    if (!checked && event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedOptionIndex((previous) => {
        if (previous === null) {
          return 0;
        }
        return (previous + 1) % options.length;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handlePrimaryAction();
    }
  });

  if (!question) {
    return (
      <div className="quiz-screen">
        <div className="screen-scroll-area">
          <div className="panel quiz-question-panel">
            <div className="quiz-question">Keine Fragen gefunden.</div>
          </div>
        </div>

        <div className="action-bar">
          <button type="button" className="action-button primary" onClick={onBack}>
            Zurück
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-screen">
      <div className="screen-scroll-area">
        <div className="session-panel session-panel-minimal">
          <div className="session-panel-topline">
            <div className="session-chip accent">{sessionLabel}</div>
          </div>

          <div className="progress-row">
            <div className="progress-meta">
              <span>
                Frage {questionIndex + 1} / {preparedQuestions.length}
              </span>
              <span>
                {sessionCorrectCount}/{sessionResults.length || 0} richtig
              </span>
            </div>

            <div className="progress-track" aria-hidden="true">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="panel quiz-question-panel">
          <div className="quiz-question">{question.question}</div>
        </div>

        {question.media && question.media.length > 0 ? (
          <QuestionMediaGallery questionId={question.id} media={question.media} />
        ) : null}

        <div className="quiz-options">
          {options.map((option, index) => {
            const isFocused = selectedOptionIndex === index;
            const isRightAnswer = question.correctOptionIds.includes(option.id);

            let className = "quiz-option";

            if (!checked && isFocused) {
              className += " focused";
            }

            if (checked && isFocused && !isCorrect) {
              className += " wrong";
            }

            if (checked && isRightAnswer) {
              className += " correct";
            }

            return (
              <button
                key={option.id}
                type="button"
                className={className}
                onClick={() => handleSelectOption(index)}
              >
                <span className="quiz-option-label">
                  {String.fromCharCode(65 + index)})
                </span>
                <span className="quiz-option-text">{option.text}</span>
              </button>
            );
          })}
        </div>

        {!checked ? (
          <div className="panel panel-compact quiz-hint-panel">
            <span className="highlight">↑↓</span> wählen oder tippen ·{" "}
            <span className="highlight">ENTER</span> prüfen
          </div>
        ) : (
          <div
            className={`panel panel-compact quiz-result-panel ${
              isCorrect ? "is-correct" : "is-wrong"
            }`}
          >
            {isCorrect ? "RICHTIG" : "FALSCH"}
          </div>
        )}
      </div>

      <div className="action-bar">
        <button type="button" className="action-button" onClick={onBack}>
          Zurück
        </button>
        <button
          type="button"
          className="action-button primary"
          onClick={handlePrimaryAction}
          disabled={options.length === 0 || (!checked && selectedOptionIndex === null)}
        >
          {!checked ? "Prüfen" : isLastQuestion ? "Zurück zur Auswahl" : "Weiter"}
        </button>
      </div>
    </div>
  );
}