import { supabase } from "../lib/supabase";

export async function getUserSkillScores(traineeId) {
  const { data, error } = await supabase
    .from("assessment_answers")
    .select(`
      skill,
      is_correct,
      assessment_attempts!inner(
        trainee_id
      )
    `)
    .eq("assessment_attempts.trainee_id", traineeId)
    .not("skill", "is", null);

  if (error) {
    throw new Error(error.message);
  }

  const skills = {};

  for (const row of data) {
    if (!skills[row.skill]) {
      skills[row.skill] = {
        total: 0,
        correct: 0,
      };
    }

    skills[row.skill].total++;

    if (row.is_correct) {
      skills[row.skill].correct++;
    }
  }

  return Object.entries(skills).map(([name, value]) => ({
    name,
    value: Math.round(
      (value.correct / value.total) * 100
    ),
  }));
}