import { clozeQuestions, extractDefinitions, guessTitle, splitSentences, STOPWORDS } from "./offline-generator";

export { extractDefinitions };
import type { Flashcard, KeyTerm, NoteSection, StudyNotes } from "./types";

/**
 * Heuristic notes + flashcards, used when no Claude API key is configured or the
 * API call fails. Everything here is extractive: it reorganizes the user's own
 * sentences rather than inventing content.
 */

function trimSentence(s: string): string {
  return s.replace(/\s+/g, " ").trim().replace(/[.;:]+$/, "");
}

/** Split material into titled chunks using markdown headings or blank lines. */
function chunk(material: string): { heading: string | null; text: string }[] {
  const lines = material.replace(/\r/g, "").split("\n");
  const chunks: { heading: string | null; text: string }[] = [];
  let current: { heading: string | null; lines: string[] } = { heading: null, lines: [] };
  const flush = () => {
    const text = current.lines.join("\n").trim();
    if (text) chunks.push({ heading: current.heading, text });
  };
  for (const raw of lines) {
    const line = raw.trim();
    const heading =
      line.match(/^#{1,6}\s+(.+)$/)?.[1] ??
      // A short line ending in a colon, or a short line with no sentence punctuation followed by content.
      (line.length > 0 && line.length <= 60 && /:$/.test(line) ? line.replace(/:$/, "") : null);
    if (heading) {
      flush();
      current = { heading: heading.trim(), lines: [] };
    } else if (!line && current.lines.length) {
      flush();
      current = { heading: null, lines: [] };
    } else if (line) {
      current.lines.push(line);
    }
  }
  flush();
  return chunks;
}

export function offlineNotes(material: string): StudyNotes {
  // Markdown headings are titles, not facts: keep them out of the summary and points.
  const body = material.replace(/^\s*#{1,6}\s+.*$/gm, "");
  const sentences = splitSentences(body).map(trimSentence);
  const chunks = chunk(material);

  let sections: NoteSection[];
  const structured = chunks.length >= 2 && chunks.some((c) => c.heading);
  if (structured) {
    sections = chunks
      .map((c, i) => ({
        heading: c.heading ?? (i === 0 ? "Overview" : `Part ${i + 1}`),
        points: splitSentences(c.text).map(trimSentence).slice(0, 8),
      }))
      .filter((s) => s.points.length);
  } else {
    // No structure: group consecutive sentences into sections of ~5.
    const size = sentences.length <= 6 ? sentences.length : 5;
    sections = [];
    for (let i = 0; i < sentences.length; i += size) {
      const points = sentences.slice(i, i + size);
      sections.push({ heading: sectionHeading(points, sections.length), points });
    }
  }

  return {
    summary: sentences.slice(0, 2).join(". ") + (sentences.length ? "." : ""),
    sections: sections.slice(0, 12),
    keyTerms: extractDefinitions(material).slice(0, 15).map(({ term, definition }) => ({ term, definition })),
  };
}

function sectionHeading(points: string[], index: number): string {
  const freq = new Map<string, number>();
  for (const p of points) {
    for (const w of p.match(/\b[A-Za-z][a-z-]{3,}\b|\b[A-Z][A-Za-z]+\b/g) ?? []) {
      if (STOPWORDS.has(w.toLowerCase())) continue;
      freq.set(w, (freq.get(w) ?? 0) + (/^[A-Z]/.test(w) ? 2 : 1));
    }
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return top ? top[0].toUpperCase() + top.slice(1) : `Part ${index + 1}`;
}

export function offlineFlashcards(material: string, max = 20): Flashcard[] {
  const cards: Flashcard[] = [];
  const fronts = new Set<string>();
  const push = (c: Flashcard) => {
    if (fronts.has(c.front.toLowerCase()) || cards.length >= max) return;
    fronts.add(c.front.toLowerCase());
    cards.push(c);
  };
  for (const { question, definition } of extractDefinitions(material)) {
    push({ front: question, back: definition });
  }
  for (const q of clozeQuestions(material, max)) {
    push({ front: q.prompt.replace(/^Fill in the blank:\s*/, ""), back: q.options[q.answerIndex] });
  }
  return cards;
}

export function offlineStudySet(material: string) {
  return {
    title: guessTitle(material).replace(/ quiz$/, " study set").replace(/^Notes study set$/, "Study set"),
    notes: offlineNotes(material),
    flashcards: offlineFlashcards(material),
  };
}
