import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Coffee, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const roleRedirects = {
  admin: '/admin',
  cashier: '/pos',
  kitchen: '/kitchen',
  customer: '/menu',
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[@$!%*?&]/.test(pass);
    const isLongEnough = pass.length >= 8;

    if (!isLongEnough) return "Password must be at least 8 characters long";
    if (!hasUpper) return "Password must contain at least one uppercase letter";
    if (!hasLower) return "Password must contain at least one lowercase letter";
    if (!hasNumber) return "Password must contain at least one number";
    if (!hasSpecial) return "Password must contain at least one special character (@$!%*?&)";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(form.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Account created!');
      navigate(roleRedirects[result.role] || '/menu');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] bg-grid text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-blob delay-500" />
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/10 rounded-3xl border border-purple-500/20 shadow-2xl mb-6 group hover:scale-110">
            <UserPlus size={40} className="text-purple-400 group-hover:rotate-6" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">
            JOIN <span className="gradient-text">ODOO</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-widest text-xs uppercase opacity-80">Initialize your operative profile</p>
        </div>

        {/* Register Card */}
        <div className="glass rounded-[2.5rem] p-8 md:p-10 shadow-3xl border-white/5 animate-fade-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {[
                { label: 'Full Identity', key: 'name', type: 'text', placeholder: 'Agent Name' },
                { label: 'System Email', key: 'email', type: 'email', placeholder: 'operative@hq.com' },
                { label: 'Security Token', key: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'Confirm Token', key: 'confirmPassword', type: 'password', placeholder: '••••••••' },
              ].map(({ label, key, type, placeholder }, idx) => (
                <div key={key} className={`space-y-2 animate-fade-up`} style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-2xl px-6 py-4 text-sm input-focus"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 relative group overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Processing...' : 'Deploy Profile'}
              </span>
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-xs font-medium">
              Already authorized?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline underline-offset-8 transition-all"
              >
                Access Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
