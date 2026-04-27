import { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";

export default function Insights() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser"));
    setUser(u);
  }, []);

  // ✅ Dynamic subjects
  const subjects = user?.subjects?.length ? user.subjects : ["Math"];

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const classmates = users.filter(
    (u) =>
      u.className === user?.className &&
      u.college === user?.college
  );

  // 🔥 Average
  const getAverage = (sub) => {
    const total = classmates.reduce(
      (sum, s) => sum + (s.marks?.[sub] || 0),
      0
    );
    return classmates.length ? total / classmates.length : 0;
  };

  // 🔥 Rank
  const rank = useMemo(() => {
    const sorted = [...classmates].sort((a, b) => {
      const avgA = Object.values(a.marks || {}).reduce((x, y) => x + y, 0);
      const avgB = Object.values(b.marks || {}).reduce((x, y) => x + y, 0);
      return avgB - avgA;
    });

    return sorted.findIndex((s) => s.studentId === user?.studentId) + 1;
  }, [classmates, user]);

  // 🔥 AI Analysis
  const insights = useMemo(() => {
    return subjects.map((sub) => {
      const your = user?.marks?.[sub] || 0;
      const avg = getAverage(sub);

      if (your === 0)
        return { sub, msg: "No data available", type: "neutral" };

      if (your < avg - 10)
        return { sub, msg: "Needs serious improvement", type: "weak" };

      if (your < avg)
        return { sub, msg: "Below class average", type: "average" };

      if (your >= avg + 10)
        return { sub, msg: "Excellent performance", type: "strong" };

      return { sub, msg: "Good performance", type: "good" };
    });
  }, [user, classmates, subjects]);

  // 🔥 Suggestions
  const suggestions = insights.map((i) => {
    if (i.type === "weak")
      return `👉 Focus more on ${i.sub} with daily practice`;
    if (i.type === "average")
      return `👉 Improve ${i.sub} by solving previous papers`;
    if (i.type === "strong")
      return `👉 Maintain your strength in ${i.sub}`;
    return null;
  });

  // 🔥 Overall Prediction
  const avgScore =
    Object.values(user?.marks || {}).reduce((a, b) => a + b, 0) /
      (subjects.length || 1);

  const prediction =
    avgScore > 80
      ? "🔥 You are likely to be a top performer"
      : avgScore > 60
      ? "📈 You can improve to reach top ranks"
      : "⚠️ You need strong focus to improve performance";

  if (!user) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      <Sidebar />

      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl font-semibold text-indigo-400">
          AI Insights
        </h1>

        {/* Subject Insights */}
        <div className="card">
          <h3 className="mb-4">Subject Analysis</h3>

          {insights.map((i) => (
            <div key={i.sub} className="flex justify-between mb-2">
              <span>{i.sub}</span>

              <span
                className={
                  i.type === "weak"
                    ? "text-red-400"
                    : i.type === "average"
                    ? "text-yellow-400"
                    : i.type === "strong"
                    ? "text-green-400"
                    : "text-gray-400"
                }
              >
                {i.msg}
              </span>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="card">
          <h3 className="mb-4">Personalized Suggestions</h3>

          {suggestions.map(
            (s, i) => s && <p key={i} className="mb-2">{s}</p>
          )}
        </div>

        {/* Rank */}
        <div className="card">
          <h3>Class Standing</h3>
          <p className="text-indigo-400 mt-2">
            Your Rank: #{rank} out of {classmates.length}
          </p>
        </div>

        {/* Prediction */}
        <div className="card">
          <h3>Performance Prediction</h3>
          <p className="mt-2">{prediction}</p>
        </div>

      </div>
    </div>
  );
}