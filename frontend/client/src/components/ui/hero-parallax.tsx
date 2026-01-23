"use client";
import React from "react";
import {
    motion,
    useScroll,
    useTransform,
    useSpring,
    MotionValue,
} from "motion/react";

export const HeroParallax = ({
    products,
}: {
    products: {
        title: string;
        link: string;
        thumbnail: string;
    }[];
}) => {
    const firstRow = products.slice(0, 5);
    const secondRow = products.slice(5, 10);
    const thirdRow = products.slice(10, 15);
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

    const translateX = useSpring(
        useTransform(scrollYProgress, [0, 1], [0, 1000]),
        springConfig
    );
    const translateXReverse = useSpring(
        useTransform(scrollYProgress, [0, 1], [0, -1000]),
        springConfig
    );
    const rotateX = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [15, 0]),
        springConfig
    );
    const opacity = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
        springConfig
    );
    const rotateZ = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [20, 0]),
        springConfig
    );
    const translateY = useSpring(
        useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
        springConfig
    );
    return (
        <div
            ref={ref}
            className="h-[300vh] pt-18 pb-45 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-slate-50"
        >
            {/* Background Elements */}
            <div className="absolute inset-0 h-full w-full bg-white bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-black/10 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
            </div>

            <Header />
            <motion.div
                style={{
                    rotateX,
                    rotateZ,
                    translateY,
                    opacity,
                }}
                className=""
            >
                <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
                    {firstRow.map((product) => (
                        <ProductCard
                            product={product}
                            translate={translateX}
                            key={product.title}
                        />
                    ))}
                </motion.div>
                <motion.div className="flex flex-row  mb-20 space-x-20 ">
                    {secondRow.map((product) => (
                        <ProductCard
                            product={product}
                            translate={translateXReverse}
                            key={product.title}
                        />
                    ))}
                </motion.div>
                <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
                    {thirdRow.map((product) => (
                        <ProductCard
                            product={product}
                            translate={translateX}
                            key={product.title}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
};

import { ExternalLink, PlayCircle } from "lucide-react";

export const Header = () => {
    return (
        <div className="max-w-7xl relative mx-auto py-10 md:py-24 px-4 w-full left-0 top-0 text-center flex flex-col items-center z-10">

            {/* Clean Hackathon Notification */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-12 max-w-3xl w-full bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="hidden sm:flex p-3 bg-slate-50 border border-slate-100 rounded-full shrink-0 items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                             <span className="text-sm font-semibold text-slate-900">Developed for Hackathon</span>
                             <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                                Demo Mode
                             </span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-lg">
                            Live deployment is currently paused for resource optimization. 
                            We invite you to explore the full platform capabilities in our workflow demonstration.
                        </p>
                    </div>
                </div>
                <a
                    href="https://player.cloudinary.com/embed/?cloud_name=ddrj7yzyl&public_id=SynapStore_-_Intelligent_Pharmacy_Management_System_-_3_January_2026_reqawv&profile=cld-default"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-all shadow-sm group"
                >
                    <span>Watch Workflow</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
            </motion.div>


            <h1 className="text-6xl md:text-9xl font-bold text-slate-900 leading-tight tracking-tight">
                Smart Pharmacy <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                    Inventory Intelligence
                </span>
            </h1>
            <p className="max-w-2xl text-base md:text-xl mt-8 text-slate-600 leading-relaxed font-medium">
                Turn daily inventory into predictive insights. Reduce expiries, avoid stockouts, and run your pharmacy with surgical precision.
            </p>
        </div>
    );
};

export const ProductCard = ({
    product,
    translate,
}: {
    product: {
        title: string;
        link: string;
        thumbnail: string;
    };
    translate: MotionValue<number>;
}) => {
    return (
        <motion.div
            style={{
                x: translate,
            }}
            key={product.title}
            className="group/product h-96 w-[30rem] relative shrink-0"
        >
            <div className="relative block h-full w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <img
                    src={product.thumbnail}
                    height="600"
                    width="600"
                    className="object-cover object-left-top absolute h-full w-full inset-0"
                    alt={product.title}
                />
            </div>
        </motion.div>
    );
};
