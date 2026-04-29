import { useEffect, useState, useMemo, useCallback } from "react";
import { API } from "../api";

export default function Insights() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  // 🔥 Load current user (SAFE)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = JSON.parse(localStorage.getItem("currentUser"));
      setUser(u);
    }
  }, []);

  // 🔥 Fetch users (API + fallback)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.log("API failed, using localStorage");
        const localUsers =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("users")) || []
            : [];
        setUsers(localUsers);
      }
    };
    fetchUsers();
  }, []);

  // ✅ Dynamic subjects
  const subjects = useMemo(() => {
    return user?.subjects || [];
  }, [user]);

  // 🔥 Classmates
  const classmates = useMemo(() => {
    return users.filter(
      (u) =>
        u.className === user?.className &&
        u.college === user?.college
    );
  }, [users, user]);

  // 🔥 Average (ignore empty marks)
  const getAverage = useCallback(
    (sub) => {
      const valid = classmates.filter(
        (s) => s.marks && s.marks[sub] !== undefined
      );
      if (valid.length === 0) return 0;
      const total = valid.reduce((sum, s) => sum + s.marks[sub], 0);
      return total / valid.length;
    },
    [classmates]
  );

  // 🔥 Rank
  const rank = useMemo(() => {
    if (!user) return "N/A";
    const sorted = [...classmates].sort((a, b) => {
      const totalA = Object.values(a.marks || {}).reduce((x, y) => x + y, 0);
      const totalB = Object.values(b.marks || {}).reduce((x, y) => x + y, 0);
      return totalB - totalA;
    });
    const index = sorted.findIndex((s) => s.id === user.id);
    return index !== -1 ? index + 1 : "N/A";
  }, [classmates, user]);

  // 🔥 AI Insights
  const insights = useMemo(() => {
    return subjects.map((sub) => {
      const your = user?.marks?.[sub] || 0;
      const avg = getAverage(sub);
      if (avg === 0) return { sub, msg: "No class data", type: "neutral", score: 0 };
      if (your === 0) return { sub, msg: "No data available", type: "neutral", score: 0 };
      if (your < avg - 10) return { sub, msg: "Needs improvement", type: "weak", score: your };
      if (your < avg) return { sub, msg: "Below average", type: "average", score: your };
      if (your >= avg + 10) return { sub, msg: "Excellent", type: "strong", score: your };
      return { sub, msg: "Good", type: "good", score: your };
    });
  }, [user, subjects, getAverage]);

  // 🔥 Suggestions
  const suggestions = useMemo(() => {
    return insights
      .map((i) => {
        if (i.type === "weak")
          return { text: `Focus more on ${i.sub} with daily practice`, type: "weak" };
        if (i.type === "average")
          return { text: `Improve ${i.sub} by solving previous papers`, type: "average" };
        if (i.type === "strong")
          return { text: `Maintain your strength in ${i.sub}`, type: "strong" };
        if (i.type === "good")
          return { text: `Keep consistent effort in ${i.sub}`, type: "good" };
        return null;
      })
      .filter(Boolean);
  }, [insights]);

  // 🔥 Avg score
  const avgScore = useMemo(() => {
    const values = Object.values(user?.marks || {});
    return values.length
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  }, [user]);

  // 🔥 Prediction
  const prediction = useMemo(() => {
    if (avgScore > 80) return { msg: "You are likely to be a top performer", type: "strong" };
    if (avgScore > 60) return { msg: "You can improve to reach top ranks", type: "good" };
    return { msg: "You need strong focus to improve performance", type: "weak" };
  }, [avgScore]);

  // ✅ NEW — Top subject (highest score among valid subjects)
  const topSubject = useMemo(() => {
    const valid = insights.filter((i) => i.score > 0);
    if (!valid.length) return null;
    return valid.reduce((best, i) => (i.score > best.score ? i : best), valid[0]);
  }, [insights]);

  // ✅ NEW — Weakest subject (lowest score among valid subjects)
  const weakestSubject = useMemo(() => {
    const valid = insights.filter((i) => i.score > 0);
    if (!valid.length) return null;
    return valid.reduce((worst, i) => (i.score < worst.score ? i : worst), valid[0]);
  }, [insights]);

  // ✅ NEW — Goal tracker: total marks gap to reach rank #1
  const goalTracker = useMemo(() => {
    if (!user || classmates.length === 0) return null;
    const myTotal = Object.values(user.marks || {}).reduce((a, b) => a + b, 0);
    const topStudent = [...classmates].sort((a, b) => {
      const tA = Object.values(a.marks || {}).reduce((x, y) => x + y, 0);
      const tB = Object.values(b.marks || {}).reduce((x, y) => x + y, 0);
      return tB - tA;
    })[0];
    if (!topStudent) return null;
    const topTotal = Object.values(topStudent.marks || {}).reduce((a, b) => a + b, 0);
    const gap = topTotal - myTotal;
    return { gap: gap > 0 ? gap : 0, myTotal, topTotal };
  }, [user, classmates]);

  // ✅ NEW — Consistency: how many subjects are at or above class average
  const consistencyStreak = useMemo(() => {
    const valid = insights.filter((i) => i.score > 0);
    const aboveAvg = valid.filter((i) => i.score >= getAverage(i.sub)).length;
    return { aboveAvg, total: valid.length };
  }, [insights, getAverage]);

  // ✅ NEW — Chart data: your score vs class avg per subject
  const chartData = useMemo(() => {
    return subjects.map((sub) => ({
      sub,
      your: user?.marks?.[sub] || 0,
      avg: Math.round(getAverage(sub)),
    }));
  }, [subjects, user, getAverage]);

  // Badge styles
  const badgeClass = {
    weak: "bg-red-900/30 text-red-400",
    average: "bg-yellow-900/30 text-yellow-400",
    good: "bg-green-900/30 text-green-400",
    strong: "bg-teal-900/30 text-teal-400",
    neutral: "bg-white/10 text-gray-400",
  };

  // Dot colors
  const dotColor = {
    weak: "bg-red-400",
    average: "bg-yellow-400",
    good: "bg-green-400",
    strong: "bg-teal-400",
    neutral: "bg-gray-500",
  };

  // Bar colors
  const barColor = {
    weak: "bg-red-500",
    average: "bg-yellow-400",
    good: "bg-green-400",
    strong: "bg-teal-400",
    neutral: "bg-gray-500",
  };

  // Prediction chip styles
  const predStyle = {
    strong: "bg-teal-900/30 text-teal-400",
    good: "bg-indigo-900/30 text-indigo-400",
    weak: "bg-red-900/30 text-red-400",
  };

  if (!user) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">
      <div className="flex-1 p-8 space-y-4 max-w-2xl">

        <h1 className="text-2xl font-semibold text-indigo-400 mb-6">
          AI Insights
        </h1>

        {/* ✅ NEW — Quick stats: Top subject / Weakest subject / Consistency */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">🏆 Top Subject</p>
            {topSubject ? (
              <>
                <p className="text-base font-semibold text-teal-400">{topSubject.sub}</p>
                <p className="text-xs text-gray-400 mt-1">{topSubject.score} marks</p>
              </>
            ) : (
              <p className="text-xs text-gray-500">N/A</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">📉 Needs Work</p>
            {weakestSubject ? (
              <>
                <p className="text-base font-semibold text-red-400">{weakestSubject.sub}</p>
                <p className="text-xs text-gray-400 mt-1">{weakestSubject.score} marks</p>
              </>
            ) : (
              <p className="text-xs text-gray-500">N/A</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">📅 Consistency</p>
            <p className="text-base font-semibold text-indigo-400">
              {consistencyStreak.aboveAvg}/{consistencyStreak.total}
            </p>
            <p className="text-xs text-gray-400 mt-1">above avg</p>
          </div>
        </div>

        {/* ✅ NEW — Goal Tracker */}
        {goalTracker !== null && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">🎯 Goal Tracker</p>
            {goalTracker.gap === 0 ? (
              <p className="text-sm text-teal-400 font-medium">You are already the top scorer! 🏆</p>
            ) : (
              <>
                <p className="text-sm text-gray-300">
                  You need{" "}
                  <span className="text-white font-semibold">{goalTracker.gap} more marks</span>{" "}
                  in total to reach{" "}
                  <span className="text-indigo-400 font-semibold">Rank #1</span>
                </p>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((goalTracker.myTotal / goalTracker.topTotal) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.min(100, Math.round((goalTracker.myTotal / goalTracker.topTotal) * 100))}% toward rank #1
                </p>
              </>
            )}
          </div>
        )}

        {/* Subject Analysis — original */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
            Subject Analysis
          </p>
          {insights.length === 0 ? (
            <p className="text-gray-500 text-sm">No subjects found.</p>
          ) : (
            insights.map((i) => (
              <div
                key={i.sub}
                className="flex items-center gap-3 py-2 border-b border-white/5 last:border-none"
              >
                <span className="text-sm font-medium w-28 shrink-0">{i.sub}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor[i.type]}`}
                    style={{ width: `${Math.min(i.score, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full shrink-0 ${badgeClass[i.type]}`}>
                  {i.msg}
                </span>
              </div>
            ))
          )}
        </div>

        {/* ✅ NEW — Score vs Class Average Chart */}
        {chartData.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              📊 Score vs Class Average
            </p>
            <div className="flex items-end gap-4 h-36">
              {chartData.map((d) => {
                const yourH = Math.round((d.your / 100) * 100);
                const avgH = Math.round((d.avg / 100) * 100);
                return (
                  <div key={d.sub} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-1 h-28">
                      <div className="relative group flex-1 flex items-end h-full">
                        <div
                          className="w-full bg-indigo-500 rounded-t-md"
                          style={{ height: `${yourH}%` }}
                        />
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-indigo-300 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          You: {d.your}
                        </span>
                      </div>
                      <div className="relative group flex-1 flex items-end h-full">
                        <div
                          className="w-full bg-white/20 rounded-t-md"
                          style={{ height: `${avgH}%` }}
                        />
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          Avg: {d.avg}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 text-center truncate w-full">{d.sub}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" /> You
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-sm bg-white/20 inline-block" /> Class Avg
              </span>
            </div>
          </div>
        )}

        {/* Stats Row — original */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Class Standing</p>
            <p className="text-3xl font-semibold text-white">#{rank}</p>
            <p className="text-sm text-gray-400 mt-1">out of {classmates.length} students</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Avg Score</p>
            <p className="text-3xl font-semibold text-white">{avgScore.toFixed(1)}</p>
            <p className="text-sm text-gray-400 mt-1">your current average</p>
          </div>
        </div>

        {/* Suggestions — original */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
            Personalized Suggestions
          </p>
          {suggestions.length === 0 ? (
            <p className="text-gray-500 text-sm">No suggestions available.</p>
          ) : (
            suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2 border-b border-white/5 last:border-none text-sm text-gray-300"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor[s.type]}`} />
                {s.text}
              </div>
            ))
          )}
        </div>

        {/* Prediction — original */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
            Performance Prediction
          </p>
          <p className="text-sm text-gray-400">
            Based on your current marks and class position
          </p>
          <span className={`inline-flex items-center gap-2 mt-3 text-sm font-medium px-4 py-1.5 rounded-full ${predStyle[prediction.type]}`}>
            ★ {prediction.msg}
          </span>
        </div>

      </div>
    </div>
  );
}