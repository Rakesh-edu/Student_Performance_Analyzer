import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [dark, setDark] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser"));
    setUser(u);

    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!dark);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const resetData = () => {
    if (window.confirm("Are you sure?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  const updateProfile = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) =>
      u.studentId === user.studentId ? user : u
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(user));

    alert("Profile updated!");
  };

  if (!user) return <p className="text-white">Loading...</p>;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] text-white">

      {/* <Sidebar /> */}

      <div className="flex-1 p-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-gray-400 text-sm">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="glass-card">
          <h3 className="section-title">👤 Profile</h3>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <input value={user.studentId} disabled className="input" />
            <input
              value={user.className}
              onChange={(e) =>
                setUser({ ...user, className: e.target.value })
              }
              className="input"
              placeholder="Class"
            />
            <input
              value={user.college}
              onChange={(e) =>
                setUser({ ...user, college: e.target.value })
              }
              className="input col-span-2"
              placeholder="College"
            />
          </div>

          <button onClick={updateProfile} className="btn-primary mt-4">
            Update Profile
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="glass-card flex justify-between items-center">
          <div>
            <h3 className="section-title">🌗 Theme</h3>
            <p className="text-sm text-gray-400">Switch between light & dark</p>
          </div>

          {/* Toggle Switch */}
          <div
            onClick={toggleTheme}
            className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition ${
              dark ? "bg-indigo-600" : "bg-gray-400"
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
                dark ? "translate-x-7" : ""
              }`}
            />
          </div>
        </div>

        {/* Account */}
        <div className="glass-card">
          <h3 className="section-title">🔐 Account</h3>

          <button
            onClick={handleLogout}
            className="btn-danger mt-4"
          >
            Logout
          </button>
        </div>

        {/* Danger Zone */}
        <div className="glass-card border-red-500/40">
          <h3 className="section-title text-red-400">⚠ Danger Zone</h3>
          <p className="text-sm text-gray-400">
            This will delete all your stored data permanently.
          </p>

          <button
            onClick={resetData}
            className="btn-danger mt-4"
          >
            Reset All Data
          </button>
        </div>

      </div>
    </div>
  );
}