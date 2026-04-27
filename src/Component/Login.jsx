import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const validUser = users.find(
    (user) =>
      user.studentId === formData.studentId &&
      user.password === formData.password
  );

  if (validUser) {
    alert("Login successful!");
    localStorage.setItem("currentUser", JSON.stringify(validUser));
navigate("/home");
  } else {
    alert("Invalid credentials");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">

      {/* 3D glow */}
      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 top-10 right-10"></div>
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 bottom-10 left-10"></div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-[350px]">

        <h2 className="text-white text-xl mb-6 text-center font-semibold">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="studentId"
            placeholder="Student ID"
            onChange={handleChange}
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl">
            Login
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          New user?{" "}
          <Link to="/" className="text-indigo-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}