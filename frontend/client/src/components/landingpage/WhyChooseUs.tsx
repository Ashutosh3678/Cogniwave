import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { CheckCircle2 } from "lucide-react";
import ColourfulText from "@/components/ui/colourful-text";

const TraditionalItems = [
  "Manual counting and data entry",
  "Delayed stock updates",
  "No automated alerts",
  "Limited reporting capabilities",
  "Error-prone processes",
];

const SynapItems = [
  "Automated scanning & tracking",
  "Real-time inventory updates",
  "Smart alerts & notifications",
  "Advanced analytics reporting",
  "99.9% accuracy guarantee",
];

export default function WhyChooseUs() {
  return (
    <div className="flex flex-col overflow-hidden bg-background-page">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-8">
              Why choose <br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                <ColourfulText text="SynapStore ?" />
              </span>
            </h1>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full p-2 md:p-8 overflow-y-auto">
          {/* Traditional card */}
          <article className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg ring-1 ring-white/50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-brand-text">
                Traditional Methods
              </h3>
              <div className="text-sm text-brand-text-muted">Slow & manual</div>
            </div>

            <ul className="space-y-4 flex-1">
              {TraditionalItems.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xs font-semibold">
                    ✕
                  </span>
                  <p className="text-slate-700 font-medium">{t}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500">
              Traditional methods cause manual effort and higher error rates.
            </div>
          </article>

          {/* SynapStore card */}
          <article className="relative rounded-2xl p-8 text-white shadow-xl overflow-hidden h-full flex flex-col bg-gradient-to-br from-[#10b981] to-[#047857]">
            {/* shiny overlay */}
            <div className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),transparent)] mix-blend-screen" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-2xl font-semibold">SynapStore</h3>
              <div className="text-sm text-white/90">Fast & accurate</div>
            </div>

            <ul className="space-y-4 flex-1 relative z-10">
              {SynapItems.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2
                    className="w-7 h-7 shrink-0 text-white"
                  />
                  <p className="text-white font-medium">{t}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-4 border-t border-white/20 relative z-10 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 text-white text-sm font-semibold">
                Enterprise ready
              </div>
              <div className="text-sm text-white/90">
                Proven results nationwide
              </div>
            </div>
          </article>
        </div>
      </ContainerScroll>
    </div>
  );
}
