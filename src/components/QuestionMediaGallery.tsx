import { useMemo, useState } from "react";
import type { QuizMedia } from "../types/quiz";

type Props = {
  questionId: string;
  media: QuizMedia[];
};

function resolveMediaSrc(src: string): string {
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, "")}`;
}

export function QuestionMediaGallery({ questionId, media }: Props) {
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  const preparedMedia = useMemo(() => {
    return media.map((item, index) => ({
      key: `${questionId}-${index}-${item.src}`,
      ...item,
      resolvedSrc: resolveMediaSrc(item.src),
    }));
  }, [media, questionId]);

  return (
    <div className="quiz-media-grid">
      {preparedMedia.map((item) => {
        const hasFailed = failed[item.key];

        if (hasFailed) {
          return (
            <div key={item.key} className="quiz-media-missing">
              <div>Bild konnte nicht geladen werden.</div>
              <div>{item.src}</div>
            </div>
          );
        }

        return (
          <div key={item.key} className="quiz-media-card">
            <img
              className="quiz-media-image"
              src={item.resolvedSrc}
              alt={item.alt ?? `Bild zu ${questionId}`}
              loading="lazy"
              onError={() =>
                setFailed((previous) => ({
                  ...previous,
                  [item.key]: true,
                }))
              }
            />
            {item.caption ? (
              <div className="quiz-media-caption">{item.caption}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}