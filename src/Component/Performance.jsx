// import { useEffect, useState, useMemo, useCallback } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
//   LineChart, Line, CartesianGrid
// } from "recharts";

// export default function Performance() {
//   const [user, setUser] = useState(null);
//   const [filter, setFilter] = useState("month");

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const u = JSON.parse(localStorage.getItem("currentUser"));
//       setUser(u);
//     }
//   }, []);

//   const subjects = useMemo(() => {
//   return user?.subjects || [];
// }, [user]);

//   const users = useMemo(() => {
//   if (typeof window === "undefined") return [];
//   return JSON.parse(localStorage.getItem("users")) || [];
// }, []);

//   // ✅ FIXED classmates (useMemo)
//   const classmates = useMemo(() => {
//     return users.filter(
//       (u) =>
//         u.className === user?.className &&
//         u.college === user?.college
//     );
//   }, [user, users]);

//   // ✅ FIXED getAverage (useCallback)
//   const getAverage = useCallback((sub) => {
//     const validStudents = classmates.filter(
//       (s) => s.marks && s.marks[sub] !== undefined
//     );

//     if (validStudents.length === 0) return 0;

//     const total = validStudents.reduce(
//       (sum, s) => sum + s.marks[sub],
//       0
//     );

//     return total / validStudents.length;
//   }, [classmates]);

//   // 🔥 FILTER HISTORY
//   const filteredHistory = useMemo(() => {
//     if (!user?.marksHistory) return [];

//     const now = new Date();

//     return user.marksHistory.filter((entry) => {
//       const entryDate = new Date(entry.date);
//       const diff = (now - entryDate) / (1000 * 60 * 60 * 24);

//       if (filter === "day") return diff <= 1;
//       if (filter === "week") return diff <= 7;
//       if (filter === "month") return diff <= 30;
//       if (filter === "year") return diff <= 365;

//       return true;
//     });
//   }, [user, filter]);

//   // 🔥 HISTORY DATA
//   const historyChartData = filteredHistory.map((entry) => {
//     const total = Object.values(entry.marks || {}).reduce((a, b) => a + b, 0);
//     return {
//       date: entry.date,
//       score: total,
//     };
//   });

//   // 🔥 BAR DATA
//   const barData = subjects.map((sub) => ({
//     subject: sub,
//     you: user?.marks?.[sub] || 0,
//     avg: Number(getAverage(sub).toFixed(1)),
//   }));

//   // 🔥 ANALYSIS
//   const analysis = useMemo(() => {
//     return subjects.map((sub) => {
//       const your = user?.marks?.[sub] || 0;
//       const avg = getAverage(sub);

//       if (avg === 0) return { sub, status: "No Data", color: "text-gray-400" };

//       if (your < avg - 10)
//         return { sub, status: "Weak", color: "text-red-400" };
//       if (your < avg)
//         return { sub, status: "Below Avg", color: "text-yellow-400" };
//       if (your >= avg + 10)
//         return { sub, status: "Strong", color: "text-green-400" };

//       return { sub, status: "Good", color: "text-blue-400" };
//     });
//   }, [user, subjects, getAverage]);

//   if (!user) return <p className="text-white">Loading...</p>;

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

//       <div className="flex-1 p-8 space-y-6">

//         <h1 className="text-2xl font-semibold">Performance Analysis</h1>

//         {/* 🔥 FILTER BUTTONS */}
//         <div className="flex gap-3">
//           {["day", "week", "month", "year"].map((type) => (
//             <button
//               key={type}
//               onClick={() => setFilter(type)}
//               className={`px-4 py-2 rounded-xl ${
//                 filter === type
//                   ? "bg-indigo-600"
//                   : "bg-white/10 hover:bg-white/20"
//               }`}
//             >
//               {type.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         {/* 🔥 HISTORY CHART */}
//         <div className="card">
//           <h3 className="mb-4">
//             Performance Trend ({filter.toUpperCase()})
//           </h3>

//           {historyChartData.length ? (
//             <LineChart width={500} height={300} data={historyChartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Line type="monotone" dataKey="score" stroke="#22c55e" />
//             </LineChart>
//           ) : (
//             <p>No data available</p>
//           )}
//         </div>

//         {/* 🔥 BAR CHART */}
//         <div className="card">
//           <h3 className="mb-4">Your Marks vs Class Average</h3>

