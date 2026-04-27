import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const linkClass = (path) =>
    `block px-3 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-indigo-600 text-white"
        : "text-gray-300 hover:bg-white/10"
    }`;

  return (
    <div className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 p-6">

      <h1 className="text-4xl font-bold text-indigo-400 mb-6">
        EduAnalyze
      </h1>

      <nav className="space-y-2">
        <Link to="/home" className={linkClass("/home")}>Dashboard</Link>
        <Link to="/performance" className={linkClass("/performance")}>Your Performance</Link>
        <Link to="/class-performance" className={linkClass("/class-performance")}>Class Performance</Link>
        <Link to="/insights" className={linkClass("/insights")}>AI Insights</Link>
        <Link to="/settings" className={linkClass("/settings")}>Settings</Link>
      </nav>
    </div>
  );
}