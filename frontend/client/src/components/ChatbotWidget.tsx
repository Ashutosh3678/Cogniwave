import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { X, Send, Loader2, Mic, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRecoilValue } from "recoil";
import { authState } from "../state/auth";
import { sendChatMessage } from "../lib/api/chat";

interface Message {
    id: string;
    role: "user" | "bot";
    text: string;
}

import Login3DCharacter from "./Login3DCharacter";
import { AIVoiceInput } from "./ui/ai-voice-input";
import { TextShimmer } from "./ui/text-shimmer";

export const ChatbotWidget = () => {
    const { isAuthenticated, user } = useAuthContext();
    const { token } = useRecoilValue(authState);
    const location = useLocation();

    // Hide on Store Create page
    if (location.pathname === "/store/create") return null;

    // Filter for permitted roles
    const userRole = user?.globalRole || "";
    const isVoiceAllowed = ["SUPERADMIN", "SUPPLIER", "STORE_OWNER"].includes(userRole);

    // Reset chat when user/role changes
    useEffect(() => {
        setMessages([
            { id: "welcome-reset", role: "bot", text: `Hello! I'm ${import.meta.env.VITE_BOT_NAME || "Dose"}. How can I help you manage your store today?` }
        ]);
    }, [user?.globalRole, user?.id]);

    const [isOpen, setIsOpen] = useState(false);

    // Reset focused field when closed to resume dancing
    useEffect(() => {
        if (!isOpen) setFocusedField(null);
    }, [isOpen]);

    const BOT_NAME = import.meta.env.VITE_BOT_NAME || "Dose";
    const [messages, setMessages] = useState<Message[]>([
        { id: "welcome", role: "bot", text: `Hello! I'm ${BOT_NAME}. How can I help you manage your store today?` }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    // 3D Character integration
    const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
    const [keyTrigger, setKeyTrigger] = useState(0);

    // TTS & STT State
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false); // Used for manual dictation mode
    const voiceEnabled = true;
    const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

    // Voice permission and Wake Word
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef(isListening); // Ref to track dictation mode inside callbacks
    const isOpenRef = useRef(isOpen);
    const isSpeakingRef = useRef(false);

    // Live Conversation State
    const [isConversationMode, setIsConversationMode] = useState(false);
    const isConversationModeRef = useRef(false);

    // Sync refs
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    useEffect(() => {
        isConversationModeRef.current = isConversationMode;
    }, [isConversationMode]);

    useEffect(() => {
        isSpeakingRef.current = isSpeaking;
    }, [isSpeaking]);

    useEffect(() => {
        isOpenRef.current = isOpen;
        if (!isOpen) {
            setIsConversationMode(false);
            setIsListening(false);
            if (isSpeaking) {
                synthRef.current?.cancel();
                setIsSpeaking(false);
            }
        }
    }, [isOpen]);

    // Check for existing permission on mount or ask
    useEffect(() => {
        if (isAuthenticated && isVoiceAllowed) {
            const timeout = setTimeout(() => {
                if (!permissionGranted) {
                    setShowPermissionModal(true);
                }
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [isAuthenticated, isVoiceAllowed]);

    const initSpeechRecognition = () => {
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        // Clean up previous instance
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            console.log("Mic Active");
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed') {
                setPermissionGranted(false);
            }
        };

        recognition.onend = () => {
            // Only restart if this is the active instance
            if (recognition !== recognitionRef.current) return;

            // Restart if permission granted AND we are NOT currently speaking
            if (permissionGranted && !isSpeakingRef.current) {
                console.log("Restarting Mic...");
                setTimeout(() => {
                    try {
                        if (!isSpeakingRef.current && recognition === recognitionRef.current) {
                            recognition.start();
                        }
                    } catch (e) { }
                }, 200);
            } else {
                if (!permissionGranted) setIsListening(false);
            }
        };

        recognition.onresult = (event: any) => {
            // Explicitly ignore results if speaking (double check)
            if (isSpeakingRef.current) return;

            const results = Array.from(event.results);
            const lastResult: any = results[results.length - 1];
            const transcript = lastResult[0].transcript.trim().toLowerCase();
            const isFinal = lastResult.isFinal;

            // Debug logger for user
            console.log("🎤 Heard:", transcript, "| Final:", isFinal);

            // 1. Wake Word Detection (Always Active if permission granted)
            const wakeWordTriggers = [
                // Precise
                "hey dose", "hi dose", "hello dose",
                "hey does", "hi does", "hello does",
                "hey doze", "hi doze", "headers",
                "heroes", "shadow", "hay dost",
                // Phonetic / Accent Variations (Based on logs)
                "hey doors", "hey door",
                "head doors", "head door",
                "hate those", "hate dose",
                "hey ghost", "hey those",
                "hey dows", "hey dos",
                "he dose", "he does", "doors", "Hey dost", "hi dost", "hello dost", "hey dost", "hi dost", "hello dost", "hey dost", "hi dost", "hello dost"
            ];

            const detectedWakeWord = wakeWordTriggers.some(trigger => transcript.includes(trigger));

            if (detectedWakeWord) {
                // Trigger if closed OR if open but not yet in conversation mode
                if (!isOpenRef.current || !isConversationModeRef.current) {
                    // setIsOpen(false); // Keep chat window state independent or force closed if desired
                    setIsConversationMode(true);

                    // Respond with the preloaded welcome message
                    const welcomeText = messages.find(m => m.id === "welcome")?.text || `Hello! I'm ${BOT_NAME}.`;

                    // Stop mic to prevent echo during speak, then restart
                    isSpeakingRef.current = true; // Force immediate ref update
                    try { recognition.abort(); } catch (e) { }

                    speak(welcomeText, () => {
                        setIsListening(true);
                        // Force restart recognition logic in case onend didn't catch it
                        if (recognitionRef.current && !recognitionRef.current.started) {
                            try { recognitionRef.current.start(); } catch (e) { initSpeechRecognition(); }
                        }
                    });

                    return;
                }
            }

            // 2. Dictation Mode
            if (isListeningRef.current) {
                setInputValue(transcript);

                if (isFinal) {
                    // Check for exit commands
                    const exitTriggers = [
                        "stop", "goodbye", "bye",
                        "will meet later", "meet later",
                        "see you later", "see you",
                        "talk later", "later",
                        "close", "exit", "quit", "shut down", "leave"
                    ];

                    if (exitTriggers.some(trigger => transcript.includes(trigger))) {
                        console.log("🛑 Exit trigger detected:", transcript);
                        speak("Goodbye! Have a great day.", () => {
                            setIsConversationMode(false);
                            setIsOpen(false);
                        });
                        setIsListening(false);
                        return;
                    }

                    handleVoiceCommand(transcript);
                    // Pause listening logic while processing (don't stop mic completely, just state)
                    setIsListening(false);
                }
            }

        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (e) {
            console.error("Error starting recognition:", e);
        }
    };

    // Initialize ONLY when permission is explicitly granted via our modal
    // Initialize ONLY when permission is explicitly granted via our modal AND role is allowed
    useEffect(() => {
        if (permissionGranted && isVoiceAllowed) {
            // Small delay to ensure audio context is ready
            setTimeout(initSpeechRecognition, 500);
        }
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onend = null; // Prevent restart loops on cleanup
                recognitionRef.current.stop();
            }
        };
    }, [permissionGranted, isVoiceAllowed]);

    const speak = (text: string, onComplete?: () => void) => {
        if (!voiceEnabled || !synthRef.current) {
            onComplete?.();
            return;
        }

        // Stop speech and potential echo
        synthRef.current.cancel();
        setIsSpeaking(true);
        isSpeakingRef.current = true; // IMMEDIATE sync for race conditions

        // Abort recognition to be safe (prevent self-hearing)
        try { recognitionRef.current?.abort(); } catch (e) { }

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsListening(false);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            onComplete?.();
            // Restart mic if permission still granted
            if (permissionGranted) {
                try { recognitionRef.current?.start(); } catch (e) { initSpeechRecognition(); }
            }
        };
        synthRef.current.speak(utterance);
    };

    const toggleListening = () => {
        if (!permissionGranted) {
            setShowPermissionModal(true);
            return;
        }

        if (isListening) {
            setIsListening(false);
            setIsConversationMode(false);
        } else {
            setIsListening(true);
            setIsConversationMode(true);
        }
    };

    const handleVoiceCommand = (text: string) => {
        // No delay for conversation mode
        handleSendMessage(text);
    };

    // Strictly use the user ID as the thread ID
    const threadId = user?.id;

    // Theme logic integration
    const [themeName, setThemeName] = useState("green");

    useEffect(() => {
        if (user?.globalRole === "SUPERADMIN") {
            setThemeName("violet");
        } else if (user?.globalRole === "SUPPLIER") {
            setThemeName("teal");
        } else {
            const t = localStorage.getItem("selectedTheme");
            if (t) setThemeName(t);
        }
    }, [user, isOpen]);

    // Extended Theme Palette
    const themeColors: Record<string, { bg: string, text: string, border: string, gradient: string, shadow: string, sentMsgBg: string }> = {
        green: { bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-200", gradient: "from-emerald-600 to-teal-500", shadow: "shadow-emerald-500/30", sentMsgBg: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
        teal: { bg: "bg-teal-600", text: "text-teal-600", border: "border-teal-200", gradient: "from-teal-500 to-emerald-500", shadow: "shadow-teal-500/30", sentMsgBg: "bg-gradient-to-br from-teal-500 to-teal-600" },
        violet: { bg: "bg-violet-600", text: "text-violet-600", border: "border-violet-200", gradient: "from-violet-600 to-indigo-600", shadow: "shadow-violet-500/30", sentMsgBg: "bg-gradient-to-br from-violet-600 to-indigo-600" },
        red: { bg: "bg-red-600", text: "text-red-600", border: "border-red-200", gradient: "from-red-600 to-rose-600", shadow: "shadow-red-500/30", sentMsgBg: "bg-gradient-to-br from-red-500 to-red-600" },
        orange: { bg: "bg-orange-600", text: "text-orange-600", border: "border-orange-200", gradient: "from-orange-500 to-amber-500", shadow: "shadow-orange-500/30", sentMsgBg: "bg-gradient-to-br from-orange-500 to-orange-600" },
        blue: { bg: "bg-blue-600", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-600 to-indigo-600", shadow: "shadow-blue-500/30", sentMsgBg: "bg-gradient-to-br from-blue-500 to-blue-600" },
        black: { bg: "bg-slate-900", text: "text-slate-900", border: "border-slate-200", gradient: "from-slate-900 to-slate-800", shadow: "shadow-slate-500/30", sentMsgBg: "bg-gradient-to-br from-slate-900 to-slate-800" },
    };

    const theme = themeColors[themeName] || themeColors.green;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSendMessage = async (manualText?: string) => {
        const textToSend = manualText || inputValue;
        if (!textToSend.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const data = await sendChatMessage({
                message: userMsg.text,
                thread_id: threadId
            }, token || "");

            console.log("Bot Response:", data);

            const botText = data.reply_markdown || data.response || data.message || (typeof data === 'string' ? data : JSON.stringify(data));

            const botMsg: Message = { id: (Date.now() + 1).toString(), role: "bot", text: botText };
            setMessages(prev => [...prev, botMsg]);

            // Only speak if in Voice/Conversation Mode
            if (isConversationModeRef.current) {
                speak(botText, () => {
                    if (isConversationModeRef.current) {
                        setIsListening(true);
                    }
                });
            }

        } catch (error) {
            console.error("Request failed:", error);
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "bot", text: "Sorry, I'm having trouble connecting to the server. Please check your internet connection and try again." };
            setMessages(prev => [...prev, errorMsg]);

            // Speak error only if in conversation mode
            if (isConversationModeRef.current) {
                speak(errorMsg.text, () => {
                    setIsConversationMode(false);
                    setIsListening(false);
                });
            } else {
                // Not in voice mode, just ensure listening is off
                setIsListening(false);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // ... (keep existing helper functions)

    // Voice Mode UI Component


    if (!isAuthenticated) return null;

    return (
        <>
            {/* Permission Modal */}
            <AnimatePresence>
                {/* Permission Modal ... (Existing) */}
                {showPermissionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        {/* ... existing permission modal content ... */}
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-white/20 relative"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                    <Mic className="w-8 h-8 text-black" />
                                </div>

                                <h3 className="text-xl font-bold text-slate-800">Enable Voice Assistant?</h3>

                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Allow ${BOT_NAME} to listen for the wake word <strong>"Hey Dose"</strong> and respond to voice commands automatically.
                                </p>

                                <div className="flex gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setShowPermissionModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-black !bg-black text-white !text-white font-medium hover:bg-neutral-800 transition-colors shadow-md"
                                    >
                                        Not Now
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPermissionGranted(true);
                                            setShowPermissionModal(false);
                                        }}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-black !bg-black text-white !text-white font-medium hover:bg-neutral-800 transition-colors shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" />
                                        Enable
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                ref={containerRef}
                className="fixed bottom-6 -mb-12 -mr-12 right-10 z-[100] flex flex-col items-end gap-2 font-sans touch-none"
                initial={false}
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 50, filter: "blur(10px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 25 } }}
                            exit={{
                                opacity: 0,
                                scale: 0.9,
                                y: 50,
                                filter: "blur(10px)",
                                transition: { duration: 0.2 }
                            }}
                            style={{ transformOrigin: "bottom right" }}
                            className="w-[380px] md:w-[420px] h-[580px] mr-6 flex flex-col rounded-[24px] shadow-2xl overflow-hidden bg-white ring-1 ring-slate-900/5"
                        >
                            {/* Modern Header */}
                            <div className={`relative px-6 py-5 shrink-0 bg-gradient-to-r ${theme.gradient}`}>
                                <div className="flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-3">
                                        {/* Avatar Halo */}
                                        <div className="relative">
                                            <div className="w-16 h-16 flex items-center justify-center -ml-2">
                                                <Login3DCharacter focusedField={null} keyTrigger={0} disableTracking={true} className="w-[120%] h-[120%] translate-y-1" />
                                            </div>
                                        </div>

                                        <div className="flex flex-col text-white">
                                            <h3 className="font-bold text-lg leading-none tracking-tight">{BOT_NAME}</h3>
                                            <span className="text-[11px] font-medium text-white/80 mt-1 flex items-center gap-1.5">
                                                {isSpeaking ? (
                                                    <>
                                                        <span className="flex gap-0.5 h-2 items-center">
                                                            <span className="w-0.5 h-2 bg-white rounded-full animate-[music_1s_ease-in-out_infinite]" />
                                                            <span className="w-0.5 h-3 bg-white rounded-full animate-[music_1.2s_ease-in-out_infinite]" />
                                                            <span className="w-0.5 h-1 bg-white rounded-full animate-[music_0.8s_ease-in-out_infinite]" />
                                                        </span>
                                                        Speaking...
                                                    </>
                                                ) : (
                                                    "Always online"
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <i
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10 hover:rotate-90 duration-300"
                                        aria-label="Close chat"
                                    >
                                        <X className="w-5 h-5" />
                                    </i>
                                </div>

                                {/* Decorative Background Elements */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none mix-blend-overlay" />
                            </div>

                            {/* Messages Area */}
                            <div
                                onPointerDown={(e) => e.stopPropagation()}
                                className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 relative custom-scrollbar scroll-smooth"
                            >
                                <div className="flex justify-center py-2">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-widest border border-slate-200/50">
                                        Today
                                    </span>
                                </div>

                                {messages.map((msg) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        key={msg.id}
                                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2.5`}
                                    >
                                        {msg.role === "bot" && (
                                            <div className="w-10 h-10 flex items-center justify-center shrink-0 -ml-2 -mb-2">
                                                <Login3DCharacter focusedField={null} keyTrigger={0} disableTracking={true} className="w-[140%] h-[140%] translate-y-1" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[85%] px-4 py-3 text-[14px] leading-relaxed shadow-sm ${msg.role === "user"
                                                ? `${theme.sentMsgBg} text-white rounded-[20px] rounded-br-sm shadow-md`
                                                : "bg-white text-slate-700 border border-slate-100 rounded-[20px] rounded-bl-sm shadow-sm"
                                                }`}
                                        >
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-0 leading-relaxed" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 my-1 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 my-1 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="" {...props} />,
                                                    code: ({ node, className, children, ...props }: any) => {
                                                        const match = /language-(\w+)/.exec(className || '')
                                                        return !match ? (
                                                            <code className={`px-1 rounded bg-black/10 font-mono text-[11px]`} {...props}>{children}</code>
                                                        ) : (
                                                            <div className="rounded-md overflow-hidden my-2 border border-white/20">
                                                                <pre className="p-2 overflow-x-auto text-[11px] bg-black/20 text-white font-mono">
                                                                    <code className={className} {...props}>{children}</code>
                                                                </pre>
                                                            </div>
                                                        )
                                                    },
                                                    a: ({ node, ...props }) => <a className="underline underline-offset-2 opacity-90 hover:opacity-100 font-medium cursor-pointer" target="_blank" rel="noopener noreferrer" {...props} />,
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex justify-start items-center gap-2.5"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center shrink-0 -ml-2 -mb-2">
                                            <Login3DCharacter focusedField={null} keyTrigger={0} disableTracking={true} className="w-[140%] h-[140%] translate-y-1" />
                                        </div>
                                        <div className="bg-white border border-slate-100 px-4 py-3 rounded-[20px] rounded-bl-sm shadow-sm flex items-center gap-1.5">
                                            <TextShimmer className="text-sm font-medium" duration={1.2}>Thinking.....</TextShimmer>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Floating Input Area */}
                            <div
                                onPointerDown={(e) => e.stopPropagation()}
                                className="p-5 bg-white border-t border-slate-50 z-20 shrink-0"
                            >
                                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-full shadow-sm ring-offset-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all overflow-hidden group">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onFocus={() => setFocusedField("email")}
                                        onBlur={() => setFocusedField(null)}
                                        onKeyDown={(e) => {
                                            setKeyTrigger(prev => prev + 1);
                                            handleKeyDown(e);
                                        }}
                                        placeholder="Ask anything..."
                                        className="flex-1 bg-transparent pl-5 pr-12 py-3.5 text-[14px] outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                                        disabled={isLoading || isListening}
                                    />

                                    {/* Right-aligned Actions */}
                                    <div className="absolute right-1.5 flex items-center gap-1">
                                        <AIVoiceInput
                                            isListening={isListening}
                                            onStart={toggleListening}
                                            onStop={() => toggleListening()}
                                            className="w-auto py-0 flex-none"
                                            buttonClassName={`!p-2 !rounded-full transition-all !w-9 !h-9 flex items-center justify-center [&>svg]:!w-5 [&>svg]:!h-5 ${isListening ? '!bg-red-500 !text-white shadow-md' : '!bg-slate-200 !text-black/50 [&>svg]:!text-black/50 hover:scale-105 active:scale-95 hover:!bg-slate-300'}`}
                                            visualizerClassName="absolute bottom-full right-0 mb-6 bg-white border border-slate-100 p-3 rounded-2xl shadow-xl w-48 z-50 pointer-events-none"
                                            visualizerBars={16}
                                        />

                                        <i
                                            onClick={() => handleSendMessage()}
                                            className={`p-2 cursor-pointer rounded-full w-9 h-9 flex items-center justify-center transition-all duration-300 ${inputValue.trim()
                                                ? `${theme.bg} text-white shadow-md hover:scale-105 active:scale-95`
                                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                }`}
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        </i>
                                    </div>
                                </div>


                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3D Character Toggle Button */}
                <div
                    onClick={(e) => {
                        if (isDraggingRef.current) { e.preventDefault(); e.stopPropagation(); return; }
                        setIsOpen(!isOpen);
                    }}
                    className="relative w-48 h-48 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 z-50 group cursor-grab active:cursor-grabbing !bg-transparent"
                    role="button"
                    aria-label="Toggle Chatbot"
                >
                    <div className="w-full h-full pointer-events-none">
                        <Login3DCharacter focusedField={focusedField} keyTrigger={keyTrigger} disableTracking={true} className="min-h-0" />
                    </div>

                </div>
            </motion.div >

            <AnimatePresence>
                {isConversationMode && isVoiceAllowed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl perspective-1000"
                        onClick={() => {
                            setIsConversationMode(false);
                            setIsListening(false);
                            if (synthRef.current) synthRef.current.cancel();
                        }}
                    >
                        {/* Tablet Container Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-6 gap-10"
                        >


                            {/* 3D Character - Large & Centered */}
                            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                                {/* Ambient Glow */}
                                <div className={`absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full transition-all duration-700 ${isListening ? 'opacity-100 scale-125' : 'opacity-30 scale-90'}`} />

                                {/* Active State Rings */}
                                {isListening && (
                                    <>
                                        <div className="absolute inset-0 border border-emerald-500/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                        <div className="absolute inset-4 border border-emerald-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]" />
                                    </>
                                )}

                                <div className="relative w-full h-full z-10">
                                    <Login3DCharacter focusedField={null} keyTrigger={0} disableTracking={true} className="w-full h-full" />
                                </div>
                            </div>

                            {/* Status & Interaction Area */}
                            <div className="flex flex-col items-center text-center gap-6 w-full max-w-lg z-20">
                                {/* Status Pill */}
                                <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
                                    <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-300 ${isListening ? 'bg-emerald-400 text-emerald-400 animate-pulse' : isLoading ? 'bg-amber-400 text-amber-400 animate-pulse' : isSpeaking ? 'bg-blue-400 text-blue-400' : 'bg-slate-400 text-slate-400'}`} />
                                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/50">
                                        {isListening ? "Listening" : isLoading ? "Thinking" : isSpeaking ? "Speaking" : "Ready"}
                                    </span>
                                </div>

                                {/* Main Transcript Input/Display */}
                                <div className="min-h-[100px] flex items-center justify-center w-full relative group">
                                    {isLoading ? (
                                        <TextShimmer className="text-2xl md:text-3xl font-light text-white/90" duration={1.2}>
                                            Thinking...
                                        </TextShimmer>
                                    ) : isSpeaking ? (
                                        <motion.p
                                            key={messages[messages.length - 1]?.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-2xl md:text-3xl font-light text-white leading-relaxed tracking-tight"
                                        >
                                            {messages[messages.length - 1]?.text}
                                        </motion.p>
                                    ) : (
                                        <div className="relative w-full flex justify-center">
                                            <input
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder={isListening ? "" : "How can I help?"}
                                                className="w-full bg-transparent !bg-transparent border-none !border-none !outline-none !ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none shadow-none !shadow-none appearance-none text-center text-2xl md:text-3xl font-light !text-white caret-white leading-relaxed tracking-tight placeholder:text-white/20 p-0"
                                                autoFocus
                                                style={{ backgroundColor: 'transparent', boxShadow: 'none', border: 'none', outline: 'none' }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Controls & Visualizer */}
                                <div className="h-16 flex items-center justify-center">
                                    {isListening || isSpeaking ? (
                                        <div className="flex gap-1.5 items-center justify-center cursor-pointer" onClick={() => isListening && setIsListening(false)}>
                                            {[...Array(5)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 10 }}
                                                    animate={isListening ? {
                                                        height: [16, 40, 16],
                                                        transition: {
                                                            duration: 1.2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: i * 0.15, // Smooth orderly wave
                                                        }
                                                    } : {
                                                        height: [12, 48, 24, 60, 12],
                                                        transition: {
                                                            duration: 0.6,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: i * 0.08, // Faster, energetic wave
                                                            repeatType: "mirror"
                                                        }
                                                    }}
                                                    className={`w-2 mx-0.5 rounded-full transition-colors duration-300 ${isListening ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : 'bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]'}`}
                                                />
                                            ))}
                                        </div>
                                    ) : isLoading ? null : (
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => setIsListening(true)}
                                                className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95 group"
                                            >
                                                <Mic className="w-6 h-6 opacity-70 group-hover:opacity-100" />
                                            </button>

                                            {inputValue && (
                                                <button
                                                    onClick={() => handleSendMessage()}
                                                    className="p-4 rounded-full bg-black border border-white/10 text-white hover:bg-white/10 shadow-lg transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <Send className="w-6 h-6" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    );
};
