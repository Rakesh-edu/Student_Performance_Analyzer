import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid
} from "recharts";

export default function Performance() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("month");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = JSON.parse(localStorage.getItem("currentUser"));
      setUser(u);
    }
  }, []);

  const subjects = useMemo(() => {
  return user?.subjects || [];
}, [user]);

  const users = useMemo(() => {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem("users")) || [];
}, []);

  // ✅ FIXED classmates (useMemo)
  const classmates = useMemo(() => {
    return users.filter(
      (u) =>
        u.className === user?.className &&
        u.college === user?.college
    );
  }, [user, users]);

  // ✅ FIXED getAverage (useCallback)
  const getAverage = useCallback((sub) => {
    const validStudents = classmates.filter(
      (s) => s.marks && s.marks[sub] !== undefined
    );

    if (validStudents.length === 0) return 0;

    const total = validStudents.reduce(
      (sum, s) => sum + s.marks[sub],
      0
    );

    return total / validStudents.length;
  }, [classmates]);

  // 🔥 FILTER HISTORY
  const filteredHistory = useMemo(() => {
    if (!user?.marksHistory) return [];

    const now = new Date();

    return user.marksHistory.filter((entry) => {
      const entryDate = new Date(entry.date);
      const diff = (now - entryDate) / (1000 * 60 * 60 * 24);

      if (filter === "day") return diff <= 1;
      if (filter === "week") return diff <= 7;
      if (filter === "month") return diff <= 30;
      if (filter === "year") return diff <= 365;

      return true;
    });
  }, [user, filter]);

  // 🔥 HISTORY DATA
  const historyChartData = filteredHistory.map((entry) => {
    const total = Object.values(entry.marks || {}).reduce((a, b) => a + b, 0);
    return {
      date: entry.date,
      score: total,
    };
  });

  // 🔥 BAR DATA
  const barData = subjects.map((sub) => ({
    subject: sub,
    you: user?.marks?.[sub] || 0,
    avg: Number(getAverage(sub).toFixed(1)),
  }));

  // 🔥 ANALYSIS
  const analysis = useMemo(() => {
    return subjects.map((sub) => {
      const your = user?.marks?.[sub] || 0;
      const avg = getAverage(sub);

      if (avg === 0) return { sub, status: "No Data", color: "text-gray-400" };

      if (your < avg - 10)
        return { sub, status: "Weak", color: "text-red-400" };
      if (your < avg)
        return { sub, status: "Below Avg", color: "text-yellow-400" };
      if (your >= avg + 10)
        return { sub, status: "Strong", color: "text-green-400" };

      return { sub, status: "Good", color: "text-blue-400" };
    });
  }, [user, subjects, getAverage]);

  if (!user) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl font-semibold">Performance Analysis</h1>

        {/* 🔥 FILTER BUTTONS */}
        <div className="flex gap-3">
          {["day", "week", "month", "year"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl ${
                filter === type
                  ? "bg-indigo-600"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 🔥 HISTORY CHART */}
        <div className="card">
          <h3 className="mb-4">
            Performance Trend ({filter.toUpperCase()})
          </h3>

          {historyChartData.length ? (
            <LineChart width={500} height={300} data={historyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#22c55e" />
            </LineChart>
          ) : (
            <p>No data available</p>
          )}
        </div>

        {/* 🔥 BAR CHART */}
        <div className="card">
          <h3 className="mb-4">Your Marks vs Class Average</h3>

          <BarChart width={500} height={300} data={barData}>
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="you" fill="#6366f1" />
            <Bar dataKey="avg" fill="#22c55e" />
          </BarChart>
        </div>

        {/* 🔥 TABLE */}
        <div className="card">
          <h3 className="mb-4">Detailed Comparison</h3>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th>Subject</th>
                <th>Your Marks</th>
                <th>Class Avg</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {subjects.map((sub, i) => (
                <tr key={sub} className="text-center">
                  <td>{sub}</td>
                  <td>{user.marks?.[sub] || 0}</td>
                  <td>{getAverage(sub).toFixed(1)}</td>
                  <td className={analysis[i].color}>
                    {analysis[i].status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}