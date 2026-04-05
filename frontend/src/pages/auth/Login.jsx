import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowLeft, Coffee, ShieldCheck, User, ChefHat, Wallet } from "lucide-react";
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
      const savedUrl = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(savedUrl || roleRedirects[result.role] || "/menu");
    } else {
      toast.error(result.message);
    }
  };

  const quickFill = (email, password) => setForm({ email, password });

  const demoRoles = [
    { role: "Admin", email: "admin@example.com", icon: ShieldCheck, color: "indigo" },
    { role: "Cashier", email: "cashier@example.com", icon: Wallet, color: "emerald" },
    { role: "Kitchen", email: "kitchen@example.com", icon: ChefHat, color: "orange" },
    { role: "Customer", email: "customer@example.com", icon: User, color: "blue" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] bg-grid text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-blob delay-500" />
      </div>

      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-all group z-50 px-4 py-2 rounded-full glass hover:bg-white/5 active:scale-95"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="relative w-full max-w-md z-10">
        {/* Header Section */}
        <div className="text-center mb-10 animate-reveal">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-2xl mb-6 group hover:scale-110">
            <Coffee size={40} className="text-indigo-400 group-hover:rotate-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            <span className="gradient-text">ODOO</span> CAFETERIA
          </h1>
          <p className="text-slate-400 font-medium tracking-widest text-xs uppercase opacity-80">Premium Management System</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-[2.5rem] p-8 md:p-10 shadow-3xl border-white/5 animate-fade-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Access Portal
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Employee Email"
                  className="w-full bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-2xl px-6 py-4 text-sm input-focus"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Security Token
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-2xl px-6 py-4 text-sm input-focus"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-2"
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? "Decrypting..." : "Authorized Entry"}
              </span>
            </button>
          </form>

          {/* Quick Access Grid */}
          <div className="mt-10 pt-8 border-t border-white/5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                Fast Authentication
              </p>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {demoRoles.map(({ role, email, icon: Icon, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => quickFill(email, "Password@123")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl glass-morphism hover:bg-white/5 text-slate-400 hover:text-white transition-all text-xs font-semibold group active:scale-95`}
                >
                  <Icon size={14} className={`text-${color}-500 group-hover:scale-110 transition-transform`} />
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-xs font-medium">
              New operative?{" "}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline underline-offset-8 transition-all"
              >
                Request Authorization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
