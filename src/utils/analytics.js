import { sampleQuiz } from "../data/assessments";

// Simple deterministic hash so the same assessment+question
// always produces the same illustrative numbers.
function hash(str) {
  let h = 0;

  for (const ch of str) {
    h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  }

  return h;
}

// Returns:
// [{ index, text, wrongPct }]
// sorted hardest-first.
export function getQuestionStats(assessment) {
  const hasRealQuestions =
    assessment.id === sampleQuiz.id &&
    sampleQuiz.questions?.length;

  const count = assessment.questions || 0;

  const rows = Array.from(
    { length: count },
    (_, i) => {
      const text = hasRealQuestions
        ? sampleQuiz.questions[i]?.text
        : `Question ${i + 1}`;

      const seed = hash(
        `${assessment.id}-${i}`
      );

      // IMPORTANT:
      // These are currently illustrative/demo values.
      const wrongPct = 15 + (seed % 65);

      return {
        index: i + 1,
        text:
          text ||
          `Question ${i + 1}`,
        wrongPct,
      };
    }
  );

  return rows.sort(
    (a, b) => b.wrongPct - a.wrongPct
  );
}