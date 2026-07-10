const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/websoft.png"  
            alt="Logo"
            className="w-50 h-15   mx-auto  mb-5"
          />

          <h1 className="text-3xl font-bold text-slate-800">
            Attendance System
          </h1>

          <p className="text-slate-500 mt-2">
            Sign in to your account
          </p>
        </div>

        {children}

      </div>
    </div>
  );
};

export default AuthLayout;