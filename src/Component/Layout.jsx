import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-indigo-900 to-black text-white">

      
      <div className="w-64 h-full fixed left-0 top-0">
        <Sidebar />
      </div>

      
      <div className="ml-64 flex-1 p-6 overflow-y-auto">
        <Outlet />
      </div>

    </div>
  );
}