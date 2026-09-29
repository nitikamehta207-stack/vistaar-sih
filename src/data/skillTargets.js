// Target proficiency (0-100) expected for each skill, grouped by designation.
// Add more designations here as needed — falls back to a generic default set.
export const roleTargets = {
  "Program Associate": [
    { skill: "Artificial Intelligence", target: 85 },
    { skill: "Python", target: 75 },
    { skill: "Data Analytics", target: 85 },
    { skill: "Leadership", target: 80 },
    { skill: "Public Communication", target: 75 },
    { skill: "Cybersecurity", target: 60 },
  ],
  default: [
    { skill: "Artificial Intelligence", target: 70 },
    { skill: "Data Analytics", target: 70 },
    { skill: "Leadership", target: 70 },
    { skill: "Public Communication", target: 65 },
    { skill: "Cybersecurity", target: 55 },
  ],
};

// Maps a skill name to the course category that best builds it (used for recommendations).
export const skillToCourseCategory = {
  "Artificial Intelligence": "Artificial Intelligence",
  Python: "Artificial Intelligence",
  "Data Analytics": "Data Science",
  Leadership: "Leadership",
  "Public Communication": "Professional Development",
  Cybersecurity: "Cybersecurity",
  "Digital Strategy": "Digital Transformation",
};

export function getRoleTargets(designation) {
  return roleTargets[designation] || roleTargets.default;
}