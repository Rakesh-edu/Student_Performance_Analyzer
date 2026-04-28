import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ FIXED LOGIN (API + localStorage fallback)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.studentId || !formData.password) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      let users = [];

      // 🔥 Try API
      try {
        const res = await API.get("/users");
        users = res.data;
      } catch (err) {
        console.log("API failed, using localStorage");

        users =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("users")) || []
            : [];
      }

      const user = users.find(
        (u) =>
          u.studentId === formData.studentId &&
          u.password === formData.password
      );

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        navigate("/home");
      } else {
        setError("Invalid Student ID or Password");
      }

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">

      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 top-10 right-10"></div>
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 bottom-10 left-10"></div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-[350px]">

        <h2 className="text-white text-xl mb-6 text-center font-semibold">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Student ID"
            className="w-full p-3 bg-white/10 text-white rounded-xl outline-none"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 bg-white/10 text-white rounded-xl outline-none"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-sm text-gray-400 cursor-pointer"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          New user?{" "}
          <Link to="/" className="text-indigo-400 hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}