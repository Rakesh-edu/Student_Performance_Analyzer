
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Login from "./Component/Login.jsx";
import Signin from "./Component/Signin.jsx";
import Home from "./Component/Home.jsx";
import Performance from "./Component/Performance.jsx";
import Insights from "./Component/Insights.jsx";
import Settings from "./Component/Settings.jsx";
import ClassPerformance from "./Component/ClassPerformance.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/class-performance" element={<ClassPerformance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
