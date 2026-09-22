import React from "react";
import styles from "./MarkdownArticle.module.css";

function safeHref(href: string) {
  // Never turn untrusted article text into javascript: or protocol-relative links.
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (/^https?:\/\/[^ \t\r\n]+$/i.test(href)) return href;
  return null;
}

function inlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));

    if (match[1]) {
      parts.push(<strong key={index}>{match[1]}</strong>);
    } else {
      const href = safeHref(match[3]);
      parts.push(
        href ? (
          <a key={index} href={href}>{match[2]}</a>
        ) : (
          <React.Fragment key={index}>{match[0]}</React.Fragment>
        ),
      );
    }
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// A row consisting only of article links and middle dots is navigation,
// not a paragraph containing visible Markdown syntax.
function getActionLinks(line: string) {
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const matches = [...line.matchAll(pattern)];
  if (matches.length < 2) return null;
  const remainder = line.replace(pattern, "").replace(/[·|\s]/g, "");
  if (remainder) return null;

  const links = matches.map((match) => ({ text: match[1], href: safeHref(match[2]) }));
  return links.every((link) => link.href) ? links as { text: string; href: string }[] : null;
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
      const actionLinks = getActionLinks(line);
      if (actionLinks) {
        blocks.push(
          <nav className={styles.actionLinks} aria-label="Les videre" key={blocks.length}>
            {actionLinks.map((link) => (
              <a className={styles.actionLink} key={link.href} href={link.href}>{link.text} <span aria-hidden="true">↗</span></a>
            ))}
          </nav>,
        );
      } else {
        blocks.push(<p key={blocks.length}>{inlineMarkdown(line)}</p>);
      }
    }
  }

  flushList();

  return <div className={styles.prose}>{blocks}</div>;
}
