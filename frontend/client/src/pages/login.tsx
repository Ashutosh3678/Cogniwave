// src/pages/login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Icons
import { ChevronLeft, PlayCircle, ExternalLink } from "lucide-react";
// Animation
import { motion, AnimatePresence } from "framer-motion";
import Login3DCharacter from "../components/Login3DCharacter";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // 3D Character Interaction State (kept for idle animation feel)
  const [focusedField] = useState<"email" | "password" | null>(null);
  const [keyTrigger] = useState(0);

  return (
    <div className="min-h-screen relative grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100">

      {/* Desktop Back Navigation */}
      <div className="absolute top-8 left-8 z-50">
        <p
          onClick={() => navigate("/")}
          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-white/50 cursor-pointer"
          aria-label="Back to landing page"
        >
          <ChevronLeft className="w-8 h-8" />
        </p>
      </div>

      {/* LEFT SIDE - 3D Character (Desktop Only) */}
      <div className="hidden lg:flex relative items-center justify-center bg-emerald-50/30">
        {/* Background Blobs for Left Side */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-emerald-300/20 rounded-full blur-[80px] pointer-events-none"
        />

        {/* The 3D Component */}
        <div className="w-full h-full absolute inset-0">
          <Login3DCharacter focusedField={focusedField} keyTrigger={keyTrigger} />
        </div>
      </div>

      {/* RIGHT SIDE - Info Panel */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto relative">

        {/* Mobile Background Blob */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-300/20 rounded-full blur-[100px] pointer-events-none lg:hidden"
        />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="relative bg-white/80 backdrop-blur-xl border border-emerald-100/50 rounded-3xl shadow-xl p-8 md:p-10">

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  SynapStore
                </h1>
                <p className="text-slate-500 mt-2 text-sm">
                  Empowering your business with intelligence
                </p>
              </motion.div>
            </div>

            {/* Hackathon Notification */}
            <div className="mb-6 p-3 bg-white/50 border border-slate-200 rounded-xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-full shrink-0">
                  <PlayCircle className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900">Hackathon Demo</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Safe Mode
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Deployment paused. Backends are disabled.
                  </p>
                </div>
              </div>
              <a
                href="https://player.cloudinary.com/embed/?cloud_name=ddrj7yzyl&public_id=SynapStore_-_Intelligent_Pharmacy_Management_System_-_3_January_2026_reqawv&profile=cld-default"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <span>Watch Workflow Video</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key="status-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 mb-6 font-medium">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Thank you for your interest in SynapStore. To ensure the best experience while managing cloud resources, we have transitioned this instance to a <span className="font-semibold text-emerald-700">Demonstration Only</span> mode.
                  </p>
                </div>
                
                <p className="text-xs text-slate-400 font-medium">
                  Please refer to the workflow video above to see the platform in action.
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} SynapStore. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
