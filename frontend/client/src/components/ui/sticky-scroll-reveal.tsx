"use client";
import React, { useRef } from "react";
import { useMotionValueEvent, useScroll, motion } from "motion/react";
import { cn } from "@/lib/utils";

export const StickyScroll = ({
    content,
    contentClassName,
}: {
    content: {
        title: string;
        description: string;
        content?: React.ReactNode | any;
    }[];
    contentClassName?: string;
}) => {
    const [activeCard, setActiveCard] = React.useState(0);
    const ref = useRef<any>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });
    const cardLength = content.length;

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const cardsBreakpoints = content.map((_, index) => index / cardLength);
        const closestBreakpointIndex = cardsBreakpoints.reduce(
            (acc, breakpoint, index) => {
                const distance = Math.abs(latest - breakpoint);
                if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
                    return index;
                }
                return acc;
            },
            0,
        );
        setActiveCard(closestBreakpointIndex);
    });

    return (
        <motion.div
            className="flex justify-center space-x-10 w-full p-10 relative"
            ref={ref}
        >
            <div className="div relative flex items-start px-4 w-1/2">
                <div className="max-w-4xl">
                    {content.map((item, index) => (
                        <div key={item.title + index} className="my-20 min-h-[50vh] flex flex-col justify-center">
                            <motion.h2
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: activeCard === index ? 1 : 0.3,
                                }}
                                className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight"
                            >
                                {item.title}
                            </motion.h2>
                        </div>
                    ))}
                    <div className="h-40" />
                </div>
            </div>
            <motion.div
                className={cn(
                    "hidden lg:block h-[80vh] w-1/2 sticky top-20 overflow-hidden rounded-[2rem] bg-transparent shadow-none",
                    contentClassName,
                )}
            >
                {content[activeCard].content ?? null}
            </motion.div>
        </motion.div>
    );
};
