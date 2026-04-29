import { useEffect, useState, useMemo } from "react";
import { API } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      "#07091a",
  surface: "rgba(255,255,255,0.03)",
  border:  "rgba(255,255,255,0.07)",
  indigo:  "#6366f1",
  indigoL: "#818cf8",
  cyan:    "#22d3ee",
  green:   "#4ade80",
  yellow:  "#fbbf24",
  red:     "#f87171",
  gold:    "#f59e0b",
  muted:   "#64748b",
  text:    "#e2e8f0",
  sub:     "#94a3b8",
};

const MEDAL = ["🥇", "🥈", "🥉"];
const MEDAL_COLOR = [C.gold, "#94a3b8", "#cd7f32"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
          margin: "0 0 18px", fontSize: 11, fontWeight: 700,
          color: C.sub, letterSpacing: "0.12em",
          textTransform: "uppercase", fontFamily: "monospace",
          borderBottom: `1px solid ${C.border}`, paddingBottom: 14,
        }}>{title}</p>
      )}
      {children}
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: "9px 14px",
  color: C.text,
  fontSize: 13,
  outline: "none",
  fontFamily: "monospace",
  minWidth: 160,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "10px 16px", fontSize: 13, color: C.text,
    }}>
      <p style={{ margin: "0 0 4px", color: C.sub, fontFamily: "monospace", fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, color: p.color }}>{p.name}: <b>{p.value}</b></p>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ClassPerformance() {
  const [users,          setUsers]          = useState([]);
  const [filterClass,    setFilterClass]    = useState("");
  const [filterCollege,  setFilterCollege]  = useState("");
  const [filterSubject,  setFilterSubject]  = useState("overall");
  const [searchId,       setSearchId]       = useState("");        // NEW: search by ID
  const [sortDir,        setSortDir]        = useState("desc");    // NEW: toggle sort
  const [loading,        setLoading]        = useState(true);
  const [currentUserId,  setCurrentUserId]  = useState(null);      // NEW: highlight self

  // ── ORIGINAL FETCH LOGIC (unchanged) ──────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch {
        const local = typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("users")) || []
          : [];
        setUsers(local);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();

    // load current user for self-highlight
    if (typeof window !== "undefined") {
      const cur = JSON.parse(localStorage.getItem("currentUser"));
      if (cur) setCurrentUserId(cur.studentId);
    }
  }, []);

  // ── ORIGINAL LOGIC (unchanged) ────────────────────────────────────────────
  const subjects = useMemo(() => {
    const all = users.flatMap((u) => u.subjects || []);
    return [...new Set(all)];
  }, [users]);

  // ── getScore as useMemo-safe callback ─────────────────────────────────────
  const getScore = useMemo(() => (user) => {
    if (filterSubject === "overall")
      return Object.values(user.marks || {}).reduce((a, b) => a + b, 0);
    return user.marks?.[filterSubject] || 0;
  }, [filterSubject]);

  const filteredUsers = useMemo(() =>
    users.filter((u) =>
      (!filterClass   || u.className?.toLowerCase().includes(filterClass.toLowerCase())) &&
      (!filterCollege || u.college?.toLowerCase().includes(filterCollege.toLowerCase())) &&
      (!searchId      || u.studentId?.toLowerCase().includes(searchId.toLowerCase()))
    ),
    [users, filterClass, filterCollege, searchId]
  );

  const sortedUsers = useMemo(() =>
    [...filteredUsers].sort((a, b) =>
      sortDir === "desc" ? getScore(b) - getScore(a) : getScore(a) - getScore(b)
    ),
    [filteredUsers, sortDir, getScore]
  );

  const topPerformer = sortedUsers[0];
  // ── END ORIGINAL LOGIC ────────────────────────────────────────────────────

  // ── Derived stats (all properly memoized) ─────────────────────────────────
  const classAvg = useMemo(() => {
    if (!filteredUsers.length) return "0.0";
    const total = filteredUsers.reduce((s, u) => s + getScore(u), 0);
    return (total / filteredUsers.length).toFixed(1);
  }, [filteredUsers, getScore]);

  const highScore = useMemo(() =>
    sortedUsers.length ? getScore(sortedUsers[0]) : 0,
    [sortedUsers, getScore]
  );

  const lowScore = useMemo(() =>
    sortedUsers.length ? getScore(sortedUsers[sortedUsers.length - 1]) : 0,
    [sortedUsers, getScore]
  );

  // NEW: bar chart – top 8 scores
  const barData = sortedUsers.slice(0, 8).map((u) => ({
    id:    u.studentId,
    score: getScore(u),
  }));

  // unique classes and colleges for dropdown filters
  const classOptions   = [...new Set(users.map(u => u.className).filter(Boolean))];
  const collegeOptions = [...new Set(users.map(u => u.college).filter(Boolean))];

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: C.sub, fontFamily: "monospace", fontSize: 14,
    }}>
      Loading leaderboard…
    </div>
  );

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: `radial-gradient(ellipse at 70% 5%, #14103a 0%, ${C.bg} 55%, #0b1220 100%)`,
      color: C.text,
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        select option { background: #1e293b; color: #e2e8f0; }
        tr.self-row td { background: rgba(99,102,241,0.08); }
      `}</style>

      {/* ── RIGHT CONTENT ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: "40px 44px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: 0, fontSize: 11, color: C.sub, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>
            Rankings
          </p>
          <h1 style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: "-0.02em" }}>
            Class Performance
          </h1>
        </div>

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <Card title="Filters" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>

            {/* Class dropdown (fixed: was plain input before) */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">All Classes</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* College dropdown (fixed) */}
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">All Colleges</option>
              {collegeOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Subject filter (original) */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="overall">Overall Score</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* NEW: Search by student ID */}
            <input
              placeholder="🔍  Search Student ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={inputStyle}
            />

            {/* NEW: Sort toggle */}
            <button
              onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
              style={{
                background: "rgba(99,102,241,0.12)",
                border: `1px solid rgba(99,102,241,0.3)`,
                borderRadius: 10, padding: "9px 18px",
                color: C.indigoL, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.08em",
              }}
            >
              {sortDir === "desc" ? "↓ High → Low" : "↑ Low → High"}
            </button>

            {/* Result count */}
            <span style={{ fontSize: 12, color: C.muted, fontFamily: "monospace", marginLeft: "auto" }}>
              {sortedUsers.length} student{sortedUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </Card>

        {/* ── Stats Row ────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Total Students", val: sortedUsers.length,     icon: "👥", accent: C.cyan   },
            { label: "Class Average",  val: classAvg,               icon: "📊", accent: C.indigo },
            { label: "High Score",     val: highScore,              icon: "🏆", accent: C.gold   },
            { label: "Low Score",      val: lowScore,               icon: "📉", accent: C.red    },
          ].map(({ label, val, icon, accent }) => (
            <div key={label} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "18px 20px",
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: `${accent}1a`, border: `1px solid ${accent}33`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>{label}</p>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>{val}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* ── Top Performer + Top 3 podium ─────────────────────────────────── */}
        {topPerformer && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 20 }}>

            {/* Top Performer spotlight */}
            <div style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(99,102,241,0.1))",
              border: `1px solid rgba(245,158,11,0.25)`,
              borderRadius: 20, padding: "28px 24px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
              textAlign: "center",
            }}>
              <span style={{ fontSize: 42 }}>🏆</span>
              <p style={{ margin: 0, fontSize: 10, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "monospace" }}>Top Performer</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.gold }}>{topPerformer.studentId}</p>
              <div style={{
                background: "rgba(245,158,11,0.15)", border: `1px solid rgba(245,158,11,0.3)`,
                borderRadius: 50, padding: "4px 18px", fontSize: 13, color: C.gold, fontFamily: "monospace",
              }}>
                {getScore(topPerformer)} pts
              </div>
              {topPerformer.className && (
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{topPerformer.className} · {topPerformer.college}</p>
              )}
            </div>

            {/* Top 3 podium cards */}
            <Card title="Top 3 Podium">
              <div style={{ display: "flex", gap: 12 }}>
                {sortedUsers.slice(0, 3).map((u, i) => (
                  <div key={u.id || u.studentId} style={{
                    flex: 1,
                    background: `${MEDAL_COLOR[i]}10`,
                    border: `1px solid ${MEDAL_COLOR[i]}30`,
                    borderRadius: 14, padding: "16px 12px",
                    textAlign: "center",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 28 }}>{MEDAL[i]}</span>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.text }}>{u.studentId}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                      {u.className || "—"}
                    </p>
                    <div style={{
                      background: `${MEDAL_COLOR[i]}20`, border: `1px solid ${MEDAL_COLOR[i]}40`,
                      borderRadius: 50, padding: "3px 14px", fontSize: 13,
                      fontWeight: 700, color: MEDAL_COLOR[i], fontFamily: "monospace",
                    }}>
                      {getScore(u)}
                    </div>
                  </div>
                ))}
                {sortedUsers.length === 0 && (
                  <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>No students match the filters.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── NEW: Bar Chart – Top 8 ────────────────────────────────────────── */}
        {barData.length > 0 && (
          <Card title="Score Distribution · Top 8" style={{ marginBottom: 20 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="id"    tick={{ fill: C.muted, fontSize: 11, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="score" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[6,6,0,0]}>
                  {barData.map((_, i) => (
                    <rect key={i} fill={i < 3 ? MEDAL_COLOR[i] : C.indigo} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ── Leaderboard Table ─────────────────────────────────────────────── */}
        <Card title="Full Leaderboard">
          {sortedUsers.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 13, fontFamily: "monospace", margin: 0 }}>
              No students found with these filters.
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 5px" }}>
              <thead>
                <tr>
                  {["Rank", "Student ID", "Class", "College", "Score"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "0 14px 12px",
                      fontSize: 11, color: C.muted,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      fontFamily: "monospace", fontWeight: 600,
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((u, i) => {
                  const isSelf  = u.studentId === currentUserId;
                  const score   = getScore(u);
                  const isTop3  = i < 3;
                  return (
                    <tr key={u.id || u.studentId} style={{
                      background: isSelf
                        ? "rgba(99,102,241,0.08)"
                        : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      transition: "background 0.15s",
                    }}>
                      {/* Rank */}
                      <td style={{ padding: "11px 14px", borderRadius: "8px 0 0 8px" }}>
                        {isTop3 ? (
                          <span style={{ fontSize: 18 }}>{MEDAL[i]}</span>
                        ) : (
                          <span style={{ fontSize: 13, color: C.muted, fontFamily: "monospace" }}>#{i + 1}</span>
                        )}
                      </td>

                      {/* Student ID */}
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            background: isSelf ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${isSelf ? "rgba(99,102,241,0.4)" : C.border}`,
                            borderRadius: 8, padding: "3px 12px",
                            fontSize: 13, fontWeight: 600,
                            color: isSelf ? C.indigoL : C.text,
                          }}>{u.studentId}</span>
                          {isSelf && (
                            <span style={{
                              fontSize: 10, color: C.indigoL, fontFamily: "monospace",
                              background: "rgba(99,102,241,0.1)", borderRadius: 4,
                              padding: "2px 6px", border: `1px solid rgba(99,102,241,0.2)`,
                            }}>YOU</span>
                          )}
                        </div>
                      </td>

                      {/* Class */}
                      <td style={{ padding: "11px 14px", fontSize: 13, color: C.sub }}>{u.className || "—"}</td>

                      {/* College */}
                      <td style={{ padding: "11px 14px", fontSize: 12, color: C.muted, fontFamily: "monospace" }}>{u.college || "—"}</td>

                      {/* Score */}
                      <td style={{ padding: "11px 14px", borderRadius: "0 8px 8px 0" }}>
                        <span style={{
                          fontSize: 15, fontWeight: 700,
                          color: isTop3 ? MEDAL_COLOR[i] : C.text,
                        }}>{score}</span>
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