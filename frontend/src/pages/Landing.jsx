import { useNavigate } from "react-router-dom";
import { Coffee, ArrowRight, Utensils, Zap, ShieldCheck, Clock, Star, Heart, Flame } from "lucide-react";

/**
 * Landing Page - Attractive, Animated, and Responsive
 */
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* ── Background Decoration ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/15 blur-[140px] rounded-full animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full animate-blob animation-delay-2000" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full animate-blob animation-delay-4000" />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 z-50 px-6 lg:px-12 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10">
              <Coffee size={24} className="text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter leading-none">ODOO</span>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Cafeteria</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Experience</a>
          <a href="#menu" className="hover:text-white transition-colors">Menu</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
        </div>

        <button 
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 animate-fade-in-up">
          <Flame size={12} className="text-orange-500" />
          <span>The Future of Dining is Here</span>
        </div>
        
        <h1 className="text-6xl lg:text-[10rem] font-black tracking-tighter mb-10 leading-[0.85] animate-reveal">
          CRAVE.<br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-500 to-pink-500 px-2 leading-tight">
            CLICK.
          </span><br />
          ENJOY.
        </h1>
        
        <p className="text-slate-400 text-lg lg:text-xl max-w-2xl mb-14 font-medium leading-relaxed animate-fade-in-up animation-delay-500">
          Odoo Cafeteria brings fine dining technology to your everyday meals. 
          Skip the queue, scan your table, and indulge in pure convenience.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto animate-fade-in-up animation-delay-700">
          <button 
            onClick={() => navigate("/login")}
            className="group relative px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
          >
            <span>Start My Order</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            onClick={() => navigate("/menu")}
            className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 backdrop-blur-xl"
          >
            <Utensils size={18} className="text-indigo-400" />
            Explore Menu
          </button>
        </div>

        {/* Hero Visual */}
        <div className="mt-32 relative w-full max-w-6xl animate-fade-in-up animation-delay-1000">
          <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-purple-600 blur-[100px] opacity-20 rounded-full scale-90" />
          <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/10 aspect-21/9 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600" 
                alt="Premium Cafeteria"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-10 left-10 text-left hidden md:block">
                <div className="flex items-center gap-1 text-yellow-400 mb-2">
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <Star size={14} fill="currentColor" />
                  <span className="text-white text-xs font-bold ml-2">4.9/5 Average Rating</span>
                </div>
                <h4 className="text-3xl font-black text-white">Loved by 10k+ Diners</h4>
              </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-20">
            <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Elevated Experience</h2>
            <h3 className="text-4xl lg:text-6xl font-black tracking-tight max-w-2xl">Crafted for the modern palate.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors" />
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/10 group-hover:scale-110 transition-transform">
              <Zap size={32} />
            </div>
            <h3 className="text-2xl font-black mb-6">Light Speed</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Skip the line. Orders reach the kitchen milliseconds after you tap. Seamless efficiency at its best.
            </p>
          </div>

          <div className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-purple-400 mb-8 border border-white/10 group-hover:scale-110 transition-transform">
              <Clock size={32} />
            </div>
            <h3 className="text-2xl font-black mb-6">Live Tracking</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              No more guessing games. Watch your meal go from preparation to completion in real-time.
            </p>
          </div>

          <div className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-pink-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/10 blur-[80px] rounded-full group-hover:bg-pink-500/20 transition-colors" />
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-pink-400 mb-8 border border-white/10 group-hover:scale-110 transition-transform">
              <Heart size={32} />
            </div>
            <h3 className="text-2xl font-black mb-6">Fine Dining</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              Premium UI meets handpicked delicacies. We treat cafeteria food with the respect it deserves.
            </p>
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="py-32 px-6 lg:px-12">
          <div className="max-w-5xl mx-auto rounded-[3rem] bg-indigo-600 p-12 lg:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
                <h2 className="text-5xl lg:text-7xl font-black tracking-tight text-white mb-8">Ready to feast?</h2>
                <p className="text-indigo-100 text-lg lg:text-xl font-medium max-w-xl mx-auto mb-12">
                    Join thousands of happy diners who've upgraded their cafeteria experience with Odoo.
                </p>
                <button 
                  onClick={() => navigate("/register")}
                  className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                    Create Free Account
                </button>
            </div>
          </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-20 border-t border-white/5 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Coffee size={24} />
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-black tracking-widest uppercase">ODOO</span>
                <span className="text-[11px] text-indigo-400 font-bold uppercase tracking-[0.4em]">Cafeteria</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Staff Login</a>
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose text-center md:text-right">
              Built with precision for the modern workplace.<br />
              © 2026 Premium POS Systems by Antigravity.
          </p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
        
        :root {
          font-family: 'Outfit', sans-serif;
        }

        .glass {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(20px);
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-1000 { animation-delay: 1s; }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(100px); clip-path: inset(0 0 100% 0); }
          to { opacity: 1; transform: translateY(0); clip-path: inset(0 0 0 0); }
        }

        .animate-reveal {
          animation: reveal 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Landing;
