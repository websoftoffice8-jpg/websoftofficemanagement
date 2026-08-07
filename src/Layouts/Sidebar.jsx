import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileText,
  Settings,
  ShieldCheck,
  Palmtree,
  LogOut,
  X,
} from "lucide-react";
import api from "../API/Axios";
import ENDPOINTS from "../API/endpoints";

const icons = {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileText,
  Settings,
  ShieldCheck,
  Palmtree,
};

const Sidebar = ({ links, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get(
          `${ENDPOINTS.PERMISSIONS}?status=Pending`
        );
        setPendingCount(res.data.length);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPendingCount();

    // Optional: keep the badge fresh without a full page reload
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex items-center justify-between px-6 h-16 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/websoft.png" alt="AttendEase" className="h-10 w-44 object-contain" />
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
            const isPermissionsLink = item.path === "/admin/permissions";

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200
                  ${isActive
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
                <span className="text-[13.5px] font-medium flex-1">{item.name}</span>

                {isPermissionsLink && pendingCount > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-semibold leading-none">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="shrink-0 p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 hover:bg-red-50 text-red-600"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

