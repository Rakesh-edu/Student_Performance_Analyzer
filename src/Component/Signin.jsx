import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../api";

export default function Signin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
    className: "",
    college: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.studentId ||
      !formData.password ||
      !formData.className ||
      !formData.college
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await API.get("/users");

      const exists = res.data.find(
        (u) => u.studentId === formData.studentId
      );

      if (exists) {
        setError("User already exists");
        return;
      }

      const newUser = {
        ...formData,
        subjects: [],
        marks: {},
        marksHistory: []
      };

      const response = await API.post("/users", newUser);

      // ✅ IMPORTANT FIX: also save in localStorage
      const existingUsers =
        JSON.parse(localStorage.getItem("users")) || [];

      existingUsers.push(response.data);

      localStorage.setItem("users", JSON.stringify(existingUsers));

      localStorage.setItem(
        "currentUser",
        JSON.stringify(response.data)
      );

      navigate("/home");

    } catch (err) {
      // 🔥 FALLBACK (unchanged logic)
      console.log("API failed, using localStorage");

      const existingUsers =
        JSON.parse(localStorage.getItem("users")) || [];

      const exists = existingUsers.find(
        (u) => u.studentId === formData.studentId
      );

      if (exists) {
        setError("User already exists");
        setLoading(false);
        return;
      }

      const newUser = {
        ...formData,
        subjects: [],
        marks: {},
        marksHistory: []
      };

      existingUsers.push(newUser);

      localStorage.setItem("users", JSON.stringify(existingUsers));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      navigate("/home");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">

      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 bottom-10 right-10"></div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-[350px]">

        <h2 className="text-white text-xl mb-6 text-center font-semibold">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Student ID"
            className="w-full p-3 bg-white/10 text-white rounded-xl outline-none"
          />

          <input
            name="className"
            value={formData.className}
            onChange={handleChange}
            placeholder="Class (B.Tech CSE)"
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          <input
            name="college"
            value={formData.college}
            onChange={handleChange}
            placeholder="College Name"
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-all"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}