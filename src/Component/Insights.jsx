import { useEffect, useState, useMemo,useCallback } from "react";
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

  // ✅ Dynamic subjects (NO default Math now)
  const subjects = user?.subjects || [];

  // 🔥 Classmates
  const classmates = useMemo(() => {
  return users.filter(
    (u) =>
      u.className === user?.className &&
      u.college === user?.college
  );
}, [users, user]);

  // 🔥 Average (FIXED - ignore empty marks)
  const getAverage = useCallback((sub) => {
  const valid = classmates.filter(
    (s) => s.marks && s.marks[sub] !== undefined
  );

  if (valid.length === 0) return 0;

  const total = valid.reduce((sum, s) => sum + s.marks[sub], 0);

  return total / valid.length;
}, [classmates]);

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

      if (avg === 0)
        return { sub, msg: "No class data", type: "neutral" };

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
  }, [user,subjects, getAverage]);

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

  // 🔥 Prediction
  const avgScore =
    Object.values(user?.marks || {}).reduce((a, b) => a + b, 0) /
      (subjects.length || 1);

  const prediction =
    avgScore > 80
      ? "🔥 You are likely to be a top performer"
      : avgScore > 60
      ? "📈 You can improve to reach top ranks"
      : "⚠️ You need strong focus to improve performance";

  if (!user) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl font-semibold text-indigo-400">
          AI Insights
        </h1>

        {/* Subject Analysis */}
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