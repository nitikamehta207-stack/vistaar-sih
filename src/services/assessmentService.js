import { supabase } from "../lib/supabase";

export async function saveAssessmentAttempt({
  traineeId,
  assessmentId,
  score,
  totalQuestions,
  percentage,
  timeTakenSeconds,
  answers,
  questions,
}) {
  // 1. Save the assessment attempt
  const { data: attempt, error: attemptError } =
    await supabase
      .from("assessment_attempts")
      .insert({
        trainee_id: traineeId,
        assessment_id: assessmentId,
        score: score,
        total_questions: totalQuestions,
        percentage: percentage,
        time_taken_seconds: timeTakenSeconds,
      })
      .select()
      .single();

  if (attemptError) {
    console.error(
      "Error saving assessment attempt:",
      attemptError
    );

    throw new Error(
      attemptError.message ||
        "Could not save assessment attempt."
    );
  }

  // 2. Prepare individual question answers
  const answerRows = questions.map((question) => ({
    attempt_id: attempt.id,
    question_id: question.id,

    selected_answer:
      answers[question.id] !== undefined
        ? answers[question.id]
        : null,

    correct_answer: question.answer,

    is_correct:
      answers[question.id] === question.answer,

    skill: question.skill || null,
  }));

  // 3. Save individual answers
  const { error: answersError } =
    await supabase
      .from("assessment_answers")
      .insert(answerRows);

  if (answersError) {
    console.error(
      "Error saving assessment answers:",
      answersError
    );

    throw new Error(
      answersError.message ||
        "Could not save assessment answers."
    );
  }

  // 4. Return the saved attempt
  return attempt;
}