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

    // 🔥 validation
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
        subjects: ["Math"], // default subject
        marks: {},
      };

      // 🔥 IMPORTANT: use API response (contains id)
      const response = await API.post("/users", newUser);

      // ✅ store user WITH id
      localStorage.setItem(
        "currentUser",
        JSON.stringify(response.data)
      );

      navigate("/home");

    } catch (err) {
      setError("Error creating account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">

      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 bottom-10 right-10"></div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-[350px]">

        <h2 className="text-white text-xl mb-6 text-center font-semibold">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Student ID */}
          <input
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="Student ID"
            className="w-full p-3 bg-white/10 text-white rounded-xl outline-none"
          />

          {/* Class */}
          <input
            name="className"
            value={formData.className}
            onChange={handleChange}
            placeholder="Class (B.Tech CSE)"
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          {/* College */}
          <input
            name="college"
            value={formData.college}
            onChange={handleChange}
            placeholder="College Name"
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-all"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        {/* Redirect */}
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