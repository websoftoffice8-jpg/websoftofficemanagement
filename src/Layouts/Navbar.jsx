import React from "react";

const Navbar = ({ userName = "Gaurav Dhungana" }) => {
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-end">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-800">
            {userName}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;