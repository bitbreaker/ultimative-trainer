import { useEffect, useMemo, useState } from "react";
import { useWindowKeydown } from "../hooks/useWindowKeydown";
import { shuffleArray } from "../lib/shuffle";
import { loadAllStats, saveAllStats, updateQuestionStats } from "../lib/stats";
import type { QuizOption, QuizQuestion, QuizSet } from "../types/quiz";
import { QuestionMediaGallery } from "./QuestionMediaGallery";

type Props = {
  quizSet: QuizSet;
  sheetNumber: number;
  onBack: () => void;
};

type PreparedQuestion = {
  question: QuizQuestion;
  options: QuizOption[];
};

type ExamResult = {
  totalCorrect: number;
  totalWrong: number;
  unanswered: number;
  basisCorrect: number;
  basisTotal: number;
  seeCorrect: number;
  seeTotal: number;
  accuracy: number;
};

function getExamResult(
  questions: PreparedQuestion[],
  answers: Record<string, string | undefined>
): ExamResult {
  let totalCorrect = 0;
  let unanswered = 0;
  let basisCorrect = 0;
  let basisTotal = 0;
  let seeCorrect = 0;
  let seeTotal = 0;

  for (const item of questions) {
    const selectedAnswer = answers[item.question.id];
    const wasCorrect = Boolean(
      selectedAnswer && item.question.correctOptionIds.includes(selectedAnswer)
    );

    if (!selectedAnswer) {
      unanswered += 1;
    }

    if (wasCorrect) {
      totalCorrect += 1;
    }

    if (item.question.categoryId === "basis") {
      basisTotal += 1;
      if (wasCorrect) {
        basisCorrect += 1;
      }
    } else {
      seeTotal += 1;
      if (wasCorrect) {
        seeCorrect += 1;
      }
    }
  }

  const totalWrong = questions.length - totalCorrect;
  const accuracy =
    questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  return {
    totalCorrect,
    totalWrong,
    unanswered,
    basisCorrect,
    basisTotal,
    seeCorrect,
    seeTotal,
    accuracy,
  };
}

