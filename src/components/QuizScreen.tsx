import { useEffect, useMemo, useState } from "react";
import { shuffleArray } from "../lib/shuffle";
import {
  buildSessionQuestions,
  getAccuracy,
  getQuestionStats,
  getSetStats,
  loadAllStats,
  saveAllStats,
  updateQuestionStats,
} from "../lib/stats";
import { useWindowKeydown } from "../hooks/useWindowKeydown";
import type { QuizMedia, QuizQuestion, QuizSet } from "../types/quiz";

type Props = {
  quizSet: QuizSet;
  onBack: () => void;
};

type QuestionMediaGalleryProps = {
  questionId: string;
  media: QuizMedia[];
};

function resolveMediaSrc(src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("data:")) {
    return src;
  }

  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, "")}`;
}

function QuestionMediaGallery({ questionId, media }: QuestionMediaGalleryProps) {
  const [failedSources, setFailedSources] = useState<string[]>([]);

  useEffect(() => {
    setFailedSources([]);
  }, [questionId]);

  return (
    <div className="quiz-media-grid">
      {media.map((item) => {
        const key = `${questionId}-${item.src}`;
        const hasFailed = failedSources.includes(item.src);

        if (hasFailed) {
          return (
            <div key={key} className="quiz-media-missing">
              Bilddatei nicht gefunden: {item.src}
            </div>
          );
        }

        return (
          <figure key={key} className="quiz-media-card">
            <img
              className="quiz-media-image"
              src={resolveMediaSrc(item.src)}
              alt={item.alt ?? `Abbildung zu ${questionId}`}
              loading="lazy"
              onError={() => {
                setFailedSources((previous) => {
                  if (previous.includes(item.src)) {
                    return previous;
                  }

                  return [...previous, item.src];
                });
              }}
            />

            {item.caption ? (
              <figcaption className="quiz-media-caption">{item.caption}</figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}

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
    const preparedQuestions = buildSessionQuestions(quizSet.questions, setStats);

    setSessionQuestions(preparedQuestions);
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
  const isLastQuestion = questionIndex >= sessionQuestions.length - 1;
  const accuracyLabel = currentStat?.shown ? `${accuracy}%` : "Neu";

  useEffect(() => {
    setSelectedOptionIndex(0);
    setChecked(false);
    setIsCorrect(false);
  }, [question?.id]);

  function handleSelectOption(index: number) {
    if (checked) {
      return;
    }

    setSelectedOptionIndex(index);
  }

  function handleCheck() {
    if (!question || checked || shuffledOptions.length === 0) {
      return;
    }

    const selectedOption = shuffledOptions[selectedOptionIndex];

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

    if (!question || shuffledOptions.length === 0) {
      return;
    }

    if (!checked && event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedOptionIndex((previous) => {
        return (previous - 1 + shuffledOptions.length) % shuffledOptions.length;
      });
      return;
    }

    if (!checked && event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedOptionIndex((previous) => {
        return (previous + 1) % shuffledOptions.length;
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
        <div className="menu-title">TRAINING</div>

        <div className="screen-scroll-area">
          <div className="quiz-question-box">
            <div className="quiz-question">Keine Fragen gefunden.</div>
          </div>
        </div>

        <div className="action-bar">
          <button type="button" className="action-button primary" onClick={onBack}>
            Zurück
          </button>
        </div>

        <div className="status-line">
          <span>{quizSet.title}</span>
          <span>Keine Daten</span>
        </div>
      </div>
    );
  }

  const explanation = question.explanation?.trim();

  return (
    <div className="quiz-screen">
      <div className="menu-title">TRAINING</div>

      <div className="screen-scroll-area">
        <div className="quiz-meta">
          <div className="quiz-progress">
            Frage {questionIndex + 1} von {sessionQuestions.length}
          </div>
          <div className="quiz-progress">Erfolgsquote: {accuracyLabel}</div>
        </div>

        <div className="quiz-question-box">
          <div className="quiz-question">{question.question}</div>
        </div>

        {question.media && question.media.length > 0 ? (
          <QuestionMediaGallery questionId={question.id} media={question.media} />
        ) : null}

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
          <div className="quiz-hint">
            <span className="highlight">ENTER</span> oder Button zum Prüfen
          </div>
        ) : (
          <>
            <div className={`quiz-result ${isCorrect ? "correct" : "wrong"}`}>
              {isCorrect ? "RICHTIG" : "FALSCH"}
            </div>

            {explanation ? <div className="quiz-explanation">{explanation}</div> : null}
          </>
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
          disabled={shuffledOptions.length === 0}
        >
          {!checked ? "Prüfen" : isLastQuestion ? "Zur Set-Auswahl" : "Weiter"}
        </button>
      </div>

      <div className="status-line">
        <span>{quizSet.title}</span>
        <span>{!checked ? "↑↓ oder Tap zum Wählen" : "Enter oder Tap für weiter"}</span>
      </div>
    </div>
  );
}
