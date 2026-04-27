import { useEffect, useState, useMemo } from "react";
import Sidebar from "./Sidebar";

export default function ClassPerformance() {
  const [users, setUsers] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  const [filterSubject, setFilterSubject] = useState("overall");

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(data);
  }, []);

  // ✅ Dynamic subjects (from all users)
  const subjects = useMemo(() => {
    const allSubjects = users.flatMap((u) => u.subjects || []);
    return [...new Set(allSubjects)];
  }, [users]);

  // 🔥 Filter logic
  const filteredUsers = users.filter((u) => {
    return (
      (!filterClass || u.className === filterClass) &&
      (!filterCollege || u.college === filterCollege)
    );
  });

  // 🔥 Score calculation
  const getScore = (user) => {
    if (filterSubject === "overall") {
      return Object.values(user.marks || {}).reduce((a, b) => a + b, 0);
    }
    return user.marks?.[filterSubject] || 0;
  };

  // 🔥 Sorting
  const sortedUsers = [...filteredUsers].sort(
    (a, b) => getScore(b) - getScore(a)
  );

  const topPerformer = sortedUsers[0];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      <Sidebar />

      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl text-indigo-400">
          Class Performance
        </h1>

        {/* 🔥 FILTERS */}
        <div className="card flex gap-4 flex-wrap">

          <input
            placeholder="Filter by Class"
            onChange={(e) => setFilterClass(e.target.value)}
            className="input"
          />

          <input
            placeholder="Filter by College"
            onChange={(e) => setFilterCollege(e.target.value)}
            className="input"
          />

          {/* ✅ Dynamic Subject Dropdown */}
          <select
            onChange={(e) => setFilterSubject(e.target.value)}
            className="input bg-white/10 text-white appearance-none"
          >
            <option value="overall" className="bg-black text-white">
              Overall
            </option>

            {subjects.map((s) => (
              <option key={s} className="bg-black text-white">
                {s}
              </option>
            ))}
          </select>

        </div>

        {/* 🏆 TOP PERFORMER */}
        {topPerformer && (
          <div className="card text-center">

            <h2 className="text-xl mb-2">🏆 Top Performer</h2>

            <p className="text-indigo-400 text-lg">
              {topPerformer.studentId}
            </p>

            <p>
              Score: {getScore(topPerformer)}
            </p>

          </div>
        )}

        {/* 📊 LEADERBOARD */}
        <div className="card">

          <h3 className="mb-4">Leaderboard</h3>

          <table className="w-full text-center">
            <thead>
              <tr className="text-gray-400">
                <th>Rank</th>
                <th>ID</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              {sortedUsers.map((u, i) => (
                <tr key={u.studentId}>
                  <td>#{i + 1}</td>
                  <td>{u.studentId}</td>
                  <td>{getScore(u)}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}