//           <BarChart width={500} height={300} data={barData}>
//             <XAxis dataKey="subject" />
//             <YAxis />
//             <Tooltip />
//             <Legend />
//             <Bar dataKey="you" fill="#6366f1" />
//             <Bar dataKey="avg" fill="#22c55e" />
//           </BarChart>
//         </div>

//         {/* 🔥 TABLE */}
//         <div className="card">
//           <h3 className="mb-4">Detailed Comparison</h3>

//           <table className="w-full text-sm">
//             <thead>
//               <tr className="text-gray-400">
//                 <th>Subject</th>
//                 <th>Your Marks</th>
//                 <th>Class Avg</th>
//                 <th>Status</th>
//               </tr>
//             </thead>

//             <tbody>
//               {subjects.map((sub, i) => (
//                 <tr key={sub} className="text-center">
//                   <td>{sub}</td>
//                   <td>{user.marks?.[sub] || 0}</td>
//                   <td>{getAverage(sub).toFixed(1)}</td>
//                   <td className={analysis[i].color}>
//                     {analysis[i].status}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//       </div>
//     </div>
//   );
// }


import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, CartesianGrid, ResponsiveContainer
} from "recharts";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        "#080d1a",
  surface:   "rgba(255,255,255,0.03)",
  border:    "rgba(255,255,255,0.07)",
  indigo:    "#6366f1",
  cyan:      "#22d3ee",
  green:     "#4ade80",
  yellow:    "#fbbf24",
  red:       "#f87171",
  muted:     "#64748b",
  text:      "#e2e8f0",
  subtext:   "#94a3b8",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusMeta = {
  "Strong":    { color: C.green,  bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)",  icon: "🚀" },
  "Good":      { color: C.cyan,   bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)",  icon: "✅" },
  "Below Avg": { color: C.yellow, bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  icon: "⚠️" },
  "Weak":      { color: C.red,    bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", icon: "🔻" },
  "No Data":   { color: C.muted,  bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)", icon: "—"  },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "10px 16px", fontSize: 13, color: C.text,
    }}>
      <p style={{ margin: "0 0 6px", color: C.subtext, fontFamily: "monospace", fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color }}>
          {p.name}: <b>{p.value}</b>
        </p>
      ))}
    </div>
  );
};

