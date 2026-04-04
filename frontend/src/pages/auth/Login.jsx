import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const roleRedirects = {
  admin: "/admin",
  cashier: "/pos",
  kitchen: "/kitchen",
  customer: "/menu",
};

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success("Welcome back!");
      // Restore the full URL (e.g. /menu?table=5) that was saved before the login redirect
      const savedUrl = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(savedUrl || roleRedirects[result.role] || "/menu");
    } else {
      toast.error(result.message);
    }
  };

  const quickFill = (email, password) => setForm({ email, password });

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* BG blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl mb-4 text-3xl">
            ☕
          </div>
          <h1 className="text-3xl font-bold text-white">Smart Cafeteria</h1>
          <p className="text-slate-400 mt-1">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick login demos */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center mb-3">
              Quick demo access
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "Admin", email: "admin@example.com", color: "indigo" },
                {
                  role: "Cashier",
                  email: "cashier@example.com",
                  color: "emerald",
                },
                {
                  role: "Kitchen",
                  email: "kitchen@example.com",
                  color: "orange",
                },
                {
                  role: "Customer",
                  email: "customer@example.com",
                  color: "blue",
                },
              ].map(({ role, email, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickFill(email, "Password@123")}
                  className={`text-xs px-3 py-2 rounded-lg border border-slate-700 hover:border-${color}-500 text-slate-400 hover:text-${color}-400 transition-all`}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">
              Password: Password@123
            </p>
          </div>

          <p className="text-center text-slate-500 text-sm mt-4">
            No account?{" "}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
