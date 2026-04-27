import { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid
} from "recharts";

export default function Performance() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser"));
    setUser(u);
  }, []);

  // ✅ Dynamic subjects
  const subjects = user?.subjects?.length ? user.subjects : ["Math"];

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Classmates
  const classmates = users.filter(
    (u) =>
      u.className === user?.className &&
      u.college === user?.college
  );

  // Average
  const getAverage = (sub) => {
    const total = classmates.reduce(
      (sum, s) => sum + (s.marks?.[sub] || 0),
      0
    );
    return classmates.length ? total / classmates.length : 0;
  };

  // Bar Chart
  const barData = subjects.map((sub) => ({
    subject: sub,
    you: user?.marks?.[sub] || 0,
    avg: Number(getAverage(sub).toFixed(1)),
  }));

  // Line Chart
  const lineData = subjects.map((sub) => ({
    subject: sub,
    score: user?.marks?.[sub] || 0,
  }));

  // Analysis
  const analysis = useMemo(() => {
    return subjects.map((sub) => {
      const your = user?.marks?.[sub] || 0;
      const avg = getAverage(sub);

      if (your < avg - 10)
        return { sub, status: "Weak", color: "text-red-400" };
      if (your < avg)
        return { sub, status: "Below Avg", color: "text-yellow-400" };
      if (your >= avg + 10)
        return { sub, status: "Strong", color: "text-green-400" };
      return { sub, status: "Good", color: "text-blue-400" };
    });
  }, [user, classmates]);

  if (!user) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      <Sidebar />

      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl font-semibold">Performance Analysis</h1>

        {/* Bar Chart */}
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

        {/* Line Chart */}
        <div className="card">
          <h3 className="mb-4">Performance Trend</h3>

          <LineChart width={500} height={300} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#6366f1" />
          </LineChart>
        </div>

        {/* Table */}
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

        {/* Summary */}
        <div className="card">
          <h3 className="mb-4">Performance Summary</h3>

          {analysis.map((a) => (
            <p key={a.sub} className={a.color}>
              {a.sub}: {a.status}
            </p>
          ))}
        </div>

      </div>
    </div>
  );
}