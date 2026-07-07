import AuthLayout from "../Layouts/AuthLayouts";

const Login = () => {
  return (
    <AuthLayout>
      <form className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Employee Name
          </label>

          <input
            type="text"
            placeholder="Enter Employee Name"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button  
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Login
        </button>

      </form>
    </AuthLayout>
  );
};

export default Login;   