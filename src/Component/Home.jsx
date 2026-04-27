import { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import { API } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [marksInput, setMarksInput] = useState({});
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 Load data
  useEffect(() => {
    const current = JSON.parse(localStorage.getItem("currentUser"));
    if (!current) return;

    API.get("/users").then((res) => {
      setUsers(res.data);

      const updatedUser = res.data.find(u => u.id === current.id);
      setUser(updatedUser);

      setLoading(false);
    });
  }, []);

  const subjects = user?.subjects || [];

  // 🔥 Add Subject
  const addSubject = async () => {
    if (!newSubject.trim()) return;

    const updatedUser = {
      ...user,
      subjects: [...(user.subjects || []), newSubject],
    };

    await API.put(`/users/${user.id}`, updatedUser);

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setNewSubject("");
  };

  // 🔥 Save Marks + History
  const saveMarks = async () => {
    const newEntry = {
      date: new Date().toISOString().split("T")[0],
      marks: marksInput
    };

    const updatedUser = {
      ...user,
      marks: { ...user.marks, ...marksInput },
      marksHistory: [...(user.marksHistory || []), newEntry]
    };

    await API.put(`/users/${user.id}`, updatedUser);

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    alert("Marks saved!");
  };

  // 🔥 Classmates
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

    const index = sorted.findIndex((s) => s.id === user?.id);
    return index !== -1 ? index + 1 : "N/A";
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

  // 🔥 HISTORY DATA (Time-based analytics)
  const historyData = (user?.marksHistory || []).map(entry => {
    const total = Object.values(entry.marks || {}).reduce((a, b) => a + b, 0);
    return {
      date: entry.date,
      score: total
    };
  });

  // 📊 Growth tracking
  const improvement = useMemo(() => {
    if (historyData.length < 2) return 0;

    const prev = historyData[historyData.length - 2].score;
    const latest = historyData[historyData.length - 1].score;

    return (((latest - prev) / (prev || 1)) * 100).toFixed(1);
  }, [historyData]);

  // 🧠 Best day
  const bestDay = useMemo(() => {
    if (!historyData.length) return null;

    return historyData.reduce((max, curr) =>
      curr.score > max.score ? curr : max
    );
  }, [historyData]);

  // ⚠️ Drop detection
  const dropDetected = useMemo(() => {
    if (historyData.length < 2) return false;

    const prev = historyData[historyData.length - 2].score;
    const latest = historyData[historyData.length - 1].score;

    return latest < prev;
  }, [historyData]);

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

  if (loading) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      <Sidebar />

      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl">
          Welcome, <span className="text-indigo-400">{user.studentId}</span>
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="card"><p>Average</p><h2>{avgScore.toFixed(1)}%</h2></div>
          <div className="card"><p>Rank</p><h2>#{rank}</h2></div>
          <div className="card"><p>Students</p><h2>{classmates.length}</h2></div>
        </div>

        {/* Add Subject */}
        <div className="card">
          <h3>Add Subject</h3>
          <div className="flex gap-3 mt-3">
            <input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="input"
              placeholder="Enter subject"
            />
            <button onClick={addSubject} className="btn">Add</button>
          </div>
        </div>

        {/* Add Marks */}
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
            <h3>Subject Comparison (Bar Chart)</h3>
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
            <h3>Subject Scores (Line Chart)</h3>
            <LineChart width={350} height={250} data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#6366f1" />
            </LineChart>
          </div>

          <div className="card col-span-2">
            <h3>Marks Distribution (Pie Chart)</h3>
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

        {/* AI Insights */}
        <div className="card">
          <h3>AI Insights</h3>
          {insights.map((i) => (
            <p key={i.sub}>
              {i.sub}: {i.msg}
            </p>
          ))}
        </div>

        {/* 📈 Time-based analytics */}
        <div className="card">
          <h3>Performance Over Time (Line Chart)</h3>
          <LineChart width={500} height={300} data={historyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#22c55e" />
          </LineChart>
        </div>

        {/* 📊 Growth tracking */}
        <div className="card">
          <h3>Growth Tracking</h3>
          <p>Improvement: {improvement}%</p>
        </div>

        {/* 🧠 Real insights */}
        <div className="card">
          <h3>Smart Insights</h3>
          {bestDay && <p>Best Day: {bestDay.date} ({bestDay.score})</p>}
          {dropDetected && <p className="text-red-400">Performance dropped ⚠️</p>}
        </div>

      </div>
    </div>
  );
}