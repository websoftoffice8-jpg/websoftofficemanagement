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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          h-screen w-64 bg-white border-r shadow-md
          transform transition-transform duration-300
          ${
            isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b">
          <h1 className="text-xl font-bold text-blue-600">
            AttendEase
          </h1>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-5 flex flex-col gap-2">
          {links.map((item) => {
            console.log(item.icon);
            const Icon = icons[item.icon];

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {Icon && <Icon size={20} />}
                <span className="font-medium">{item.name  }</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 w-full border-t p-4">
          <button
            className="
              w-full flex items-center gap-3
              px-4 py-3 rounded-lg
              text-red-600
              hover:bg-red-50
              transition
            "
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;