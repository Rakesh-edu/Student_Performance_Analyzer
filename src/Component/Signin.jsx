import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
    className: "",
    college: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];

  const userExists = existingUsers.find(
    (user) => user.studentId === formData.studentId
  );

  if (userExists) {
    alert("User already exists!");
    return;
  }

  // ✅ add new user
  existingUsers.push(formData);
  localStorage.setItem("users", JSON.stringify(existingUsers));

  // ✅ VERY IMPORTANT: store logged-in user
  localStorage.setItem("currentUser", JSON.stringify(formData));

  alert("Account created!");

  // ✅ go directly to home
  navigate("/home");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-black">

      {/* 3D glow background */}
      <div className="absolute w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20 top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20 bottom-10 right-10"></div>

      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-[350px]">

        <h2 className="text-white text-xl mb-6 text-center font-semibold">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="studentId"
            placeholder="Student ID"
            onChange={handleChange}
            className="w-full p-3 bg-white/10 text-white rounded-xl outline-none"
          />

          <input
            name="className"
            placeholder="Class (B.Tech CSE)"
            onChange={handleChange}
            className="w-full p-3 bg-white/10 text-white rounded-xl"
          />

          <input
            name="college"
            placeholder="College Name"
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

          <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition-all">
            Sign Up
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}