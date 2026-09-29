import { supabase } from "../lib/supabase";

export async function getQuestionAnalytics(assessmentId) {
  const { data, error } = await supabase
    .from("assessment_answers")
    .select(`
      question_id,
      is_correct,
      skill,
      assessment_attempts!inner(
        assessment_id
      )
    `)
    .eq("assessment_attempts.assessment_id", assessmentId);

  if (error) {
    throw new Error(error.message);
  }

  const grouped = {};

  for (const row of data) {
    if (!grouped[row.question_id]) {
      grouped[row.question_id] = {
        questionId: row.question_id,
        total: 0,
        wrong: 0,
        skill: row.skill,
      };
    }

    grouped[row.question_id].total++;

    if (!row.is_correct) {
      grouped[row.question_id].wrong++;
    }
  }

  return Object.values(grouped).map((q) => ({
    ...q,
    wrongPct: Math.round((q.wrong / q.total) * 100),
  }));
}