
import {
  Menu,
} from "lucide-react";

const Navbar = ({ userName, setIsOpen }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-5 lg:px-6 shrink-0">

      {/* Left Side */}
      <div className="flex items-center gap-3">

        {/* Hamburger - Mobile & Tablet */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            lg:hidden
            flex
            items-center
            justify-center
            h-9
            w-9
            rounded-lg
            text-slate-600
            hover:bg-slate-100
            hover:text-slate-800
            transition-colors
          "
          aria-label="Open sidebar"
        >
          <Menu size={22} strokeWidth={2} />
        </button>

        {/* Page title */}
        {/* <h1 className="text-base sm:text-lg font-semibold text-slate-800">
          Dashboard
        </h1> */}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">

        {/* Notification */}
        <button
          type="button"
          className="
            relative
            h-9
            w-9
            flex
            items-center
            justify-center
            rounded-lg
            text-slate-500
            hover:bg-slate-100
            transition-colors
          "
        />
          

        {/* User */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm font-medium text-slate-700">
            {userName}
          </span>

          <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold">
            {userName?.charAt(0)?.toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  );
};


export default Navbar;

