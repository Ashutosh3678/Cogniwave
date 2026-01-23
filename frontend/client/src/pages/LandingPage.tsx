import React, { useState } from "react";
import HeroSection from "../components/landingpage/HeroSection";
import HowItWorks from "../components/landingpage/HowItWorks";
import AnimatedInventoryShowcase from "../components/landingpage/AnimatedList";
import WhyChooseUs from "../components/landingpage/WhyChooseUs";
import Testimonials from "../components/landingpage/Testimonials";
import Footer from "../components/landingpage/Footer";
import KeyFeatures from "../components/landingpage/KeyFeatures";
import { motion, useScroll, useSpring } from "framer-motion";
import { VideoShowcase } from "../components/landingpage/VideoShowcase";


const LandingPage: React.FC = () => {
  const { scrollY, scrollYProgress } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  // Still tracking 'scrolled' for background styling
  const [scrolled, setScrolled] = useState(false);
  const lastYRef = React.useRef(0);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  React.useEffect(() => {
    return scrollY.on("change", (latest) => {
      const diff = latest - lastYRef.current;
      setScrolled(latest > 20); // Update background visibility based on scroll position

      if (Math.abs(diff) > 5) { // Small threshold to avoid jitter
        if (latest < 50) {
          setIsHidden(false); // Always show at top
        } else if (diff > 0) {
          setIsHidden(true); // Scrolling DOWN -> Hide
        } else if (diff < 0) {
          setIsHidden(false); // Scrolling UP -> Show
        }
      }
      lastYRef.current = latest;
    });
  }, [scrollY]);

  return (
    <div className="relative min-h-screen w-full bg-slate-50 selection:bg-black selection:text-white font-sans">

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled
          ? "bg-white/10 backdrop-blur-md border-b border-white/10 shadow-sm"
          : "bg-transparent border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 group relative z-10 cursor-pointer">
            <div className="w-32 mt-4 h-32 rounded-full -mr-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <img src="/logo.svg" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl mb-1 sm:text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent tracking-tight">
              SynapStore
            </span>
          </div>



          {/* CTA Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">

          </div>
        </div>
      </motion.nav>



      <main className="relative z-10 w-full">
        <VideoShowcase />
        <HeroSection />

        <div className="bg-white relative">
          {/* Subtle separator gradient */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50 to-white pointer-events-none" />

          <KeyFeatures />
          <WhyChooseUs />
          <HowItWorks />
          <AnimatedInventoryShowcase />
          <Testimonials />
        </div>

        <Footer />
      </main>
    </div >
  );
};

export default LandingPage;
