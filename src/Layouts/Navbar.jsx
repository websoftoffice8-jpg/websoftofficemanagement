import React from "react";
import { ChevronDown } from "lucide-react";

const Navbar = ({ userName = "Gaurav Dhungana" }) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md shadow-[0_1px_0_0_rgba(15,23,42,0.06)] px-6 flex items-center justify-end sticky top-0 z-30">
      <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-white shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-tight">
            {userName}
          </p>
          <p className="text-xs text-slate-400 leading-tight">Admin</p>
        </div>

        <ChevronDown size={16} className="text-slate-400 ml-1" />
      </button>
    </header>
  );
};

export default Navbar;