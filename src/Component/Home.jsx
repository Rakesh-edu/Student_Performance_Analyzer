import { useEffect, useMemo, useState, useCallback } from "react";
import { API } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#ef4444", "#a78bfa"];

function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${accent}22`,
        border: `1px solid ${accent}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace" }}>{label}</p>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Sora', sans-serif" }}>{value}</h2>
      </div>
    </div>
  );
}

function Card({ title, children, full }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: 24,
      gridColumn: full ? "1 / -1" : undefined,
      backdropFilter: "blur(8px)",
    }}>
      {title && (
        <p style={{
          margin: "0 0 18px", fontSize: 13, fontWeight: 600,
          color: "#94a3b8", letterSpacing: "0.1em",
          textTransform: "uppercase", fontFamily: "monospace",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: 12,
        }}>{title}</p>
      )}
      {children}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#f1f5f9",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const btnStyle = {
  background: "linear-gradient(135deg, #6366f1, #818cf8)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 22px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f1f5f9"
    }}>
      <p style={{ margin: "0 0 4px", color: "#94a3b8" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [marksInput, setMarksInput] = useState({});
  const [newSubject, setNewSubject] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = JSON.parse(localStorage.getItem("currentUser"));
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
    if (!current) { setLoading(false); return; }
    const updatedUser = allUsers.find((u) => u.studentId === current.studentId);
    setUser(updatedUser || current);
    setUsers(allUsers);
    setLoading(false);
  }, []);

  const subjects = user?.subjects || [];

  const addSubject = () => {
    if (!newSubject.trim()) return;
    updateUser({ ...user, subjects: [...subjects, newSubject] });
    setNewSubject("");
  };

  const saveMarks = () => {
    const newEntry = { date: new Date().toISOString().split("T")[0], marks: marksInput };
    updateUser({
      ...user,
      marks: { ...user.marks, ...marksInput },
      marksHistory: [...(user.marksHistory || []), newEntry],
    });
    alert("Marks saved!");
  };

 const updateUser = async (updatedUser) => {
  setUser(updatedUser);

  // update current user locally
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  try {
    // ✅ send update to json-server
    await API.put(`/users/${updatedUser.id}`, updatedUser);

    // refresh users from server
    const res = await API.get("/users");
    setUsers(res.data);

  } catch (err) {
    console.error("Failed to update server:", err);
  }
};

  // FIX 1: classmates properly memoized
  const classmates = useMemo(() =>
    users.filter((u) => u.className === user?.className && u.college === user?.college),
    [users, user]
  );

  // FIX 2: getAverage as useCallback with stable classmates dep
  const getAverage = useCallback((sub) => {
    const total = classmates.reduce((sum, s) => sum + (s.marks?.[sub] || 0), 0);
    return classmates.length ? total / classmates.length : 0;
  }, [classmates]);

  const rank = useMemo(() => {
    const sorted = [...classmates].sort((a, b) => {
      const totalA = Object.values(a.marks || {}).reduce((x, y) => x + y, 0);
      const totalB = Object.values(b.marks || {}).reduce((x, y) => x + y, 0);
      return totalB - totalA;
    });
    const index = sorted.findIndex((s) => s.studentId === user?.studentId);
    return index !== -1 ? index + 1 : "N/A";
  }, [classmates, user]);

  const avgScore = useMemo(() => {
    const vals = Object.values(user?.marks || {});
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [user]);

  // FIX 3: historyData memoized so dependent useMemos are stable
  const historyData = useMemo(() =>
    (user?.marksHistory || []).map((entry) => {
      const total = Object.values(entry.marks || {}).reduce((a, b) => a + b, 0);
      return { date: entry.date, score: total };
    }),
    [user]
  );

  // FIX 4: chart data memoized
  const barData = useMemo(() =>
    subjects.map((sub) => ({
      subject: sub,
      you: user?.marks?.[sub] || 0,
      avg: Number(getAverage(sub).toFixed(1)),
    })),
    [subjects, user, getAverage]
  );

  const lineData = useMemo(() =>
    subjects.map((sub) => ({
      name: sub,
      score: user?.marks?.[sub] || 0,
    })),
    [subjects, user]
  );

  const pieData = useMemo(() =>
    subjects.map((sub) => ({
      name: sub,
      value: user?.marks?.[sub] || 0,
    })),
    [subjects, user]
  );

  const improvement = useMemo(() => {
    if (historyData.length < 2) return 0;
    const prev = historyData[historyData.length - 2].score;
    const latest = historyData[historyData.length - 1].score;
    return (((latest - prev) / (prev || 1)) * 100).toFixed(1);
  }, [historyData]);

  const bestDay = useMemo(() => {
    if (!historyData.length) return null;
    return historyData.reduce((max, curr) => curr.score > max.score ? curr : max);
  }, [historyData]);

  const dropDetected = useMemo(() => {
    if (historyData.length < 2) return false;
    const prev = historyData[historyData.length - 2].score;
    const latest = historyData[historyData.length - 1].score;
    return latest < prev;
  }, [historyData]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontFamily: "monospace" }}>
      Loading dashboard…
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontFamily: "monospace" }}>
      No user found. Please login again.
    </div>
  );

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 20%, #1e1b4b 0%, #0a0f1e 50%, #0f172a 100%)",
      color: "#f1f5f9",
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');`}</style>

      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto", maxWidth: 1200 }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>
              Student Dashboard
            </p>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: "#f1f5f9" }}>
              Welcome back, <span style={{ color: "#818cf8" }}>{user.studentId}</span>
            </h1>
          </div>
          <div style={{
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 12,
            padding: "8px 18px",
            fontSize: 13,
            color: "#818cf8",
            fontFamily: "monospace",
          }}>
            {user.className} · {user.college}
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <StatCard label="Average Score" value={`${avgScore.toFixed(1)}%`} icon="📊" accent="#6366f1" />
          <StatCard label="Class Rank"    value={`#${rank}`}               icon="🏆" accent="#f59e0b" />
          <StatCard label="Classmates"    value={classmates.length}        icon="👥" accent="#22d3ee" />
        </div>

        {/* Add Subject + Add Marks */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Card title="Add Subject">
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                style={inputStyle}
                placeholder="e.g. Mathematics"
                onKeyDown={(e) => e.key === "Enter" && addSubject()}
              />
              <button onClick={addSubject} style={btnStyle}>+ Add</button>
            </div>
            {subjects.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {subjects.map((s, i) => (
                  <span key={s} style={{
                    background: `${COLORS[i % COLORS.length]}22`,
                    border: `1px solid ${COLORS[i % COLORS.length]}44`,
                    color: COLORS[i % COLORS.length],
                    borderRadius: 8, padding: "4px 12px", fontSize: 12, fontFamily: "monospace",
                  }}>{s}</span>
                ))}
              </div>
            )}
          </Card>

          <Card title="Enter Marks">
            <div style={{ display: "grid", gridTemplateColumns: subjects.length > 2 ? "1fr 1fr" : "1fr", gap: 10 }}>
              {subjects.map((s) => (
                <div key={s}>
                  <label style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", display: "block", marginBottom: 4 }}>{s}</label>
                  <input
                    placeholder="0 – 100"
                    type="number"
                    style={inputStyle}
                    onChange={(e) => setMarksInput({ ...marksInput, [s]: Number(e.target.value) })}
                  />
                </div>
              ))}
            </div>
            {subjects.length > 0 && (
              <button onClick={saveMarks} style={{ ...btnStyle, marginTop: 16, width: "100%" }}>
                Save Marks
              </button>
            )}
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Card title="You vs Class Average">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="30%">
                <XAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
                <Bar dataKey="you" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avg" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Score per Subject">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: "#818cf8" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Card title="Score Distribution">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <PieChart width={260} height={220}>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 4 }}>
              {pieData.map((d, i) => (
                <span key={d.name} style={{ fontSize: 11, color: COLORS[i % COLORS.length], fontFamily: "monospace" }}>
                  ● {d.name}
                </span>
              ))}
            </div>
          </Card>

          <Card title="Performance Over Time">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 4, fill: "#22d3ee" }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Insights Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card title="Growth">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                fontSize: 36, fontWeight: 700, fontFamily: "'Sora', sans-serif",
                color: Number(improvement) >= 0 ? "#22d3ee" : "#ef4444",
              }}>
                {improvement > 0 ? "+" : ""}{improvement}%
              </span>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                vs previous session
              </span>
            </div>
          </Card>

          <Card title="Smart Insights">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {bestDay ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(34,211,238,0.08)", borderRadius: 10, padding: "10px 14px",
                  border: "1px solid rgba(34,211,238,0.2)",
                }}>
                  <span style={{ fontSize: 18 }}>🌟</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>Best Performance</p>
                    <p style={{ margin: 0, fontSize: 14, color: "#22d3ee", fontWeight: 600 }}>{bestDay.date} — {bestDay.score} pts</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: "#64748b", fontSize: 13 }}>No history yet.</p>
              )}
              {dropDetected && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(239,68,68,0.08)", borderRadius: 10, padding: "10px 14px",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>Alert</p>
                    <p style={{ margin: 0, fontSize: 14, color: "#ef4444", fontWeight: 600 }}>Performance dropped last session</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}