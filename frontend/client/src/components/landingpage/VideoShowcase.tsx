import { motion } from "framer-motion";
import { Play, Shield, Activity, Sparkles } from "lucide-react";

export const VideoShowcase = () => {
    return (
        <section className="pt-32 pb-32 bg-slate-50 relative overflow-hidden">
            {/* Mesh Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-teal-100 rounded-full blur-[100px]" />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200/50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <Sparkles className="w-3 h-3" />
                            <span>Workflow Walkthrough</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                            See Innovation <br className="hidden md:block" />
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent italic">In Motion</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                            Experience the surgical precision of SynapStore's predictive inventory engine and intuitive pharmacist dashboard.
                        </p>
                    </motion.div>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Decorative Floating Elements */}
                    <motion.div 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-12 top-1/4 z-20 hidden lg:flex p-4 bg-white rounded-2xl shadow-xl border border-slate-100 items-center gap-3"
                    >
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">Secure Database</span>
                    </motion.div>

                    <motion.div 
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -right-12 top-1/2 z-20 hidden lg:flex p-4 bg-white rounded-2xl shadow-xl border border-slate-100 items-center gap-3"
                    >
                        <div className="p-2 bg-teal-50 rounded-lg">
                            <Activity className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">Real-time Analytics</span>
                    </motion.div>

                    {/* Main Video Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative group"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                        
                        <div className="relative aspect-video rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/80 backdrop-blur-sm bg-slate-900 shadow-emerald-500/10 transition-transform duration-500 hover:scale-[1.01]">
                            <iframe
                                src="https://player.cloudinary.com/embed/?cloud_name=ddrj7yzyl&public_id=SynapStore_-_Intelligent_Pharmacy_Management_System_-_3_January_2026_reqawv&profile=cld-default&autoplay=true"
                                className="w-full h-full"
                                style={{ height: 'auto', width: '100%', aspectRatio: '640 / 360' }}
                                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                                allowFullScreen
                                frameBorder="0"
                            ></iframe>

                            {/* Custom Play Overlay (Mobile/Initial) */}
                            <div className="absolute inset-0 bg-slate-900/10 pointer-events-none transition-all duration-500 group-hover:bg-transparent" />
                        </div>
                        
                        {/* Bottom Info Bar (Glassmorphism) */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[60%] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 flex items-center justify-between gap-4 z-30"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 relative" />
                                </div>
                                <span className="text-sm font-bold text-slate-900 tracking-tight">Full Platform Walkthrough</span>
                                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200">2026 Edition</span>
                            </div>
                            
                            <a 
                                href="https://player.cloudinary.com/embed/?cloud_name=ddrj7yzyl&public_id=SynapStore_-_Intelligent_Pharmacy_Management_System_-_3_January_2026_reqawv&profile=cld-default" 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white transition-colors"
                            >
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
