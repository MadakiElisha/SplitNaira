import type { ReactNode } from "react";

function renderInline(text: string, blockIndex: number) {
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  const fragments: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let inlineIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      fragments.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      fragments.push(
        <a
          key={`link-${blockIndex}-${inlineIndex}`}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      fragments.push(<strong key={`strong-${blockIndex}-${inlineIndex}`}>{match[3]}</strong>);
    } else if (match[4]) {
      fragments.push(<em key={`em-${blockIndex}-${inlineIndex}`}>{match[4]}</em>);
    }

    lastIndex = pattern.lastIndex;
    inlineIndex += 1;
  }

  if (lastIndex < text.length) {
    fragments.push(text.slice(lastIndex));
  }

  return fragments;
}

export function renderRichText(value: string) {
  const blocks: ReactNode[] = [];
  const lines = value.split(/\r?\n/);
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];
  let blockIndex = 0;

  function flushParagraph() {
    if (!paragraphBuffer.length) {
      return;
    }

    blocks.push(
      <p key={`paragraph-${blockIndex}`}>
        {renderInline(paragraphBuffer.join(" "), blockIndex)}
      </p>
    );
    paragraphBuffer = [];
    blockIndex += 1;
  }

  function flushList() {
    if (!listBuffer.length) {
      return;
    }

    blocks.push(
      <ul key={`list-${blockIndex}`}>
        {listBuffer.map((item, itemIndex) => (
          <li key={`list-${blockIndex}-${itemIndex}`}>{renderInline(item, blockIndex + itemIndex)}</li>
        ))}
      </ul>
    );
    listBuffer = [];
    blockIndex += 1;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push(<h2 key={`heading-${blockIndex}`}>{renderInline(line.slice(2), blockIndex)}</h2>);
      blockIndex += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`subheading-${blockIndex}`}>{renderInline(line.slice(3), blockIndex)}</h3>
      );
      blockIndex += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(
        <blockquote key={`quote-${blockIndex}`}>
          {renderInline(line.slice(2), blockIndex)}
        </blockquote>
      );
      blockIndex += 1;
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      listBuffer.push(line.slice(2));
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