export function ExamScreen({ quizSet, sheetNumber, onBack }: Props) {
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, string | undefined>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setPreparedQuestions(
      quizSet.questions.map((question) => ({
        question,
        options: shuffleArray(question.options),
      }))
    );
    setQuestionIndex(0);
    setSelectedOptionIndex(null);
    setAnswers({});
    setSubmitted(false);
  }, [quizSet]);

  const current = preparedQuestions[questionIndex];
  const question = current?.question;
  const options = current?.options ?? [];

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter(Boolean).length;
  }, [answers]);

  useEffect(() => {
    if (!question) {
      return;
    }

    const selectedAnswer = answers[question.id];
    const foundIndex = options.findIndex((option) => option.id === selectedAnswer);
    setSelectedOptionIndex(foundIndex >= 0 ? foundIndex : null);
  }, [question?.id, answers, options]);

  const result = useMemo(() => {
    return getExamResult(preparedQuestions, answers);
  }, [preparedQuestions, answers]);

  function handleSelectOption(index: number) {
    if (submitted) {
      return;
    }

    const selectedOption = options[index];
    if (!selectedOption || !question) {
      return;
    }

    setSelectedOptionIndex(index);
    setAnswers((previous) => ({
      ...previous,
      [question.id]: selectedOption.id,
    }));
  }

  function finalizeExam() {
    if (submitted) {
      return;
    }

    let allStats = loadAllStats();

    for (const item of preparedQuestions) {
      const selectedAnswer = answers[item.question.id];
      const wasCorrect = Boolean(
        selectedAnswer && item.question.correctOptionIds.includes(selectedAnswer)
      );

      allStats = updateQuestionStats(allStats, quizSet.id, item.question.id, wasCorrect);
    }

    saveAllStats(allStats);
    setSubmitted(true);
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

    if (!submitted && event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedOptionIndex((previous) => {
        if (previous === null) {
          return options.length - 1;
        }
        return (previous - 1 + options.length) % options.length;
      });
      return;
    }

    if (!submitted && event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedOptionIndex((previous) => {
        if (previous === null) {
          return 0;
        }
        return (previous + 1) % options.length;
      });
      return;
    }

    if (!submitted && event.key === "Enter") {
      event.preventDefault();
      if (selectedOptionIndex !== null) {
        handleSelectOption(selectedOptionIndex);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setQuestionIndex((previous) => Math.max(0, previous - 1));
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      setQuestionIndex((previous) =>
        Math.min(preparedQuestions.length - 1, previous + 1)
      );
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

  const progressPercent =
    preparedQuestions.length > 0
      ? Math.round((answeredCount / preparedQuestions.length) * 100)
      : 0;

  const selectedAnswer = answers[question.id];

  return (
    <div className="quiz-screen exam-screen">
      <div className="screen-scroll-area">
        <div className="session-panel session-panel-minimal">
          <div className="session-panel-topline">
            <div className="session-chip accent">
              Bogen {String(sheetNumber).padStart(2, "0")}
            </div>
          </div>

          <div className="progress-row">
            <div className="progress-meta">
              <span>
                Frage {questionIndex + 1} / {preparedQuestions.length}
              </span>
              <span>
                {answeredCount}/{preparedQuestions.length} beantwortet
              </span>
            </div>

            <div className="progress-track" aria-hidden="true">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="exam-jump-grid">
            {preparedQuestions.map((item, index) => {
              const answer = answers[item.question.id];
              const isCurrent = index === questionIndex;
              const isAnswered = Boolean(answer);
              const isCorrect = submitted
                ? Boolean(answer && item.question.correctOptionIds.includes(answer))
                : false;

              let className = "exam-jump-button";

              if (isCurrent) {
                className += " is-current";
              }

              if (isAnswered) {
                className += " is-answered";
              }

              if (submitted) {
                className += isCorrect ? " is-correct" : " is-wrong";
              }

              return (
                <button
                  key={item.question.id}
                  type="button"
                  className={className}
                  onClick={() => setQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {submitted ? (
          <div className="stats-grid compact-gap">
            <div className="panel stat-card">
              <div className="stat-label">Gesamt</div>
              <div className="stat-value">
                {result.totalCorrect} / {preparedQuestions.length}
              </div>
              <div className="mini-bar">
                <div
                  className="mini-bar-fill"
                  style={{ width: `${result.accuracy}%` }}
                />
              </div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Basis</div>
              <div className="stat-value">
                {result.basisCorrect} / {result.basisTotal}
              </div>
              <div className="mini-bar">
                <div
                  className="mini-bar-fill"
                  style={{
                    width: `${
                      result.basisTotal > 0
                        ? Math.round((result.basisCorrect / result.basisTotal) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">See</div>
              <div className="stat-value">
                {result.seeCorrect} / {result.seeTotal}
              </div>
              <div className="mini-bar">
                <div
                  className="mini-bar-fill"
                  style={{
                    width: `${
                      result.seeTotal > 0
                        ? Math.round((result.seeCorrect / result.seeTotal) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="panel stat-card">
              <div className="stat-label">Offen</div>
              <div className="stat-value">{result.unanswered}</div>
              <div className="stat-note">Offene Fragen zählen als falsch.</div>
            </div>
          </div>
        ) : null}

        <div className="panel quiz-question-panel">
          <div className="quiz-question">{question.question}</div>
        </div>

        {question.media && question.media.length > 0 ? (
          <QuestionMediaGallery questionId={question.id} media={question.media} />
        ) : null}

        <div className="quiz-options">
          {options.map((option, index) => {
            const isFocused = selectedOptionIndex === index;
            const isSelected = option.id === selectedAnswer;
            const isRightAnswer = question.correctOptionIds.includes(option.id);

            let className = "quiz-option";

            if (!submitted && isFocused) {
              className += " focused";
            }

            if (!submitted && isSelected) {
              className += " is-marked";
            }

            if (submitted && isSelected && !isRightAnswer) {
              className += " wrong";
            }

            if (submitted && isRightAnswer) {
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
      </div>

      <div className="action-bar exam-action-bar">
        <button type="button" className="action-button" onClick={onBack}>
          Zurück
        </button>

        <button
          type="button"
          className="action-button"
          onClick={() => setQuestionIndex((previous) => Math.max(0, previous - 1))}
          disabled={questionIndex === 0}
        >
          Vorherige
        </button>

        {!submitted ? (
          questionIndex < preparedQuestions.length - 1 ? (
            <button
              type="button"
              className="action-button primary"
              onClick={() =>
                setQuestionIndex((previous) =>
                  Math.min(preparedQuestions.length - 1, previous + 1)
                )
              }
            >
              Nächste
            </button>
          ) : (
            <button
              type="button"
              className="action-button primary"
              onClick={finalizeExam}
            >
              Abgeben
            </button>
          )
        ) : (
          <button
            type="button"
            className="action-button primary"
            onClick={() =>
              setQuestionIndex((previous) =>
                Math.min(preparedQuestions.length - 1, previous + 1)
              )
            }
            disabled={questionIndex >= preparedQuestions.length - 1}
          >
            Nächste
          </button>
        )}
      </div>
    </div>
  );
}