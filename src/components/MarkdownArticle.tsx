import React from "react";
import styles from "./MarkdownArticle.module.css";

function inlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function MarkdownArticle({
  markdown,
  skipFirstH1 = false,
}: {
  markdown: string;
  skipFirstH1?: boolean;
}) {
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let firstH1Handled = false;

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems;
    listItems = [];
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {items.map((item, index) => (
          <li key={index}>{inlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
  };

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    flushList();

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={blocks.length}>{inlineMarkdown(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={blocks.length}>{inlineMarkdown(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      if (skipFirstH1 && !firstH1Handled) {
        firstH1Handled = true;
        continue;
      }
      firstH1Handled = true;
      blocks.push(<h2 key={blocks.length}>{inlineMarkdown(line.slice(2))}</h2>);
    } else {
      blocks.push(<p key={blocks.length}>{inlineMarkdown(line)}</p>);
    }
  }

  flushList();

  return <div className={styles.prose}>{blocks}</div>;
}
