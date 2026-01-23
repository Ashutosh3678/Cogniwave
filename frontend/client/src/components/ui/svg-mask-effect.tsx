"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
    children,
    revealText,
    size = 10,
    revealSize = 600,
    className,
}: {
    children?: string | React.ReactNode;
    revealText?: string | React.ReactNode;
    size?: number;
    revealSize?: number;
    className?: string;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState<any>({ x: null, y: null });
    const containerRef = useRef<any>(null);
    const updateMousePosition = (e: any) => {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    useEffect(() => {
        containerRef.current.addEventListener("mousemove", updateMousePosition);
        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener(
                    "mousemove",
                    updateMousePosition,
                );
            }
        };
    }, []);
    let maskSize = isHovered ? revealSize : size;

    return (
        <motion.div
            ref={containerRef}
            className={cn("relative h-screen", className)}
            animate={{
                backgroundColor: isHovered ? "#0f172a" : "#ffffff", // slate-900 : white
            }}
            transition={{
                backgroundColor: { duration: 0.3 },
            }}
        >
            <motion.div
                className="absolute flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-800 text-6xl [mask-image:url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iYmxhY2siLz48L3N2Zz4=')] [mask-repeat:no-repeat] [mask-size:40px]"
                animate={{
                    maskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2
                        }px`,
                    maskSize: `${maskSize}px`,
                }}
                transition={{
                    maskSize: { duration: 0.3, ease: "easeInOut" },
                    maskPosition: { duration: 0.15, ease: "linear" },
                }}
            >
                {/* Inner content (The Revealed Part) */}
                {/* User wanted light theme. The revealed part usually contrasts.
            Snippet had bg-black text-6xl ... dark:bg-white.
            I will make the revealed background vivid (Brand Primary) or dark to contrast with the white initial state.
            I'll use bg-brand-primary for the mask layer.
        */}
                <div className="absolute inset-0 z-0 h-full w-full bg-brand-primary opacity-90" />
                <div
                    onMouseEnter={() => {
                        setIsHovered(true);
                    }}
                    onMouseLeave={() => {
                        setIsHovered(false);
                    }}
                    className="relative z-20 mx-auto max-w-4xl text-center text-4xl font-bold text-white"
                >
                    {children}
                </div>
            </motion.div>

            <div className="flex h-full w-full items-center justify-center bg-white">
                {revealText}
            </div>
        </motion.div>
    );
};
