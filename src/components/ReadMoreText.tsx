"use client";

import { useState } from "react";

export function ReadMoreText({
  text,
  initialLength = 520,
  actionHref = "#kontakt",
  actionLabel = "Be om komplett tilbud",
}: {
  text: string;
  initialLength?: number;
  actionHref?: string;
  actionLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const looksSourceTruncated = /\.\.\.$/.test(text.trim());
  const shouldTruncate = text.length > initialLength;
  const showAction = shouldTruncate || looksSourceTruncated;
  const visibleText = shouldTruncate && !expanded ? `${text.slice(0, initialLength).trim()}...` : text;

  return (
    <div className="read-more-text">
      <p>{visibleText}</p>
      {showAction && (
        <div className="read-more-actions">
          {shouldTruncate && (
            <button type="button" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Vis mindre" : "Les mer"}
            </button>
          )}
          {(!shouldTruncate || expanded || looksSourceTruncated) && <a href={actionHref}>{actionLabel}</a>}
        </div>
      )}
    </div>
  );
}
