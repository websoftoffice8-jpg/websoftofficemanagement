import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = ({ links, userName }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        links={links}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {/* Main Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar
          userName={userName}
          setIsOpen={setIsOpen}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;