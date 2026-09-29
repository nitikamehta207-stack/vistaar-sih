// Transparent trainer-matching formula. Every factor and its weight is visible
// in the breakdown so "why this match?" always has a real, inspectable answer.
export const MATCH_WEIGHTS = [
  { key: "skill", label: "Skill overlap", weight: 40 },
  { key: "experience", label: "Experience", weight: 20 },
  { key: "rating", label: "Trainee ratings", weight: 20 },
  { key: "certification", label: "Certifications", weight: 10 },
  { key: "availability", label: "Availability", weight: 10 },
];

const norm = (s) => s.toLowerCase().trim();
const yearsOf = (t) => parseInt(t.experience, 10) || 0;

// No live "availability" data exists yet, so we approximate it from current course load —
// a trainer running more courses is modelled as less available. This is a placeholder
// until real scheduling/availability data is wired in.
const availabilityOf = (t) => Math.max(40, Math.min(95, 100 - (t.courses || 0) * 8));

export function scoreTrainer(trainer, requiredSkills) {
  const have = (trainer.expertise || []).map(norm);
  const required = requiredSkills.map(norm);
  const matched = requiredSkills.filter((r) => have.includes(norm(r)));

  const raw = {
    skill: required.length ? (matched.length / required.length) * 100 : 0,
    experience: Math.min(yearsOf(trainer) / 15, 1) * 100,
    rating: Math.max(0, Math.min(((trainer.rating - 4) / 1) * 100, 100)),
    certification: Math.min((trainer.certifications || []).length / 3, 1) * 100,
    availability: availabilityOf(trainer),
  };

  const breakdown = MATCH_WEIGHTS.map((w) => ({
    ...w,
    value: Math.round(raw[w.key]),
    points: Math.round((raw[w.key] * w.weight) / 100),
  }));

  const total = Math.round(breakdown.reduce((sum, b) => sum + b.points, 0));

  return { total, breakdown, matched };
}

export function breakdownToTooltip(breakdown) {
  return breakdown.map((b) => `${b.label}: ${b.points}/${b.weight} pts (${b.value}%)`).join("\n");
}