// CTAAndFooter.tsx
import { MaskContainer } from "@/components/ui/svg-mask-effect";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function CTAAndFooter() {
  const year = new Date().getFullYear();

  return (
    <div className="w-full bg-background-page">
      {/* Styles kept inline for single-file convenience */}
      <style>{`
        /* Respect user's reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeInUp,
          .animate-float,
          .animate-pulse-glow,
          .animate-pulse-status,
          .gradient-animated {
            animation: none !important;
          }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse-status {
          0%   { transform: scale(1); opacity: 0.95; }
          50%  { transform: scale(1.6); opacity: 0.45; }
          100% { transform: scale(1); opacity: 0.95; }
        }

        .animate-pulse-status {
          animation: pulse-status 1.8s ease-in-out infinite;
          transform-origin: center;
          will-change: transform, opacity;
          animation-fill-mode: both;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
          transform-origin: center;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .gradient-animated {
          background: linear-gradient(-45deg, #10b981, #059669, #14b8a6, #0d9488);
          background-size: 400% 400%;
          animation: gradient-shift 8s ease infinite;
        }

        /* Stagger helpers */
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }

        /* Focus-visible for keyboard users */
        .focus-ring:focus-visible {
          outline: 3px solid rgba(16, 185, 129, 0.3);
          outline-offset: 2px;
          border-radius: 0.75rem;
        }

        /* Hover underline effect for textual links */
        .link-hover { position: relative; transition: all 0.22s ease; }
        .link-hover::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background-color: #10b981;
          transition: width 0.25s ease;
        }
        .link-hover:hover::after { width: 100%; }

        /* Small utilities for CTAs */
        .cta-button { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .cta-button:hover { transform: scale(1.05); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3); }
        .cta-button:active { transform: scale(0.985); }

        .logo-container { transition: transform 0.28s ease; will-change: transform; }
        .logo-container:hover { transform: rotate(5deg) scale(1.05); }
      `}</style>

      {/* CTA Section */}
      <section className="relative w-full border-t border-slate-100 bg-slate-50">
        <MaskContainer
          revealText={
            <div className="flex flex-col items-center justify-center text-center p-10 mt-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
              <h2 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-slate-600 to-slate-400">
                Ready to <span className="text-slate-900">scale?</span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Your pharmacy deserves a system that works as hard as you do.
                <br />
                <span className="text-sm font-semibold uppercase tracking-widest mt-8 flex items-center justify-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                  Hover to reveal
                </span>
              </p>
              <div className="px-8 py-4 rounded-full border border-dashed border-slate-300 text-slate-400 text-sm font-medium tracking-wide">
                synapstore.com/start
              </div>
            </div>
          }
          className="h-[30rem] rounded-none border-b border-slate-200 bg-slate-50"
          revealSize={500}
        >
          <div className="flex flex-col items-center justify-center text-center p-10 mt-10 h-full w-full">
            <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter drop-shadow-2xl">
              Start <span className="text-emerald-300">Syncing.</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              Join 5,000+ pharmacies modernizing their stack today.
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center gap-3 px-12 py-6 bg-white text-emerald-700 rounded-full font-bold text-xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] hover:bg-black hover:scale-105 transition-all"
            >
              Get Started Free
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>
        </MaskContainer>
      </section>

      {/* FOOTER */}
      {/* FOOTER */}
      <footer className="relative bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-20">

          {/* Brand */}
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex items-center justify-center gap-5">
              <img
                src="/logo.svg"
                alt="SynapStore Logo"
                className="w-36 h-36  object-contain"
              />
              <span className="relative top-1 text-4xl  font-semibold tracking-tight text-slate-900">
                SynapStore
              </span>
            </div>

            <p className="max-w-2xl text-lg text-slate-600 leading-relaxed font-medium">
              Intelligent inventory infrastructure for modern pharmacies.
              Built to reduce friction, eliminate stockouts, and scale operations
              with confidence.
            </p>

            {/* Social */}
            <div className="flex items-center gap-8 pt-4">
              <a
                href="https://www.synapstore.me"
                target="_blank"
                className="text-slate-400 hover:text-slate-900 transition"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://www.synapstore.me"
                target="_blank"
                className="text-slate-400 hover:text-slate-900 transition"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a
                href="https://github.com/sreecharan-desu/SynapStore"
                target="_blank"
                className="text-slate-400 hover:text-slate-900 transition"
              >
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="my-14 border-t border-slate-100" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-sm text-slate-500">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <span className="font-medium text-slate-600">
                © {year} SynapStore
              </span>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-slate-900 transition">
                  Privacy
                </a>
                <a href="#" className="hover:text-slate-900 transition">
                  Terms
                </a>
                <a href="#" className="hover:text-slate-900 transition">
                  Cookies
                </a>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700">
                Systems operational
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
