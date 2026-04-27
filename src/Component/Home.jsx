import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [marksInput, setMarksInput] = useState({});
  const [newSubject, setNewSubject] = useState("");

  // Load user
  useEffect(() => {
    let u = JSON.parse(localStorage.getItem("currentUser"));

    // Initialize subjects if missing
    if (u && !u.subjects) {
      u.subjects = ["Math"];
      localStorage.setItem("currentUser", JSON.stringify(u));
    }

    setUser(u);
  }, []);

  const subjects = user?.subjects || [];

  // 🔥 Add Subject
  const addSubject = () => {
    if (!newSubject.trim()) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) =>
      u.studentId === user.studentId
        ? {
            ...u,
            subjects: [...(u.subjects || []), newSubject],
          }
        : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const updatedUser = {
      ...user,
      subjects: [...(user.subjects || []), newSubject],
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setNewSubject("");
  };

  // 🔥 Save Marks
  const saveMarks = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) =>
      u.studentId === user.studentId
        ? { ...u, marks: marksInput }
        : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    const updatedUser = { ...user, marks: marksInput };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    alert("Marks saved!");
  };

  // 🔥 Classmates
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const classmates = users.filter(
    (u) => u.className === user?.className && u.college === user?.college
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

  // 🔥 Avg Score
  const avgScore = useMemo(() => {
    const vals = Object.values(user?.marks || {});
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [user]);

  // 🔥 Chart Data
  const barData = subjects.map((sub) => ({
    subject: sub,
    you: user?.marks?.[sub] || 0,
    avg: Number(getAverage(sub).toFixed(1)),
  }));

  const lineData = subjects.map((sub) => ({
    name: sub,
    score: user?.marks?.[sub] || 0,
  }));

  const pieData = subjects.map((sub) => ({
    name: sub,
    value: user?.marks?.[sub] || 0,
  }));

  // 🔥 AI Insights
  const insights = subjects.map((sub) => {
    const your = user?.marks?.[sub] || 0;
    const avg = getAverage(sub);

    if (your === 0) return { sub, msg: "No data", type: "neutral" };
    if (your < avg - 10) return { sub, msg: "Needs improvement", type: "weak" };
    if (your < avg) return { sub, msg: "Below average", type: "avg" };
    if (your >= avg + 10) return { sub, msg: "Excellent", type: "strong" };
    return { sub, msg: "Good", type: "good" };
  });

  if (!user) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      <Sidebar />

      <div className="flex-1 p-8 space-y-6">

        {/* Header */}
        <h1 className="text-2xl">
          Welcome, <span className="text-indigo-400">{user.studentId}</span>
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="card"><p>Average</p><h2>{avgScore.toFixed(1)}%</h2></div>
          <div className="card"><p>Rank</p><h2>#{rank}</h2></div>
          <div className="card"><p>Students</p><h2>{classmates.length}</h2></div>
        </div>

        {/* 🔥 Add Subject */}
        <div className="card">
          <h3>Add Subject</h3>

          <div className="flex gap-3 mt-3">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject"
              className="input"
            />
            <button onClick={addSubject} className="btn">Add</button>
          </div>
        </div>

        {/* 🔥 Add Marks */}
        <div className="card">
          <h3>Add Marks</h3>

          <div className="grid grid-cols-2 gap-4 mt-3">
            {subjects.map((s) => (
              <input
                key={s}
                placeholder={s}
                type="number"
                className="input"
                onChange={(e) =>
                  setMarksInput({
                    ...marksInput,
                    [s]: Number(e.target.value),
                  })
                }
              />
            ))}
          </div>

          <button onClick={saveMarks} className="btn mt-4">
            Save
          </button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">

          <div className="card">
            <h3>Comparison</h3>
            <BarChart width={350} height={250} data={barData}>
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="you" fill="#6366f1" />
              <Bar dataKey="avg" fill="#22c55e" />
            </BarChart>
          </div>

          <div className="card">
            <h3>Trend</h3>
            <LineChart width={350} height={250} data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#6366f1" />
            </LineChart>
          </div>

          <div className="card col-span-2">
            <h3>Distribution</h3>
            <PieChart width={400} height={250}>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        {/* Insights */}
        <div className="card">
          <h3>AI Insights</h3>
          {insights.map((i) => (
            <p key={i.sub} className={
              i.type === "weak" ? "text-red-400" :
              i.type === "avg" ? "text-yellow-400" :
              i.type === "strong" ? "text-green-400" :
              "text-gray-300"
            }>
              {i.sub}: {i.msg}
            </p>
          ))}
        </div>

      </div>
    </div>
  );
}