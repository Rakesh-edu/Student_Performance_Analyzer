import { useEffect, useMemo, useState } from "react";
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

  // ✅ FIXED DATA LOADING (API + fallback)
  useEffect(() => {
    const current =
      typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("currentUser"))
        : null;

    if (!current) {
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);

        const updatedUser = res.data.find((u) => u.id === current.id);
        setUser(updatedUser || current);

      } catch (err) {
        console.log("API failed, using localStorage");

        const localUsers =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("users")) || []
            : [];

        setUsers(localUsers);

        const updatedUser = localUsers.find(
          (u) => u.studentId === current.studentId
        );

        setUser(updatedUser || current);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const subjects = user?.subjects || [];

  // 🔥 Add Subject
  const addSubject = async () => {
    if (!newSubject.trim()) return;

    const updatedUser = {
      ...user,
      subjects: [...(user.subjects || []), newSubject],
    };

    try {
      await API.put(`/users/${user.id}`, updatedUser);
    } catch {
      console.log("API failed, saving locally");
    }

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    const existingUsers =
      JSON.parse(localStorage.getItem("users")) || [];

    const updatedList = existingUsers.map((u) =>
      u.studentId === updatedUser.studentId ? updatedUser : u
    );

    localStorage.setItem("users", JSON.stringify(updatedList));

    setNewSubject("");
  };

  // 🔥 Save Marks
  const saveMarks = async () => {
    const newEntry = {
      date: new Date().toISOString().split("T")[0],
      marks: marksInput,
    };

    const updatedUser = {
      ...user,
      marks: { ...user.marks, ...marksInput },
      marksHistory: [...(user.marksHistory || []), newEntry],
    };

    try {
      await API.put(`/users/${user.id}`, updatedUser);
    } catch {
      console.log("API failed, saving locally");
    }

    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    const existingUsers =
      JSON.parse(localStorage.getItem("users")) || [];

    const updatedList = existingUsers.map((u) =>
      u.studentId === updatedUser.studentId ? updatedUser : u
    );

    localStorage.setItem("users", JSON.stringify(updatedList));

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

  const historyData = (user?.marksHistory || []).map((entry) => {
    const total = Object.values(entry.marks || {}).reduce((a, b) => a + b, 0);
    return { date: entry.date, score: total };
  });

  const improvement = useMemo(() => {
    if (historyData.length < 2) return 0;
    const prev = historyData[historyData.length - 2].score;
    const latest = historyData[historyData.length - 1].score;
    return (((latest - prev) / (prev || 1)) * 100).toFixed(1);
  }, [historyData]);

  const bestDay = useMemo(() => {
    if (!historyData.length) return null;
    return historyData.reduce((max, curr) =>
      curr.score > max.score ? curr : max
    );
  }, [historyData]);

  const dropDetected = useMemo(() => {
    if (historyData.length < 2) return false;
    const prev = historyData[historyData.length - 2].score;
    const latest = historyData[historyData.length - 1].score;
    return latest < prev;
  }, [historyData]);

  const insights = subjects.map((sub) => {
    const your = user?.marks?.[sub] || 0;
    const avg = getAverage(sub);

    if (your === 0) return { sub, msg: "No data" };
    if (your < avg - 10) return { sub, msg: "Needs improvement" };
    if (your < avg) return { sub, msg: "Below average" };
    if (your >= avg + 10) return { sub, msg: "Excellent" };
    return { sub, msg: "Good" };
  });

  // ✅ FIXED LOADING + USER CHECK
  if (loading) return <p className="text-white p-8">Loading...</p>;

  if (!user)
    return (
      <p className="text-white p-8">
        No user found. Please login again.
      </p>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">
      <div className="flex-1 p-8 space-y-6">

        <h1 className="text-2xl">
          Welcome, <span className="text-indigo-400">{user.studentId}</span>
        </h1>

        <div className="grid grid-cols-3 gap-6">
          <div className="card"><p>Average</p><h2>{avgScore.toFixed(1)}%</h2></div>
          <div className="card"><p>Rank</p><h2>#{rank}</h2></div>
          <div className="card"><p>Students</p><h2>{classmates.length}</h2></div>
        </div>

        {/* Rest of your UI remains EXACTLY same */}
      </div>
    </div>
  );
}