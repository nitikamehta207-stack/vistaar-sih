import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Card } from "../ui/Card";
import { courses } from "../../data/courses";
import { getRoleTargets, skillToCourseCategory } from "../../data/skillTargets";

// No props needed — reads the logged-in trainee via useAuth() internally.
// Expects user.skills = [{ name, value }] and user.designation.
export default function SkillGapRadar() {
  const { user } = useAuth();
  const targets = getRoleTargets(user?.designation);
  const mySkills = user?.skills || [];

  const data = targets.map((t) => {
    const mine = mySkills.find((s) => s.name === t.skill);
    return { skill: t.skill, You: mine?.value ?? 0, Target: t.target };
  });

  // Recommend courses for the top 3 biggest gaps (target - current), only where a gap exists.
  const gaps = data
    .map((d) => ({ ...d, gap: d.Target - d.You }))
    .filter((d) => d.gap > 5)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const recommended = gaps
    .map((g) => {
      const category = skillToCourseCategory[g.skill];
      const course = courses.find((c) => c.category === category);
      return course ? { ...course, forSkill: g.skill, gap: g.gap } : null;
    })
    .filter(Boolean);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={17} className="text-violet-500" />
        <h2 className="font-display font-bold text-lg text-ink-900">Skill Gap Radar</h2>
      </div>
      <p className="text-sm text-ink-500 mb-4">
        Your current proficiency vs. what's expected for {user?.designation || "your role"}.
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="#EDE9FE" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#5B5E82" }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#9498B8" }} tickCount={5} />
          <Radar name="Target" dataKey="Target" stroke="#C4B5FD" fill="#C4B5FD" fillOpacity={0.25} strokeWidth={2} />
          <Radar name="You" dataKey="You" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.35} strokeWidth={2.5} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7E8F3", fontSize: 13 }} />
        </RadarChart>
      </ResponsiveContainer>

      {recommended.length > 0 && (
        <div className="mt-2 pt-4 border-t border-ink-100">
          <p className="text-sm font-semibold text-ink-800 mb-3">Recommended to close your biggest gaps</p>
          <div className="space-y-2.5">
            {recommended.map((c) => (
              <Link
                key={c.id}
                to={`/courses/${c.id}`}
                className="focus-ring flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-ink-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-800 truncate">{c.title}</p>
                  <p className="text-xs text-ink-400 mt-0.5">Closes gap in {c.forSkill} (+{c.gap} pts needed)</p>
                </div>
                <ArrowRight size={15} className="text-indigo-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommended.length === 0 && (
        <p className="text-sm text-emerald-600 font-medium mt-4 pt-4 border-t border-ink-100">
          You're meeting the expected proficiency for your role. 🎉
        </p>
      )}
    </Card>
  );
}