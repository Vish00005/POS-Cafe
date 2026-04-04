import { useNavigate } from "react-router-dom";
import { Coffee, ArrowRight, Utensils, Zap, ShieldCheck, Clock } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* ── Background Decoration ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Coffee size={24} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter leading-none">ODOO</span>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Cafeteria</span>
          </div>
        </div>
        <button 
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest mb-8 animate-fade-in">
          <Zap size={14} />
          <span>Next-Generation Cafeteria POS</span>
        </div>
        
        <h1 className="text-5xl lg:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
          Smarter Dining. <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-500">
            Seamless Service.
          </span>
        </h1>
        
        <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mb-12 font-medium leading-relaxed">
          Welcome to Odoo Cafeteria. We've redefined the dining experience with 
          instant ordering, real-time kitchen tracking, and premium service.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button 
            onClick={() => navigate("/login")}
            className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
          >
            <span>PLACE ORDER NOW</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3">
            <Utensils size={20} />
            View Full Menu
          </button>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative w-full max-w-5xl">
          <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full scale-75" />
          <img 
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200" 
            alt="Modern Cafe"
            className="relative rounded-3xl border border-white/10 shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-700 w-full aspect-video object-cover"
          />
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
          <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold mb-4">Instant Ordering</h3>
          <p className="text-slate-400 leading-relaxed">
            Scan your table QR and start ordering immediately. No more waiting for staff to arrive.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
          <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <h3 className="text-xl font-bold mb-4">Real-time Tracking</h3>
          <p className="text-slate-400 leading-relaxed">
            Monitor your order status live as the kitchen prepares your fresh meal.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
          <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold mb-4">Secure Payments</h3>
          <p className="text-slate-400 leading-relaxed">
            Multiple payment options including UPI, Cash, and Online with zero friction.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-white/5 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <div className="flex items-center gap-3">
            <Coffee size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">ODOO CAFETERIA</span>
          </div>
          <p className="text-xs font-medium">© 2026 Premium POS Systems. All rights reserved.</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Landing;
