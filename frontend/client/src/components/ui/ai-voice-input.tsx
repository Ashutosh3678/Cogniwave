"use client";

import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

interface AIVoiceInputProps {
    onStart?: () => void;
    onStop?: (duration: number) => void;
    isListening?: boolean;
    visualizerBars?: number;
    demoMode?: boolean;
    demoInterval?: number;
    className?: string;
    visualizerClassName?: string;
    buttonClassName?: string;
}

export function AIVoiceInput({
    onStart,
    onStop,
    isListening = false,
    visualizerBars = 48,
    demoMode = false,
    demoInterval = 3000,
    className,
    visualizerClassName,
    buttonClassName,
}: AIVoiceInputProps) {
    const [submitted, setSubmitted] = useState(isListening);
    const [time, setTime] = useState(0);
    const [isClient, setIsClient] = useState(false);
    const [isDemo, setIsDemo] = useState(demoMode);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Sync internal state with external prop
    useEffect(() => {
        setSubmitted(isListening);
        if (!isListening) {
            setTime(0);
        }
    }, [isListening]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (submitted) {
            intervalId = setInterval(() => {
                setTime((t) => t + 1);
            }, 1000);
        } else {
            if (!isListening) setTime(0); // Reset time when stopped
        }

        return () => clearInterval(intervalId);
    }, [submitted, time, isListening]);

    useEffect(() => {
        if (!isDemo) return;

        let timeoutId: NodeJS.Timeout;
        const runAnimation = () => {
            setSubmitted(true);
            timeoutId = setTimeout(() => {
                setSubmitted(false);
                timeoutId = setTimeout(runAnimation, 1000);
            }, demoInterval);
        };

        const initialTimeout = setTimeout(runAnimation, 100);
        return () => {
            clearTimeout(timeoutId);
            clearTimeout(initialTimeout);
        };
    }, [isDemo, demoInterval]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleClick = () => {
        if (isDemo) {
            setIsDemo(false);
            setSubmitted(false);
        } else {
            if (submitted) {
                onStop?.(time);
            } else {
                onStart?.();
            }
        }
    };

    return (
        <div className={cn("w-full py-4", className)}>
            <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
                <button
                    className={cn(
                        "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
                        submitted
                            ? "bg-none"
                            : "bg-none hover:bg-black/10 dark:hover:bg-white/10",
                        buttonClassName
                    )}
                    type="button"
                    onClick={handleClick}
                >
                    {submitted ? (
                        <div
                            className="w-6 h-6 rounded-sm flex items-center justify-center bg-black dark:bg-white cursor-pointer pointer-events-auto animate-spin"
                            style={{ animationDuration: "3s" }}
                        >
                        </div>
                    ) : (
                        <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
                    )}
                </button>

                <div className={cn("h-4 w-64 flex items-center justify-center gap-0.5", visualizerClassName)}>
                    {[...Array(visualizerBars)].map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-0.5 rounded-full transition-all duration-300",
                                submitted
                                    ? "bg-black/50 dark:bg-white/50 animate-pulse"
                                    : "bg-black/10 dark:bg-white/10 h-1"
                            )}
                            style={
                                submitted && isClient
                                    ? {
                                        height: `${20 + Math.random() * 80}%`,
                                        animationDelay: `${i * 0.05}s`,
                                    }
                                    : undefined
                            }
                        />
                    ))}
                </div>

                <span
                    className={cn(
                        "font-mono text-xs transition-opacity duration-300 absolute bottom-0",
                        submitted
                            ? "text-black/70 dark:text-white/70 opacity-100"
                            : "text-black/30 dark:text-white/30 opacity-0"
                    )}
                >
                    {formatTime(time)}
                </span>
            </div>
        </div>
    );
}
