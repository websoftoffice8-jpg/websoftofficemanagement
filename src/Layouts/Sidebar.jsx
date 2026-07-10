import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileText,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const icons = {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileText,
  Settings,
};

const Sidebar = ({ links, isOpen, setIsOpen }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen w-64 bg-white
          shadow-[1px_0_0_0_rgba(15,23,42,0.06),8px_0_24px_-8px_rgba(15,23,42,0.08)]
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header */}
       {/* Header */}
<div className="flex items-center justify-between px-6 h-16 shrink-0">
  <div className="flex items-center gap-2.5">
    <img src="/websoft.png" alt="AttendEase" className="h-8 w-auto object-contain" />
  </div>

  <button
    onClick={() => setIsOpen(false)}
    className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
  >
    <X size={20} />
  </button>
</div>
        <div className="h-px bg-slate-100 mx-6" />

        {/* Navigation */}
        <nav className="px-3 py-5 flex flex-col gap-1 flex-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = icons[item.icon];

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-green-600 text-white shadow-sm shadow-blue-600/25"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`
                }
              >
                {Icon && (
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className="shrink-0"
                  />
                )}
                <span className="text-[13.5px] font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 p-3 border-t border-slate-100">
          <button
            className="
              w-full flex items-center gap-3
              px-3.5 py-2.5 rounded-xl
              text-slate-500
              hover:bg-red-50 hover:text-red-600
              transition-colors duration-200
            "
          >
            <LogOut size={18} strokeWidth={2} />
            <span className="text-[13.5px] font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;