// ─── Reusable Card ────────────────────────────────────────────────────────────
function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      padding: "24px 28px",
      backdropFilter: "blur(10px)",
      ...style,
    }}>
      {title && (
        <p style={{
          margin: "0 0 20px",
          fontSize: 11,
          fontWeight: 700,
          color: C.subtext,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "monospace",
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 14,
        }}>{title}</p>
      )}
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Performance() {
  const [user, setUser]     = useState(null);
  const [filter, setFilter] = useState("month");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = JSON.parse(localStorage.getItem("currentUser"));
      setUser(u);
    }
  }, []);

  // ── ALL ORIGINAL LOGIC UNTOUCHED ──────────────────────────────────────────
  const subjects = useMemo(() => user?.subjects || [], [user]);

  const users = useMemo(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("users")) || [];
  }, []);

  const classmates = useMemo(() =>
    users.filter(u => u.className === user?.className && u.college === user?.college),
    [user, users]
  );

  const getAverage = useCallback((sub) => {
    const valid = classmates.filter(s => s.marks && s.marks[sub] !== undefined);
    if (!valid.length) return 0;
    return valid.reduce((sum, s) => sum + s.marks[sub], 0) / valid.length;
  }, [classmates]);

  const filteredHistory = useMemo(() => {
    if (!user?.marksHistory) return [];
    const now = new Date();
    return user.marksHistory.filter((entry) => {
      const diff = (now - new Date(entry.date)) / (1000 * 60 * 60 * 24);
      if (filter === "day")   return diff <= 1;
      if (filter === "week")  return diff <= 7;
      if (filter === "month") return diff <= 30;
      if (filter === "year")  return diff <= 365;
      return true;
    });
  }, [user, filter]);

  const historyChartData = filteredHistory.map((entry) => ({
    date:  entry.date,
    score: Object.values(entry.marks || {}).reduce((a, b) => a + b, 0),
  }));

  const barData = subjects.map((sub) => ({
    subject: sub,
    you: user?.marks?.[sub] || 0,
    avg: Number(getAverage(sub).toFixed(1)),
  }));

  const analysis = useMemo(() =>
    subjects.map((sub) => {
      const your = user?.marks?.[sub] || 0;
      const avg  = getAverage(sub);
      if (avg === 0)          return { sub, status: "No Data"   };
      if (your < avg - 10)    return { sub, status: "Weak"      };
      if (your < avg)         return { sub, status: "Below Avg" };
      if (your >= avg + 10)   return { sub, status: "Strong"    };
      return                         { sub, status: "Good"      };
    }),
    [user, subjects, getAverage]
  );
  // ── END ORIGINAL LOGIC ────────────────────────────────────────────────────

  if (!user) return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.subtext, fontFamily: "monospace",
    }}>
      Loading…
    </div>
  );

  const FILTERS = ["day", "week", "month", "year"];

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: `radial-gradient(ellipse at 30% 10%, #1a1640 0%, ${C.bg} 55%, #0b1220 100%)`,
      color: C.text,
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ── RIGHT CONTENT PANEL ───────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: "40px 44px", overflowY: "auto" }}>

        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: 0, fontSize: 11, color: C.subtext, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
            Analytics
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>
            Performance Analysis
          </h1>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {FILTERS.map((type) => {
            const active = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 50,
                  border: active ? `1px solid ${C.indigo}` : `1px solid ${C.border}`,
                  background: active
                    ? "rgba(99,102,241,0.18)"
                    : "rgba(255,255,255,0.04)",
                  color: active ? "#a5b4fc" : C.subtext,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  transition: "all 0.15s ease",
                }}
              >
                {type.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Trend Chart */}
        <Card title={`Performance Trend · ${filter.toUpperCase()}`} style={{ marginBottom: 20 }}>
          {historyChartData.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={historyChartData}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.cyan} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: C.muted, fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: C.muted, fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="score"
                  stroke={C.cyan} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.cyan, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: C.cyan }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: 160, display: "flex", alignItems: "center", justifyContent: "center",
              color: C.muted, fontSize: 14, fontFamily: "monospace",
              border: `1px dashed ${C.border}`, borderRadius: 12,
            }}>
              No data for this period
            </div>
          )}
        </Card>

        {/* Bar Chart */}
        <Card title="Your Marks vs Class Average" style={{ marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="subject"
                tick={{ fill: C.muted, fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fill: C.muted, fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: C.subtext, paddingTop: 12 }}
              />
              <Bar dataKey="you" fill={C.indigo} radius={[6, 6, 0, 0]} />
              <Bar dataKey="avg" fill={C.cyan}   radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Detailed Comparison Table */}
        <Card title="Detailed Comparison">
          {subjects.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, fontFamily: "monospace", margin: 0 }}>
              No subjects added yet.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
              <thead>
                <tr>
                  {["Subject", "Your Marks", "Class Avg", "Status"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "0 14px 10px",
                      fontSize: 11, color: C.muted,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      fontFamily: "monospace", fontWeight: 600,
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, i) => {
                  const meta    = statusMeta[analysis[i].status] || statusMeta["No Data"];
                  const yourVal = user.marks?.[sub] || 0;
                  const avgVal  = getAverage(sub).toFixed(1);
                  const diff    = (yourVal - Number(avgVal)).toFixed(1);
                  return (
                    <tr key={sub}>
                      {/* Subject */}
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          background: "rgba(99,102,241,0.1)",
                          border: `1px solid rgba(99,102,241,0.2)`,
                          borderRadius: 8, padding: "4px 12px",
                          fontSize: 13, color: "#a5b4fc", fontWeight: 500,
                        }}>{sub}</span>
                      </td>

                      {/* Your marks */}
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{yourVal}</span>
                      </td>

                      {/* Class avg + diff */}
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ fontSize: 15, color: C.subtext }}>{avgVal}</span>
                        <span style={{
                          marginLeft: 8, fontSize: 11,
                          color: Number(diff) >= 0 ? C.green : C.red,
                          fontFamily: "monospace",
                        }}>
                          {Number(diff) >= 0 ? `+${diff}` : diff}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          background: meta.bg, border: `1px solid ${meta.border}`,
                          borderRadius: 8, padding: "4px 12px",
                          fontSize: 12, color: meta.color, fontWeight: 600,
                        }}>
                          {meta.icon} {analysis[i].status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Card>

      </div>
    </div>
  );
}