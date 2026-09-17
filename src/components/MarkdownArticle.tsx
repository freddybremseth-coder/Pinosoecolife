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

export default function MarkdownArticle({ markdown }: { markdown: string }) {
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];

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
      blocks.push(<h1 key={blocks.length}>{inlineMarkdown(line.slice(2))}</h1>);
    } else {
      blocks.push(<p key={blocks.length}>{inlineMarkdown(line)}</p>);
    }
  }

  flushList();

  return <div className={styles.prose}>{blocks}</div>;
}
