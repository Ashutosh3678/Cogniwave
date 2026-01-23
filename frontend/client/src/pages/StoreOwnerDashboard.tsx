

import React from "react";
import { useRecoilState } from "recoil";
import { authState } from "../state/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, LogOut, Users, Package, Search, X, Sparkles, Lock, Truck, Check, FileText, ChevronDown, ChevronUp, Activity, ShoppingCart, Link, Store, XCircle, Send, History as HistoryIcon, ClipboardList, Mail, Phone, Trash2, ArrowRight, CreditCard, Banknote, Smartphone, Loader2, Clock, AlertTriangle, BarChart2 } from "lucide-react";
import { Dock, DockIcon, DockItem, DockLabel } from "../components/ui/dock";
import { formatDistanceToNow } from "date-fns";
import { useLogout } from "../hooks/useLogout";
import { dashboardApi } from "../lib/api/endpoints";
import { Button } from "../components/ui/button-1";
import PharmacyPayment from "../components/payments/PharmacyPayment";



import {
    Card as MetricCard,
    CardHeader as MetricCardHeader,
    CardContent as MetricCardContent,
    CardTitle as MetricCardTitle,
    CardDescription as MetricCardDescription,
    CardToolbar
} from "@/components/ui/card";
import {
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Area,
    ComposedChart,
    ReferenceLine
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/line-charts-1";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaRupeeSign } from "react-icons/fa";
import { TrendingUp, TrendingDown, Zap, CheckCircle, Share2, Filter, RefreshCw, Calendar, Download, MoreHorizontal } from "lucide-react";
import type { Supplier, SupplierRequest } from "@/lib/types";
import { capitalize } from "lodash";

const Skeleton = ({ className }: { className?: string }) => (
    // @ts-ignore
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
);



const forecastChartConfig = {
    history: {
        label: "Historical Sales",
        color: "#475569", // slate-600
    },
    forecast: {
        label: "AI Forecast",
        color: "#6366f1", // indigo-500
    },
    confRange: {
        label: "Confidence Interval",
        color: "#818cf8", // indigo-400
    },
    priceHistory: {
        label: "Historical Price",
        color: "#10b981", // emerald-500
    },
    priceForecast: {
        label: "Price Prediction",
        color: "#059669", // emerald-600
    }
} satisfies ChartConfig;

const themeConfig: Record<string, {
    primary: string;
    light: string;
    text: string;
    border: string;
    ring: string;
    gradient: string;
    shadow: string;
    icon: string;
    hex: string;
}> = {
    green: {
        primary: "bg-emerald-500",
        light: "bg-emerald-50",
        text: "text-emerald-600",
        border: "border-emerald-500",
        ring: "ring-emerald-500",
        gradient: "from-emerald-500 to-emerald-700",
        shadow: "shadow-emerald-500/20",
        icon: "text-emerald-50",
        hex: "#10b981",
    },
    red: {
        primary: "bg-red-600",
        light: "bg-red-50",
        text: "text-red-700",
        border: "border-red-600",
        ring: "ring-red-600",
        gradient: "from-red-600 to-red-800",
        shadow: "shadow-red-600/20",
        icon: "text-red-50",
        hex: "#dc2626",
    },
    orange: {
        primary: "bg-orange-500",
        light: "bg-orange-50",
        text: "text-orange-600",
        border: "border-orange-500",
        ring: "ring-orange-500",
        gradient: "from-orange-500 to-orange-700",
        shadow: "shadow-orange-500/20",
        icon: "text-orange-50",
        hex: "#f97316",
    },
    blue: {
        primary: "bg-blue-600",
        light: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-600",
        ring: "ring-blue-600",
        gradient: "from-blue-600 to-blue-800",
        shadow: "shadow-blue-600/20",
        icon: "text-blue-50",
        hex: "#2563eb",
    },
    black: {
        primary: "bg-slate-900",
        light: "bg-slate-100",
        text: "text-slate-900",
        border: "border-slate-900",
        ring: "ring-slate-900",
        gradient: "from-slate-900 to-slate-800",
        shadow: "shadow-slate-900/20",
        icon: "text-slate-50",
        hex: "#0f172a",
    },
};



interface DashboardData {
    user: any;
    store: any;
    overview: {
        totalMedicines: number;
        totalBatches: number;
        recentSalesCount: number;
        recentRevenue: number;
        unreadNotifications: number;
        inventoryTotals: {
            qtyAvailable: number;
        };
    };
    charts: {
        salesByDay: Array<{ date: string; revenue: number; count: number }>;
        topMovers: Array<{
            medicineId: string;
            medicine: { brandName: string };
            qtySold: number;
        }>;
    };
    lists: {
        lowStock: Array<any>;
        recentSales: Array<any>;
        activity: Array<{ id: string; action: string; createdAt: string }>;
        suppliers: Array<Supplier>;
    };
}

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const getActivityConfig = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes('sale') || lower.includes('order')) return { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
    if (lower.includes('login') || lower.includes('auth')) return { icon: Lock, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' };
    if (lower.includes('stock') || lower.includes('inventory') || lower.includes('product')) return { icon: Package, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
    if (lower.includes('setting') || lower.includes('update')) return { icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
    if (lower.includes('supplier') || lower.includes('request') || lower.includes('connect')) return { icon: Link, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' };
    return { icon: Zap, color: 'text-violet-600', bg: 'bg-violet-100', border: 'border-violet-200' };
};

const EmptyState = ({ 
    icon: Icon, 
    title, 
    description, 
    action, 
    type = "neutral" 
}: { 
    icon: any, 
    title: string, 
    description?: string, 
    action?: React.ReactNode,
    type?: "neutral" | "success" | "warning" | "error"
}) => {
    const colors = {
        neutral: "bg-slate-50 text-slate-300 border-slate-100",
        success: "bg-emerald-50 text-emerald-300 border-emerald-100",
        warning: "bg-amber-50 text-amber-300 border-amber-100",
        error: "bg-red-50 text-red-300 border-red-100"
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            <div className={`w-20 h-20 ${colors[type]} rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border`}>
                <Icon className="w-10 h-10 opacity-60" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            {description && <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed mb-8">{description}</p>}
            {action}
        </motion.div>
    );
};

const StoreOwnerDashboard: React.FC = () => {
    const [auth, setAuth] = useRecoilState(authState);
    const logout = useLogout();

    const [activeTab, setActiveTab] = React.useState<"overview" | "reorder" | "sale" | "history" | "suppliers" | "sent_reorders" | "return">("overview");
    const [data, setData] = React.useState<DashboardData | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [supplierRequests, setSupplierRequests] = React.useState<SupplierRequest[]>([]);
    const [myRequests, setMyRequests] = React.useState<SupplierRequest[]>([]);
    const [receipts, setReceipts] = React.useState<any[]>([]);

    const [showNotifications, setShowNotifications] = React.useState(false);
    const [showFeedback, setShowFeedback] = React.useState(false);
    const [feedbackMessage, setFeedbackMessage] = React.useState("Request processed successfully");
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
    const [isActivityExpanded, setIsActivityExpanded] = React.useState(false);
    const [selectedPeriod, setSelectedPeriod] = React.useState('7d');
    const notificationRef = React.useRef<HTMLDivElement>(null);


    // Reorder State

    const [inventoryList, setInventoryList] = React.useState<any[]>([]);
    const [suggestedItems, setSuggestedItems] = React.useState<any[]>([]);
    const [cart, setCart] = React.useState<Map<string, number>>(new Map()); // medicineId -> qty
    const [reorderSupplierId, setReorderSupplierId] = React.useState<string>("");
    const [reorderNote, setReorderNote] = React.useState("");
    const [isAiLoading, setIsAiLoading] = React.useState(false);
    const [reorderSearchQuery, setReorderSearchQuery] = React.useState("");
    const [inventoryFilter, setInventoryFilter] = React.useState<"all" | "low_stock" | "healthy" | "expired">("all");
    const [cartMode, setCartMode] = React.useState<"reorder" | "return">("reorder");

    const handleOpenReturn = async () => {
        setIsReorderLoading(true);
        try {
            const res = await dashboardApi.getReturnSuggestions();
            if (res.data.success) {
                const returns = res.data.data.returns || [];
                setReturnList(returns);
                if (returns.length > 0) {
                    setFeedbackMessage(res.data.data.returns.length > 0 ? `${returns.length} expiring items identified.` : "Showing featured returns for processing.");
                    setShowFeedback(true);
                }
            }
        } catch (err) {
            console.error("Failed to load return suggestions", err);
        } finally {
            setIsReorderLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'reorder' && inventoryList.length === 0) {
            handleOpenReorder();
            // Clear cart when switching filters to avoid mixing types
            setCart(new Map());
            setCartMode(inventoryFilter === 'expired' ? 'return' : 'reorder');
            setReorderNote("");
        } else if (activeTab === 'return' && returnList.length === 0) {
            handleOpenReturn();
            setReturnCart(new Map());
            setReturnNote("");
        }
    }, [inventoryFilter, activeTab, inventoryList.length]);

    const [isReorderLoading, setIsReorderLoading] = React.useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = React.useState(false);
    const [connectingSupplierId, setConnectingSupplierId] = React.useState<string | null>(null);

    // Returns State
    const [returnList, setReturnList] = React.useState<any[]>([]);
    const [returnCart, setReturnCart] = React.useState<Map<string, number>>(new Map()); // Key: medicineId_batchNumber -> qty
    const [returnSupplierId, setReturnSupplierId] = React.useState<string>("");
    const [returnNote, setReturnNote] = React.useState("");
    const [isSendingReturn, setIsSendingReturn] = React.useState(false);
    const [returnSubTab, setReturnSubTab] = React.useState<"new" | "pending" | "history">("new");

    // POS Payment & Receipt Preview State
    const [posPaymentMethod, setPosPaymentMethod] = React.useState<string>("CASH");
    const [showReceiptPreview, setShowReceiptPreview] = React.useState(false);
    const [showPayUModal, setShowPayUModal] = React.useState(false);
    const [payUPaymentInfo, setPayUPaymentInfo] = React.useState<{
        amount: number;
        email: string;
        name: string;
        phone: string;
        orderId: string;
        payuData?: any;
    } | null>(null);
    const [currentReceiptUrl, setCurrentReceiptUrl] = React.useState<string | null>(null);
    const [currentSaleId, setCurrentSaleId] = React.useState<string | null>(null);
    const [posInventoryFilter, setPosInventoryFilter] = React.useState<"all" | "in_stock" | "out_of_stock">("all");

    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const [receiptEmail, setReceiptEmail] = React.useState("");
    const [isSendingEmail, setIsSendingEmail] = React.useState(false);

    const [showDisconnectConfirm, setShowDisconnectConfirm] = React.useState(false);
    const [disconnectSupplierId, setDisconnectSupplierId] = React.useState<string | null>(null);
    const [isDisconnectLoading, setIsDisconnectLoading] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [selectedReorder, setSelectedReorder] = React.useState<SupplierRequest | null>(null);
    const [showReorderDetails, setShowReorderDetails] = React.useState(false);

    // Send Reorder Logic
    const [isSendingReorder, setIsSendingReorder] = React.useState(false);
    const [reorderResult, setReorderResult] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);


    const NAV_ITEMS = [
        { label: "Overview", icon: Store, tab: "overview", color: "text-blue-500" },
        { label: "New Reorder", icon: Zap, tab: "reorder", color: "text-amber-500" },
        { label: "Returns", icon: RefreshCw, tab: "return", color: "text-red-500" },
        { label: "Sent Reorders", icon: Package, tab: "sent_reorders", color: "text-indigo-500" },
        { label: "New Sale", icon: ShoppingCart, tab: "sale", color: "text-emerald-500" },
        { label: "Sales History", icon: HistoryIcon, tab: "history", color: "text-slate-500" },
        { label: "Suppliers", icon: Users, tab: "suppliers", color: "text-purple-500" },
    ];


    const handleOpenReorder = async () => {
        setIsReorderLoading(true);
        try {
            const isReturnMode = inventoryFilter === 'expired';
            const res = await dashboardApi.getInventory({
                limit: 1000,
                filter: isReturnMode ? 'all' : inventoryFilter,
                return: isReturnMode
            });
            if (res.data.success) {
                setInventoryList(res.data.data.inventory);
            }
        } catch (err) {
            console.error("Failed to fetch inventory for reorder", err);
        } finally {
            setIsReorderLoading(false);
        }
    };

    const handleAddToCart = (medicineId: string, qty: number) => {
        setCart(prev => {
            const newCart = new Map(prev);
            if (qty <= 0) newCart.delete(medicineId);
            else newCart.set(medicineId, qty);
            return newCart;
        });
    };

    const handleReorderClick = () => {
        if (!reorderSupplierId) {
            setReorderResult({ type: 'error', message: "Please select a supplier." });
            return;
        }
        if (cart.size === 0) {
            setReorderResult({ type: 'error', message: "Please add items to reorder." });
            return;
        }
        executeReorder();
    };

    const executeReorder = async () => {
        if (!reorderSupplierId) {
            setReorderResult({ type: 'error', message: "Please select a supplier." });
            return;
        }
        if (cart.size === 0) {
            setReorderResult({ type: 'error', message: "Please add items to reorder." });
            return;
        }

        const items = Array.from(cart.entries()).map(([medicineId, quantity]) => {
            const medicine = inventoryList.find((m: any) => m.id === medicineId) || suggestedItems.find((m: any) => m.id === medicineId);
            // Default to 0 if not found or no batches. 
            // Prefer taking from first available batch or defined fields.
            const firstBatch = medicine?.batches?.[0] || medicine?.inventory?.[0]; // Support both structures
            const purchasePrice = firstBatch?.purchasePrice ? Number(firstBatch.purchasePrice) : (medicine?.purchasePrice || 0);
            const mrp = firstBatch?.mrp ? Number(firstBatch.mrp) : (medicine?.mrp || 0);

            return {
                medicineId,
                quantity,
                purchasePrice,
                mrp,
            };
        });

        setIsSendingReorder(true);
        try {
            let res;
            if (cartMode === 'return') {
                // REORDER TAB -> RETURN FLOW
                // We need to map items to include inventoryBatchId for deduction
                // Note: executeReorder uses 'cart' (medicineId -> qty), so we need to find the batch from inventoryList
                const returnItems = items.map(i => {
                    const m = inventoryList.find(x => x.id === i.medicineId);
                    // If expired filter is on, 'm' likely represents the batch or has batches.
                    // The backend 'filtered' list returns medicines with 'inventory' (batches).
                    // We should pick the first expired/relevant batch or spread across them?
                    // For simplicity, pick the first batch available in the list which should be the expired one.
                    const batchId = m?.batches?.[0]?.id || m?.inventory?.[0]?.id;
                    return { ...i, inventoryBatchId: batchId };
                });

                res = await dashboardApi.createReturn({
                    supplierId: reorderSupplierId,
                    items: returnItems,
                    note: reorderNote
                });
            } else {
                res = await dashboardApi.reorder({
                    supplierId: reorderSupplierId,
                    items,
                    note: reorderNote
                });
            }

            if (res.data.success) {
                setReorderResult({ type: 'success', message: `Request sent successfully!` });
                // We keep the state until user closes modal
            }
        } catch (err: any) {
            console.error(err);
            setReorderResult({ type: 'error', message: "Failed to send reorder: " + (err.response?.data?.message || err.message) });
        } finally {
            setIsSendingReorder(false);
        }
    };

    const handleReturnAddToCart = (key: string, qty: number) => {
        setReturnCart(prev => {
            const newCart = new Map(prev);
            if (qty <= 0) newCart.delete(key);
            else newCart.set(key, qty);
            return newCart;
        });
    };

    const executeReturn = async () => {
        if (!returnSupplierId) {
            setFeedbackMessage("Please select a supplier.");
            setShowFeedback(true);
            return;
        }
        if (returnCart.size === 0) {
            setFeedbackMessage("Please add items to return.");
            setShowFeedback(true);
            return;
        }

        const items = Array.from(returnCart.entries()).map(([key, quantity]) => {
            const [medicineId, batchNumber] = key.split('_');
            const item = returnList.find((r: any) => r.id === medicineId && r.batchNumber === batchNumber);

            return {
                medicineId,
                quantity,
                batchNumber,
                inventoryBatchId: item?.inventoryBatchId,
                purchasePrice: item?.purchasePrice || 0,
                mrp: 0 // Not needed for return?
            };
        });

        setIsSendingReturn(true);
        try {
            const res = await dashboardApi.createReturn({
                supplierId: returnSupplierId,
                items: items.map(i => ({ ...i, quantity: Number(i.quantity) })),
                note: returnNote
            });

            if (res.data.success) {
                setFeedbackMessage("Return request sent successfully!");
                setShowFeedback(true);
                setReturnCart(new Map());
                setReturnList([]);
                setActiveTab('sent_reorders');
            }
        } catch (err: any) {
            console.error(err);
            setFeedbackMessage("Failed to send return request: " + (err.response?.data?.message || err.message));
            setShowFeedback(true);
        } finally {
            setIsSendingReturn(false);
        }
    };


    const handleSmartFill = async () => {
        setIsAiLoading(true);
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Determine type based on current filter or tab
            // If user is looking at "Expired (Returns)", we fetch return suggestions
            const isReturnMode = activeTab === 'return' || inventoryFilter === 'expired';

            // Enforce mode based on suggestions
            setCartMode(isReturnMode ? 'return' : 'reorder');

            if (isReturnMode) {
                const res = await dashboardApi.getReturnSuggestions();
                if (res.data.success) {
                    const returns = res.data.data.returns || [];
                    if (returns.length === 0) {
                        setFeedbackMessage("No expiring items found to return.");
                        setShowFeedback(true);
                        setIsAiLoading(false);
                        return;
                    }

                    setCart(() => {
                        const newCart = new Map();
                        returns.forEach((r: any) => {
                            const current = newCart.get(r.id) || 0;
                            newCart.set(r.id, current + r.suggestedQty);
                        });
                        return newCart;
                    });

                    const storeName = data?.store?.name || "Our Pharmacy";
                    setReorderNote(`Return Request for ${returns.length} expired items from ${storeName}.`);
                    setFeedbackMessage(`AI identified ${returns.length} expiring batches. Auto-filled.`);
                    setShowFeedback(true);
                }
            } else {
                const res = await dashboardApi.getReorderSuggestions();
                if (res.data.success) {
                    const suggestions = res.data.data.suggestions || [];
                    if (suggestions.length === 0) {
                        setFeedbackMessage("No low stock items found.");
                        setShowFeedback(true);
                        setIsAiLoading(false);
                        return;
                    }

                    setSuggestedItems(suggestions);

                    // Auto-fill Reorder Cart
                    setCart(() => {
                        const newCart = new Map();
                        suggestions.forEach((s: any) => {
                            newCart.set(s.id || s.medicineId, s.suggestedQty);
                        });
                        return newCart;
                    });

                    const storeName = data?.store?.name || "Our Pharmacy";
                    const aiNote = `Hello,\n\nI would like to place an urgent restock request for ${suggestions.length} items for ${storeName}. Please prioritize immediate dispatch.\n\nGenerated by SynapStore AI 🤖`;
                    setReorderNote(aiNote);
                    setFeedbackMessage(`AI identified ${suggestions.length} low stock items. Auto-filled.`);
                    setShowFeedback(true);
                }
            }
        } catch (err: any) {
            console.error("Failed to get suggestions", err);
            setFeedbackMessage("Failed to fetch suggestions");
            setShowFeedback(true);
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- POS / Checkout State ---

    const [posQuery, setPosQuery] = React.useState("");
    const [isPosLoading, setIsPosLoading] = React.useState(false);
    const [posResults, setPosResults] = React.useState<any[]>([]);
    const [posCart, setPosCart] = React.useState<Map<string, { qty: number, medicine: any }>>(new Map()); // medicineId -> {qty, medicine}
    const [isCheckoutLoading, setIsCheckoutLoading] = React.useState(false);
    const [showPOSConfirm, setShowPOSConfirm] = React.useState(false);
    const [requestToReject, setRequestToReject] = React.useState<string | null>(null);
    const [viewingSubstitutesFor, setViewingSubstitutesFor] = React.useState<string | null>(null);


    // --- Forecast State ---
    const [forecastQuery, setForecastQuery] = React.useState("");
    const [forecastResults, setForecastResults] = React.useState<any[]>([]);
    const [_selectedForecastMedicine, setSelectedForecastMedicine] = React.useState<any | null>(null);
    const [forecastData, setForecastData] = React.useState<any | null>(null);
    const [isForecastLoading, setIsForecastLoading] = React.useState(false);
    const [isForecastSearching, setIsForecastSearching] = React.useState(false);
    const [forecastError, setForecastError] = React.useState<string | null>(null);
    const [isFeaturedMedicine, setIsFeaturedMedicine] = React.useState(false);
    const [failedForecasts, setFailedForecasts] = React.useState<Set<string>>(new Set());
    const [forecastDaysFilter, _setForecastDaysFilter] = React.useState<"7" | "15" | "30" | "all">("all");
    const [stopAutoForecast, setStopAutoForecast] = React.useState(false);
    const [_topForecasts, setTopForecasts] = React.useState<{ medicine: any, forecast: any }[]>([]);


    const searchForecastMedicines = async (q: string) => {
        setIsForecastSearching(true);
        try {
            const res = await dashboardApi.searchMedicines(q);
            if (res.data.success) {
                setForecastResults(res.data.data.medicines);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsForecastSearching(false);
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'overview' && forecastQuery.length > 0) {
                searchForecastMedicines(forecastQuery);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [forecastQuery, activeTab]);

    const handleRunForecast = async (medicine: any, isFeatured: boolean = false) => {
        console.log("handleRunForecast triggered for:", medicine.brandName, { isFeatured });

        if (failedForecasts.has(medicine.id)) {
            console.log("Forecast cached as failed for:", medicine.id);
            setForecastError("Not enough data to forecast (Cached)");
            return;
        }

        if (isFeatured && stopAutoForecast) {
            console.log("Auto-forecast is stopped due to previous failure");
            return;
        }

        const storeId = auth.effectiveStore?.id || data?.store?.id;
        console.log("Using Store ID:", storeId);

        if (!storeId) {
            console.error("Store ID missing", { authStore: auth.effectiveStore, dataStore: data?.store });
            setForecastError("Store ID missing. Please refresh the page.");
            return;
        }

        setSelectedForecastMedicine(medicine);
        setForecastQuery("");
        setIsForecastLoading(true);
        setIsFeaturedMedicine(isFeatured);
        setForecastError(null);

        try {
            console.log("Sending Inventory Forecast request...", { storeId, medicineId: medicine.id });
            const res = await dashboardApi.getInventoryForecast({
                store_id: storeId,
                medicine_id: medicine.id,
                horizon_days: [7, 15, 30]
            });
            console.log("Forecast response received:", res.data);
            setForecastData(res.data);
            setTopForecasts([]);
        } catch (err: any) {
            console.error("Forecast failed:", err);
            const detail = err.response?.data?.detail;

            if (detail && typeof detail === "string" && (detail.toLowerCase().includes("not enough") || detail.toLowerCase().includes("data"))) {
                setForecastError("No enough data to show forecast data");
                setFailedForecasts(prev => {
                    const next = new Set(prev);
                    next.add(medicine.id);
                    return next;
                });
            } else {
                setForecastError("Failed to generate forecast due to a system error. Please try again later.");
            }

            // Mark as failed to prevent auto-fetch loop even on generic errors
            setFailedForecasts(prev => {
                const next = new Set(prev);
                next.add(medicine.id);
                return next;
            });

            if (isFeatured) {
                console.log("Auto-forecast failed, stopping further auto-attempts");
                setStopAutoForecast(true);
            }
        } finally {
            setIsForecastLoading(false);
        }
    };

    // Auto-fetch top medicine forecast on load
    React.useEffect(() => {
        const fetchTopMedicineForecast = async () => {
            // Stop auto-fetching if it's already loading, we already have data, there's an error, or the stop flag is set
            if (activeTab === 'overview' && !forecastData && !isForecastLoading && data && !forecastError && !stopAutoForecast) {
                try {
                    let medicineToForecast: any = null;

                    // Call new backend API to get the best candidate
                    console.log("Fetching featured medicine from backend...");
                    const featuredRes = await dashboardApi.getFeaturedMedicine();

                    if (featuredRes.data.success && featuredRes.data.data.medicine) {
                        medicineToForecast = featuredRes.data.data.medicine;
                    }

                    // Trigger forecast for the selected medicine with featured flag
                    if (medicineToForecast) {
                        console.log("Auto-triggering forecast for featured medicine:", medicineToForecast.brandName);
                        await handleRunForecast(medicineToForecast, true);
                    }
                } catch (err) {
                    console.error("Failed to auto-fetch top medicine forecast", err);
                }
            }
        };

        fetchTopMedicineForecast();
    }, [activeTab, data, forecastData, isForecastLoading, failedForecasts, forecastError, stopAutoForecast]);

    const chartData = React.useMemo(() => {
        if (!forecastData?.plot_data) return [];

        try {
            const demandPlot = forecastData.plot_data?.demand || forecastData.plot_data || {};
            const pricePlot = forecastData.price_plot_data || forecastData.plot_data?.price || {};

            const dHist = Array.isArray(demandPlot.history) ? demandPlot.history : [];
            const dFore = Array.isArray(demandPlot.forecast) ? demandPlot.forecast : [];
            const dConf = Array.isArray(demandPlot.confidence) ? demandPlot.confidence : [];

            const pHist = Array.isArray(pricePlot.history) ? pricePlot.history : [];
            const pFore = Array.isArray(pricePlot.forecast) ? pricePlot.forecast : [];

            // 1. Create a master list of all unique dates across all data sets
            const allDates = new Set<string>();
            [dHist, dFore, pHist, pFore].forEach(arr => {
                arr.forEach((item: any) => { if (item.date) allDates.add(item.date); });
            });
            const sortedDates = Array.from(allDates).sort();

            // 2. Map data for each unique date
            const fullData = sortedDates.map(date => {
                const dh = dHist.find((x: any) => x.date === date);
                const df = dFore.find((x: any) => x.date === date);
                const ph = pHist.find((x: any) => x.date === date);
                const pf = pFore.find((x: any) => x.date === date);
                const dc = dConf.find((x: any) => x.date === date);

                const getVal = (obj: any) => (obj && typeof obj.qty === 'number') ? obj.qty : ((obj && typeof obj.price === 'number') ? obj.price : null);

                const historyVal = getVal(dh);
                const forecastVal = getVal(df);
                const priceHistVal = getVal(ph);
                const priceForeVal = getVal(pf);

                let confRange = null;
                if (dc) {
                    const low = typeof dc.low === 'number' ? dc.low : (forecastVal ?? 0);
                    const high = typeof dc.high === 'number' ? dc.high : (forecastVal ?? 0);
                    confRange = [low, high];
                }

                return {
                    date,
                    history: historyVal,
                    forecast: forecastVal,
                    priceHistory: priceHistVal,
                    priceForecast: priceForeVal,
                    confRange
                };
            });

            // 3. Independent Seamless Stitching
            // Connect Demand History to Forecast
            const lastHIdx = [...fullData].reverse().findIndex(x => x.history !== null);
            if (lastHIdx !== -1) {
                const actualIdx = fullData.length - 1 - lastHIdx;
                const lastH = fullData[actualIdx];
                if (fullData.some((x, i) => i > actualIdx && x.forecast !== null)) {
                    lastH.forecast = lastH.history;
                    lastH.confRange = [Number(lastH.history), Number(lastH.history)];
                }
            }

            // Connect Price History to Forecast
            const lastPHIdx = [...fullData].reverse().findIndex(x => x.priceHistory !== null);
            if (lastPHIdx !== -1) {
                const actualPIdx = fullData.length - 1 - lastPHIdx;
                const lastPH = fullData[actualPIdx];
                if (fullData.some((x, i) => i > actualPIdx && x.priceForecast !== null)) {
                    lastPH.priceForecast = lastPH.priceHistory;
                }
            }

            // 4. Filtering
            if (forecastDaysFilter !== 'all') {
                const lastHistoryDate = [...sortedDates].reverse().find(d => dHist.some((h: any) => h.date === d));
                if (lastHistoryDate) {
                    const cutoffIdx = sortedDates.indexOf(lastHistoryDate);
                    const days = parseInt(forecastDaysFilter);
                    return fullData.slice(0, cutoffIdx + 1 + days);
                }
            }

            return fullData;
        } catch (e) {
            console.error("Error processing unified chart data", e);
            return [];
        }
    }, [forecastData, forecastDaysFilter]);


    // Debounced search for POS

    React.useEffect(() => {
        if (activeTab !== 'sale') return;

        const timer = setTimeout(() => {
            // Fetch even if query is empty (to show recent items)
            searchPOSMedicines(posQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [posQuery, activeTab]);

    const searchPOSMedicines = async (q: string) => {
        setIsPosLoading(true);
        try {
            const res = await dashboardApi.searchMedicines(q);
            if (res.data.success) {
                setPosResults(res.data.data.medicines);
            }
        } catch (err) {
            console.error("POS Search failed", err);
        } finally {
            setIsPosLoading(false);
        }
    };

    const handlePOSAddToCart = (medicine: any, qty: number) => {
        // Validation: Check stock
        const currentStock = medicine.inventory?.reduce((acc: number, b: any) => acc + b.qtyAvailable, 0) || 0;

        if (qty > currentStock) {
            setFeedbackMessage(`Cannot add more than available stock (${currentStock})`);
            setShowFeedback(true);
            return;
        }

        setPosCart(prev => {
            const newCart = new Map(prev);
            if (qty <= 0) {
                newCart.delete(medicine.id);
            } else {
                newCart.set(medicine.id, { qty, medicine });
            }
            return newCart;
        });
    };

    const handleSendReceipt = async () => {
        if (!currentSaleId) {
            setFeedbackMessage("Error: Sale ID not found. Cannot send receipt.");
            setShowFeedback(true);
            return;
        }
        if (!receiptEmail) {
            setFeedbackMessage("Please enter a valid email.");
            setShowFeedback(true);
            return;
        }
        setIsSendingEmail(true);
        try {
            await dashboardApi.sendReceiptEmail(currentSaleId, receiptEmail);
            setFeedbackMessage("Receipt sent successfully!");
            setShowFeedback(true);
            setReceiptEmail("");
        } catch (err: any) {
            console.error(err);
            setFeedbackMessage("Failed to send email: " + (err.response?.data?.message || err.message));
            setShowFeedback(true);
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handlePOSCheckoutClick = () => {
        if (posCart.size === 0) return;
        executeCheckout();
    };

    const executeCheckout = async () => {
        if (posCart.size === 0) return;

        setIsCheckoutLoading(true);
        try {
            const items = Array.from(posCart.values()).map(({ medicine, qty }) => ({ medicineId: medicine.id, qty }));

            const isOnline = posPaymentMethod === "ONLINE";

            // If online, we don't want a blob, we want JSON. 
            // But dashboardApi.checkoutSale is defined with responseType: 'blob'.
            // Actually, we can just use dashboardApi.checkoutSale and then check the response.
            // However, Axios with responseType: 'blob' will try to parse JSON as a Blob.
            // We can convert Blob back to text/JSON if needed.
            
            const res = await dashboardApi.checkoutSale(items, posPaymentMethod);

            if (isOnline) {
                // Convert blob back to JSON string
                const text = await (res.data as Blob).text();
                const json = JSON.parse(text);

                if (json.success) {
                    const saleData = json.data;
                    
                    setPayUPaymentInfo({
                        amount: Number(saleData.total),
                        email: saleData.email || "",
                        name: saleData.name || "",
                        phone: saleData.phone || "",
                        orderId: saleData.saleId,
                        payuData: saleData.payuData // Now returned directly from checkoutSale
                    });
                    setShowPayUModal(true);

                    // Reset cart and query
                    setPosCart(new Map());
                    setPosQuery("");
                    setPosPaymentMethod("CASH");
                } else {
                    throw new Error(json.message || "Failed to initiate online payment");
                }
            } else {
                // "res.data" is the blob because responseType: 'blob'
                const blob = new Blob([res.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);

                // Extract Sale ID from headers
                const saleId = res.headers['x-sale-id'];

                setCurrentReceiptUrl(url);
                if (saleId) setCurrentSaleId(saleId);

                setShowReceiptPreview(true);

                // Reset cart
                setPosCart(new Map());
                setPosQuery("");
                setPosPaymentMethod("CASH"); // Reset to default
                searchPOSMedicines(""); // Force refresh stock

                // Refresh dashboard data/receipts silently?
                try {
                    const r = await dashboardApi.getReceipts();
                    setReceipts(r.data.data.receipts);
                } catch (e) {
                    console.error("Failed to refresh receipts", e);
                }
            }

        } catch (err: any) {
            console.error(err);
            setFeedbackMessage("Checkout failed: " + (err.response?.data?.message || err.message));
            setShowFeedback(true);
            let message = "Checkout failed: ";
            if (err.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    message += json.message || err.message;
                } catch (e) {
                    message += err.message;
                }
            } else {
                message += (err.response?.data?.message || err.message);
            }
            alert(message);
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    // Reorder State

    // Reorder State

    const theme = themeConfig.black;

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchData = React.useCallback(async () => {
        try {
            const [storeRes, bootstrapRes, requestsRes] = await Promise.all([
                dashboardApi.getStore(),
                dashboardApi.getBootstrap(),
                dashboardApi.getSupplierRequests(),
            ]);

            // Role & Store Update Check
            if (storeRes.data.success) {
                const fetchedUser = storeRes.data.data.user;
                const fetchedStore = storeRes.data.data.store;

                let shouldUpdate = false;
                let newAuth: any = { ...auth };

                // 1. Check Role
                if (auth.user && fetchedUser.globalRole !== auth.user.globalRole) {
                    newAuth.user = { ...newAuth.user, globalRole: fetchedUser.globalRole };
                    shouldUpdate = true;

                    if (fetchedUser.globalRole === "SUPPLIER") {
                        setShowFeedback(true);
                        setFeedbackMessage("Access Updated: Congrats you are now a SUPPLIER!");
                        setShowFeedback(true);
                    }
                }

                // 2. Check Store (Fix for missing store name on first login)
                if (fetchedStore && (!auth.effectiveStore || auth.effectiveStore.id !== fetchedStore.id || auth.effectiveStore.name !== fetchedStore.name)) {
                    newAuth.effectiveStore = fetchedStore;
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    setAuth(newAuth);
                }
            }

            if (bootstrapRes.data.success) {
                setData(bootstrapRes.data.data);
            }

            if (requestsRes.data.success && Array.isArray(requestsRes.data.data)) {
                // Filter notifications: Only show INBOUND requests (Requests created by the Supplier, i.e., NOT by me)
                // Actually, more accurately: Requests where createdById is NOT the current user
                // Or better: Requests where the direction is Incoming.
                // Since we don't have strict direction field in SupplierRequest type here, rely on createdById vs auth.user.id
                // But wait, if Self-Connect, createdById matches user (who is both Store Owner and Supplier).
                // If I am Store Owner, and I see a request I created, it's Outbound (except for Self-Connect where backend says Inbound?).
                // Backend logic: If CreatedBy == Supplier.userId -> Inbound.
                // Here we just want to avoid showing "You sent a request" as a notification to yourself.
                // So filter: remove requests created by ME.
                // UNLESS it's a self-request that is treated as Inbound?
                // Let's stick to: If createdById != auth.user?.id, show notification.
                // If I sent it, I don't need a notification.
                const allRequests = requestsRes.data.data;
                const inbound = allRequests.filter((r: SupplierRequest) => r.createdById !== auth.user?.id && r.status === 'PENDING');
                setSupplierRequests(inbound);

                // Also track my sent requests/reorders
                const outbound = allRequests.filter((r: SupplierRequest) => r.createdById === auth.user?.id);
                setMyRequests(outbound);
            }
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    }, [auth.user, setAuth]);

    React.useEffect(() => {
        if (auth.token && !data) {
            fetchData();
        }
    }, [auth.token, data, fetchData]);

    const refreshData = async () => {
        setIsRefreshing(true);

        // Refresh only the active section
        switch (activeTab) {
            case 'reorder':
                await handleOpenReorder();
                break;
            case 'sale':
                await searchPOSMedicines("");
                break;
            case 'history':
                await handleViewReceipts();
                break;
            case 'overview':
            case 'suppliers':
            case 'sent_reorders':
            default:
                await fetchData();
                break;
        }

        setTimeout(() => setIsRefreshing(false), 500); // Min delay for visual feedback
    };

    // Effect to handle tab-specific data fetching
    React.useEffect(() => {
        if (activeTab === 'reorder' && inventoryList.length === 0) {
            handleOpenReorder();
        } else if (activeTab === 'sale' && posResults.length === 0) {
            searchPOSMedicines("");
        } else if (activeTab === 'history' && receipts.length === 0) {
            handleViewReceipts();
        } else if ((activeTab === 'overview' || activeTab === 'return') && returnList.length === 0) {
            handleOpenReturn();
        }
    }, [activeTab, inventoryList.length, posResults.length, receipts.length, returnList.length]);


    // Directory State
    const [directorySuppliers, setDirectorySuppliers] = React.useState<any[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isDirectoryLoading, setIsDirectoryLoading] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);

    const fetchSuppliersDirectory = React.useCallback(async (q?: string) => {
        setIsDirectoryLoading(true);
        try {
            const res = await dashboardApi.suppliersDirectory(q);
            if (res.data.success) {
                setDirectorySuppliers(res.data.data.suppliers);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsDirectoryLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (activeTab === 'suppliers') {
            const timer = setTimeout(() => {
                fetchSuppliersDirectory(searchQuery);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, searchQuery, fetchSuppliersDirectory]);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const handleAcceptRequest = async (requestId: string) => {
        // Optimistic update
        setSupplierRequests(prev => prev.filter(req => req.id !== requestId));
        try {
            await dashboardApi.acceptSupplierRequest(requestId);
            setFeedbackMessage("Supplier connected successfully");
            setShowFeedback(true);
        } catch (err) {
            console.error(err);
            // Revert on failure (optional, but good practice. For now simpler: alert)
            setFeedbackMessage("Failed to accept");
            setShowFeedback(true);
            // refresh to be safe
            window.location.reload();
        }
    };

    const handleRejectRequest = (requestId: string) => {
        setRequestToReject(requestId);
    };

    const executeRejectRequest = async () => {
        if (!requestToReject) return;
        const requestId = requestToReject;

        // Optimistic UI update
        setSupplierRequests(prev => prev.filter(req => req.id !== requestId));
        setRequestToReject(null);

        try {
            await dashboardApi.rejectSupplierRequest(requestId);
            setFeedbackMessage("Request rejected");
            setShowFeedback(true);
        } catch (err) {
            console.error(err);
            // Ideally revert state here, but simple alert for now if it fails drastically
            setFeedbackMessage("Failed to reject");
            setShowFeedback(true);
        }
    };

    const handleDisconnectSupplier = (supplierId: string) => {
        setDisconnectSupplierId(supplierId);
        setShowDisconnectConfirm(true);
    };

    const executeDisconnectSupplier = async () => {
        if (!disconnectSupplierId) return;
        setIsDisconnectLoading(true);
        try {
            await dashboardApi.disconnectSupplier(disconnectSupplierId);
            // Optimistically update lists.suppliers
            setData(prev => prev ? {
                ...prev,
                lists: {
                    ...prev.lists,
                    suppliers: prev.lists.suppliers.filter(s => s.id !== disconnectSupplierId)
                }
            } : null);
        } catch (err) {
            console.error("Failed to disconnect", err);
            setFeedbackMessage("Failed to disconnect supplier");
            setShowFeedback(true);
        } finally {
            setIsDisconnectLoading(false);
            setShowDisconnectConfirm(false);
            setDisconnectSupplierId(null);
        }
    };



    const handleConnectRequest = async (supplierId: string) => {
        try {
            setConnectingSupplierId(supplierId);
            await dashboardApi.createSupplierRequest({ supplierId });
            // Optimistic update
            setDirectorySuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, connectionStatus: "PENDING" } : s));
            setFeedbackMessage("Connection request sent");
            setShowFeedback(true);
        } catch (err) {
            console.error(err);
            setFeedbackMessage("Failed to send request");
            setShowFeedback(true);
        } finally {
            setConnectingSupplierId(null);
        }
    };





    // --- Receipts / History ---
    const handleViewReceipts = async () => {
        setIsHistoryLoading(true);
        try {
            const res = await dashboardApi.getReceipts();
            if (res.data.success) {
                setReceipts(res.data.data.receipts);
            }
        } catch (err) {
            console.error("Failed to fetch receipts", err);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const viewReceiptPDF = async (id: string) => {
        try {
            const res = await dashboardApi.getReceiptPDF(id);
            const file = new Blob([res.data as any], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            setCurrentReceiptUrl(fileURL);
            setCurrentSaleId(id);
            setShowReceiptPreview(true);
        } catch (err) {
            console.error("Failed to load PDF", err);
            setFeedbackMessage("Failed to load PDF");
            setShowFeedback(true);
        }
    };

    const downloadReceiptPDF = async (id: string, receiptNo?: string) => {
        try {
            const res = await dashboardApi.getReceiptPDF(id);
            const file = new Blob([res.data as any], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = `Receipt-${receiptNo || id}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Failed to download PDF", err);
            setFeedbackMessage("Failed to download PDF");
            setShowFeedback(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50">
                {/* Header Skeleton */}
                <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 h-20">
                    <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-12 h-12 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <Skeleton className="w-10 h-10 rounded-full" />
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                    {/* Welcome Skeleton */}
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>

                    {/* Stats Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex justify-between mb-4">
                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                    <Skeleton className="w-16 h-6 rounded-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart Skeleton */}
                        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 h-[400px]">
                            <div className="flex justify-between mb-8">
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                                <Skeleton className="h-10 w-32 rounded-xl" />
                            </div>
                            <Skeleton className="w-full h-[250px] rounded-xl" />
                        </div>

                        {/* Recent Activity Skeleton */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 h-[400px]">
                            <Skeleton className="h-6 w-32 mb-6" />
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4">
                                        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                                        <div className="w-full space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const stats = [
        {
            icon: FaRupeeSign,
            label: "Revenue (30d)",
            value: `₹${data?.overview.recentRevenue.toLocaleString() ?? "0"}`,
            color: theme.primary,
            bg: theme.light,
            text: theme.text,
            change: "+12.5%", // Placeholder for "human" feel if backend doesn't provide
        },
        {
            icon: ShoppingCart,
            label: "Sales (30d)",
            value: data?.overview.recentSalesCount.toString() ?? "0",
            color: theme.primary,
            bg: theme.light,
            text: theme.text,
            change: "+4.3%",
        },
        {
            icon: Package,
            label: "totalMedicines",
            value: data?.overview.totalMedicines.toString() ?? "0",
            color: theme.primary,
            bg: theme.light,
            text: theme.text,
            change: ((data?.overview.totalMedicines ? data.overview.totalMedicines : 0) < 10)  ? "Get some medicines" : "Okay",
        },
        {
            icon: Users,
            label: "Suppliers",
            value: data?.lists.suppliers.length.toString() ?? "0",
            color: theme.primary,
            bg: theme.light,
            text: theme.text,
            change: "Active",
        },
    ];

    return (
        <div className="min-h-screen relative bg-slate-50/50">

            {/* Header */}
            <header
                className={`fixed top-0 left-0 w-full z-40 pl-8 pr-8
  transition-[background-color,backdrop-filter,box-shadow,border-color]
  duration-500 ease-out
  ${isScrolled
                        ? 'bg-white/60 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'
                        : 'bg-white/0 backdrop-blur-md border-b border-transparent shadow-none'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
                    {/* Left: Brand & Store Info */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <Store className="w-8 h-8 text-black" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">
                                {auth.effectiveStore?.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.text} opacity-80`}>
                                    {auth.user?.globalRole} Dashboard
                                </span>
                            </div>
                        </div>
                    </div>



                    {/* Action buttons moved to Dock */}
                    <div className="flex items-center gap-2">

                        {/* Refresh Button */}
                        <div
                            onClick={refreshData}
                            className={`flex items-center justify-center p-2 rounded-lg bg-white border border-slate-200/80 shadow-sm cursor-pointer hover:bg-slate-50 transition-all ${isRefreshing ? 'opacity-70 pointer-events-none' : ''}`}
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </div>

                        {/* Date */}
                        <div className="hidden xl:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200/80 px-3 py-2 rounded-lg shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <div
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2.5 bg-white border border-slate-200/80 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:shadow-md transition-all relative outline-none group cursor-pointer"
                            >
                                <motion.div
                                    animate={supplierRequests.length > 0 ? { rotate: [0, -20, 20, -20, 20, 0] } : {}}
                                    transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.8, ease: "easeInOut" }}
                                >
                                    <Bell className="w-5 h-5 group-hover:scale-105 transition-transform" />
                                </motion.div>

                                {supplierRequests.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {supplierRequests.length}
                                    </span>
                                )}
                            </div>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 p-4 z-50 origin-top-right ring-1 ring-slate-100/50"
                                    >
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <h3 className="font-bold text-slate-800">Notifications</h3>
                                            {supplierRequests.length > 0 && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{supplierRequests.length} New</span>}
                                        </div>

                                        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                            {supplierRequests.length === 0 ? (
                                                <EmptyState 
                                                    icon={Bell}
                                                    title="All Caught Up"
                                                    description="You don't have any new supplier connection requests at the moment."
                                                />
                                            ) : (
                                                supplierRequests.map(req => (
                                                    <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
                                                                <Truck className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{req.supplier?.name || "Unknown"}</p>
                                                                <p className="text-xs text-slate-500 mt-0.5">Wants to connect with your store</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleAcceptRequest(req.id)}
                                                                className="flex-1 h-8 text-xs !bg-black !text-white hover:!bg-neutral-800 border-none shadow-sm"
                                                            >
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleRejectRequest(req.id)}
                                                                className="flex-1 h-8 text-xs !bg-black !text-white hover:!bg-neutral-800 border-none shadow-sm"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block mx-1"></div>

                        {/* User Profile & Logout */}
                        <div className="flex items-center gap-4 pl-2">

                            {/* User Info */}
                            <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
                                <span className="text-sm font-bold text-slate-800">
                                    {capitalize(auth.user?.username)}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                    {auth.user?.globalRole?.toLowerCase().replace('_', ' ')}
                                </span>
                            </div>

                            {/* Avatar */}
                            <div className="relative group">
                                <div className="flex items-center justify-center w-11 h-11 rounded-full 
                      bg-white text-slate-700 
                      font-bold shadow-md border-[2px] border-white ring-1 ring-slate-100 overflow-hidden transition-transform group-hover:scale-105">
                                    {auth.user?.imageUrl && !imgError ? (
                                        <img
                                            key={auth.user.imageUrl}
                                            src={auth.user.imageUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600">
                                            {auth.user?.username?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>

                            {/* Logout Button */}
                            <div
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center rounded-full
             bg-transparent text-slate-500 border border-slate-200 shadow-sm
             hover:bg-red-50 hover:text-red-600 hover:border-red-200
             transition-all cursor-pointer"
                                title="Sign out"
                            >
                                <LogOut className="w-5 h-5" /> {/* increased size */}
                            </div>

                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-8 space-y-8 relative z-10">

                {/* Welcome Section */}
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
                    >
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">
                                {getGreeting()}, <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>{capitalize(auth.user?.username.split(' ')[0])}</span>
                            </h2>
                            <p className="text-slate-500 mt-1">Here's what's happening in your store today.</p>
                        </div>
                        {/* {data?.lists.lowStock.length ? (
                            <div className="animate-pulse bg-amber-50 text-amber-700 px-4 py-2 rounded-lg text-sm font-medium border border-amber-200 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                {data.lists.lowStock.length} items low on stock
                            </div>
                        ) : null} */}
                    </motion.div>
                )}

                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:${theme.shadow} transition-all group`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform duration-300`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        {stat.change && (
                                            <span
                                                className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${stat.change.includes("Action") ? "bg-red-50 text-red-600" : ""}`}
                                                style={!stat.change.includes("Action") ? { backgroundColor: theme.hex + '20', color: theme.hex } : undefined}
                                            >
                                                {stat.change.includes("Action") ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                                {stat.change}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                                        <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* --- EXPIRING STOCK ALERT --- */}
                        {returnList.length > 0 && (
                            <div className="bg-white border border-red-100 rounded-3xl p-6 mb-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            Action Required: {returnList.length} Expiring Items
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-4 max-w-xl">
                                            The following items are expired or expiring within 90 days. Convert them to return requests to clear stock and claim refunds.
                                        </p>
                                        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                                            {returnList.slice(0, 3).map(item => (
                                                <div key={`${item.id}_${item.batchNumber}`} className="flex items-center gap-3 bg-white border border-red-50 p-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-sm font-bold border ${item.reason === 'Expired' ? 'bg-red-600 text-white border-red-700' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                        <span className="text-[10px] uppercase leading-none">{new Date(item.expiryDate).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-sm">{new Date(item.expiryDate).getDate()}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{item.brandName}</div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1 rounded">#{item.batchNumber}</span>
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter ${item.reason === 'Expired' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {item.reason}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {returnList.length > 3 && (
                                                <div className="flex items-center justify-center px-4 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-2xl border border-red-100">
                                                    +{returnList.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full lg:w-auto flex justify-end">
                                        <Button
                                            onClick={() => setActiveTab('return')}
                                            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20 px-6 py-2 rounded-xl font-bold transition-all text-sm"
                                        >
                                            Process Returns <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- AI FORECAST SECTION --- */}
                        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm mb-8 relative overflow-hidden">
                            {/* Background Effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-indigo-500" />
                                            AI Inventory Forecast
                                        </h3>
                                        <p className="text-slate-500 text-sm mt-1">Search for medicines or view featured forecast</p>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="relative w-full md:w-96">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search medicine to forecast..."
                                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                                                value={forecastQuery}
                                                onChange={(e) => setForecastQuery(e.target.value)}
                                            />
                                            {isForecastSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Dropdown Results */}
                                        {forecastQuery.length > 0 && forecastResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto z-50 custom-scrollbar">
                                                {forecastResults.map(med => (
                                                    <div
                                                        key={med.id}
                                                        className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none flex items-center justify-between group"
                                                        onClick={() => handleRunForecast(med)}
                                                    >
                                                        <div className="flex-1 pr-4">
                                                            <div className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">{med.brandName}</div>
                                                            <div className="text-xs text-slate-400">{med.genericName} • {med.strength}</div>
                                                            <div className="flex flex-wrap gap-2 mt-1.5">
                                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                                                                    {med.inventory && med.inventory.length > 0 ? `₹${med.inventory[0].mrp}` : "Out of Stock"}
                                                                </span>
                                                                {med.inventory && med.inventory.length > 0 && (
                                                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-medium">
                                                                        Batch: {med.inventory[0].batchNumber} {med.inventory.length > 1 && `+${med.inventory.length - 1}`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Loading State */}
                                {isForecastLoading && (
                                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center relative">
                                            <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                                            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-700 animate-pulse">Generating Forecast...</p>
                                            <p className="text-xs text-slate-400 mt-1">Analyzing historical trends and seasonality</p>
                                        </div>
                                    </div>
                                )}

                                {/* Forecast Data Display */}
                                {!isForecastLoading && forecastData && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Top Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medicine Details</div>
                                                    {isFeaturedMedicine && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-full">
                                                            <Sparkles className="w-2.5 h-2.5" />
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="font-bold text-lg text-slate-800 leading-tight">{forecastData.medicine_name}</div>
                                                {_selectedForecastMedicine && (
                                                    <div className="text-xs text-slate-500 mt-3 space-y-1.5 border-t border-slate-200 pt-2">
                                                        <div className="grid grid-cols-2 gap-x-2">
                                                            <span className="text-slate-400">Generic:</span>
                                                            <span className="font-medium text-slate-700 truncate">{_selectedForecastMedicine.genericName}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-2">
                                                            <span className="text-slate-400">Strength:</span>
                                                            <span className="font-medium text-slate-700">{_selectedForecastMedicine.strength}</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-x-2">
                                                            <span className="text-slate-400">Mfr:</span>
                                                            <span className="font-medium text-slate-700 truncate">{_selectedForecastMedicine.manufacturer}</span>
                                                        </div>
                                                        <div className="block mt-1">
                                                            <span className="text-slate-400 block mb-0.5">Batch Numbers:</span>
                                                            <span className="font-medium text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] break-all">
                                                                {_selectedForecastMedicine.inventory?.map((b: any) => b.batchNumber).join(", ") || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">Current Stock: <span className="font-bold text-slate-900">{forecastData.current_stock}</span></div>
                                            </div>

                                            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                                                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Forecast (30 Days)</div>
                                                <div className="text-2xl font-bold text-indigo-700">{forecastData.demand_forecast["30"] || 0} <span className="text-sm font-medium text-indigo-400">units</span></div>
                                                <div className="text-xs text-indigo-400 mt-1">Predicted Demand</div>
                                            </div>

                                            <div className={`rounded-2xl p-4 border ${forecastData.reorder_now ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${forecastData.reorder_now ? 'text-amber-500' : 'text-emerald-500'}`}>Recommendation</div>
                                                <div className={`text-lg font-bold flex items-center gap-2 ${forecastData.reorder_now ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                    {forecastData.reorder_now ? (
                                                        <>
                                                            <Zap className="w-5 h-5" /> Reorder Now
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-5 h-5" /> Sufficient Stock
                                                        </>
                                                    )}
                                                </div>
                                                {forecastData.reorder_now && (
                                                    <div className="text-xs text-amber-600/80 mt-1">Suggested Qty: <strong>{forecastData.reorder_quantity?.["30"] || 0}</strong></div>
                                                )}
                                            </div>

                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confidence Score</div>
                                                <div className="flex items-end gap-2">
                                                    <div className="text-2xl font-bold text-slate-800">High</div>
                                                    <div className="mb-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 font-bold rounded-full">92%</div>
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">Based on solid historical data</div>
                                            </div>
                                        </div>

                                        {/* Consolidated Premium Forecast Chart */}
                                        <div className="w-full">
                                            <MetricCard className="w-full border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
                                                <MetricCardHeader className="border-0 min-h-auto pt-6 pb-6">
                                                    <div className="space-y-1">
                                                        <MetricCardTitle className="text-lg font-bold text-slate-800">Market Intelligence</MetricCardTitle>
                                                        <MetricCardDescription className="text-slate-500 text-xs font-medium uppercase tracking-wider">Demand vs Price Trends</MetricCardDescription>
                                                    </div>
                                                    <CardToolbar>
                                                        <div className="flex items-center gap-4 text-xs font-semibold mr-4">
                                                            <div className="flex items-center gap-1.5 text-slate-500">
                                                                <div className="size-2.5 border-2 rounded-full border-slate-400 bg-white"></div>
                                                                History
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-indigo-500">
                                                                <div className="size-2.5 border-2 rounded-full border-indigo-500 bg-white"></div>
                                                                Demand Forecast
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-emerald-500">
                                                                <div className="size-2.5 border-2 rounded-full border-emerald-500 bg-white"></div>
                                                                Price Prediction
                                                            </div>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                                                    <MoreHorizontal className="size-5 text-slate-400" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" side="bottom">
                                                                <DropdownMenuItem className="gap-2">
                                                                    <Download className="size-4" /> Download Report
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2">
                                                                    <Share2 className="size-4" /> Share Analytics
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="gap-2">
                                                                    <RefreshCw className="size-4" /> Recalculate
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </CardToolbar>
                                                </MetricCardHeader>

                                                <MetricCardContent className="px-4 pb-8">
                                                    {chartData && chartData.length > 0 ? (
                                                        <ChartContainer config={forecastChartConfig} className="h-[400px] w-full">
                                                            <ComposedChart
                                                                data={JSON.parse(JSON.stringify(chartData))}
                                                                margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
                                                            >
                                                                <defs>
                                                                    <linearGradient id="premiumDemandGradient" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.25} />
                                                                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.01} />
                                                                    </linearGradient>
                                                                    <linearGradient id="premiumPriceGradient" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                                                                    </linearGradient>
                                                                </defs>

                                                                <CartesianGrid strokeDasharray="4 12" stroke="#e2e8f0" vertical={false} />

                                                                <XAxis
                                                                    dataKey="date"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                                                    tickMargin={15}
                                                                    tickFormatter={(val) => {
                                                                        const d = new Date(val);
                                                                        return isNaN(d.getTime()) ? val : `${d.getDate()} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
                                                                    }}
                                                                />

                                                                <YAxis
                                                                    yAxisId="demand"
                                                                    orientation="left"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                                                                    tickMargin={10}
                                                                />

                                                                <YAxis
                                                                    yAxisId="price"
                                                                    orientation="right"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fontSize: 11, fill: '#10b981', fontWeight: 600 }}
                                                                    tickMargin={10}
                                                                    tickFormatter={(val) => `₹${val}`}
                                                                />

                                                                <ChartTooltip
                                                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                                                    content={
                                                                        <ChartTooltipContent
                                                                            className="w-48 bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl rounded-2xl p-3"
                                                                            formatter={(value: any, name: any) => (
                                                                                <div className="flex items-center justify-between w-full">
                                                                                    <span className="text-slate-500 font-medium">{name}:</span>
                                                                                    <span className="font-bold text-slate-900 ml-2">
                                                                                        {Array.isArray(value)
                                                                                            ? `${value[0]} - ${value[1]}`
                                                                                            : (name.toLowerCase().includes('price') ? `₹${value}` : value)
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        />
                                                                    }
                                                                />

                                                                {/* Confidence Range Shading */}
                                                                <Area
                                                                    yAxisId="demand"
                                                                    dataKey="confRange"
                                                                    type="monotone"
                                                                    stroke="none"
                                                                    fill="url(#premiumDemandGradient)"
                                                                    activeDot={false}
                                                                />

                                                                {/* Demand History */}
                                                                <Line
                                                                    yAxisId="demand"
                                                                    type="monotone"
                                                                    dataKey="history"
                                                                    stroke="var(--color-history)"
                                                                    strokeWidth={4}
                                                                    dot={{ r: 4, stroke: '#fff', strokeWidth: 2, fill: 'var(--color-history)' }}
                                                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: 'var(--color-history)' }}
                                                                    connectNulls
                                                                />

                                                                {/* Demand Forecast */}
                                                                <Line
                                                                    yAxisId="demand"
                                                                    type="monotone"
                                                                    dataKey="forecast"
                                                                    stroke="var(--color-forecast)"
                                                                    strokeWidth={4}
                                                                    strokeDasharray="8 4"
                                                                    dot={false}
                                                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: 'var(--color-forecast)' }}
                                                                    connectNulls
                                                                />

                                                                {/* Price History */}
                                                                <Line
                                                                    yAxisId="price"
                                                                    type="monotone"
                                                                    dataKey="priceHistory"
                                                                    stroke="var(--color-priceHistory)"
                                                                    strokeWidth={2}
                                                                    dot={false}
                                                                    activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: 'var(--color-priceHistory)' }}
                                                                    connectNulls
                                                                />

                                                                {/* Price Forecast */}
                                                                <Line
                                                                    yAxisId="price"
                                                                    type="monotone"
                                                                    dataKey="priceForecast"
                                                                    stroke="var(--color-priceForecast)"
                                                                    strokeWidth={2}
                                                                    strokeDasharray="5 5"
                                                                    dot={false}
                                                                    activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: 'var(--color-priceForecast)' }}
                                                                    connectNulls
                                                                />
                                                            </ComposedChart>
                                                        </ChartContainer>
                                                    ) : (
                                                        <div className="h-[400px] w-full flex items-center justify-center text-slate-300 text-sm italic">
                                                            Fetching latest market signals...
                                                        </div>
                                                    )}
                    
                                                    {/* Forecast Error State */}
                                                    {!isForecastLoading && forecastError && !forecastData && forecastData.length === 0 && (
                                                        <div className="text-center py-16 border border-slate-100 bg-white rounded-[2.5rem] animate-in fade-in zoom-in duration-500 shadow-sm">
                                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                                                <AlertTriangle className="w-7 h-7 text-slate-400" />
                                                            </div>
                                                            <h4 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Intelligence Threshold Not Met</h4>
                                                            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto font-medium leading-relaxed px-6">
                                                                {forecastError}
                                                            </p>
                                                            <button 
                                                                onClick={() => {
                                                                    setForecastError(null);
                                                                    setForecastData(null);
                                                                    setSelectedForecastMedicine(null);
                                                                }}
                                                                className="mt-8 px-10 py-3.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all active:scale-95"
                                                            >
                                                                Clear and Search Again
                                                            </button>
                                                        </div>
                                                    )}
                    
                                                    {!isForecastLoading && !forecastData && !forecastError && (
                                                        <div className="text-center py-20 border border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                                                <Sparkles className="w-6 h-6 text-slate-300" />
                                                            </div>
                                                            <h4 className="font-bold text-slate-900 tracking-tight">Predictive Engine Ready</h4>
                                                            <p className="text-slate-400 text-xs mt-2 max-w-[240px] mx-auto font-medium leading-relaxed">
                                                                Search for a medicine to begin analyzing historical trends and market signals.
                                                            </p>
                                                        </div>
                                                    )}
                                                </MetricCardContent>
                                            </MetricCard>
                                        </div>
                                    </div>
                                )}

                                {!isForecastLoading && !forecastData && (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h4 className="font-bold text-slate-600">No Forecast Generated</h4>
                                        <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Search and select a medicine above to generate an AI-powered demand forecast.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Premium Sales Chart */}
                            <div className="lg:col-span-2">
                                <MetricCard className="w-full h-full shadow-lg border-slate-100 rounded-3xl overflow-hidden bg-white">
                                    <MetricCardContent className="flex flex-col items-stretch gap-5 p-8">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <h1 className="text-base text-muted-foreground font-medium mb-1">Total Revenue</h1>
                                                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3.5">
                                                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                                                        ₹{(data?.charts.salesByDay
                                                            .slice(selectedPeriod === '7d' ? -7 : selectedPeriod === '15d' ? -15 : selectedPeriod === '30d' ? -30 : 0)
                                                            .reduce((acc, curr) => acc + curr.revenue, 0) || 0).toLocaleString()}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span className="font-bold">+12.7%</span>
                                                        <span className="text-muted-foreground font-medium opacity-60">Vs last {selectedPeriod === 'all' ? 'month' : selectedPeriod}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                                <SelectTrigger
                                                    className="w-[140px] rounded-xl border-2 font-bold shadow-sm focus:ring-0 h-10"
                                                    style={{ color: theme.hex, borderColor: theme.hex, backgroundColor: theme.hex + '10' }}
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent align="end" className="rounded-xl border-slate-100 shadow-xl overflow-hidden">
                                                    <SelectItem value="7d" className="font-medium">Last 7 days</SelectItem>
                                                    <SelectItem value="15d" className="font-medium">Last 15 days</SelectItem>
                                                    <SelectItem value="30d" className="font-medium">Last 30 days</SelectItem>
                                                    <SelectItem value="all" className="font-medium">All Time</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grow">
                                            {(() => {
                                                const currentTrendData = data?.charts.salesByDay
                                                    .slice(selectedPeriod === '7d' ? -7 : selectedPeriod === '15d' ? -15 : selectedPeriod === '30d' ? -30 : 0) || [];

                                                if (currentTrendData.length === 0) {
                                                    return (
                                                        <div className="h-full flex flex-col items-center justify-center py-20">
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="flex flex-col items-center"
                                                            >
                                                                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 relative">
                                                                    <BarChart2 className="w-10 h-10 text-slate-300" />
                                                                    <div className="absolute top-0 right-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center -mr-1 -mt-1 border-2 border-white">
                                                                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                                                                    </div>
                                                                </div>
                                                                <h3 className="text-xl font-bold text-slate-400 tracking-tight">Analytics Awaiting Activity</h3>
                                                                <p className="text-sm text-slate-400 mt-2 max-w-[240px] text-center leading-relaxed font-medium">
                                                                    Start processing sales to unlock real-time revenue visualization and growth tracking.
                                                                </p>
                                                                <button
                                                                    onClick={() => setActiveTab('sale')}
                                                                    className={`mt-8 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all hover:translate-y-[-2px] hover:shadow-2xl active:scale-95 flex items-center gap-3 cursor-pointer`}
                                                                    style={{ backgroundColor: theme.hex }}
                                                                >
                                                                    <ShoppingCart className="w-4 h-4" /> Go to Register
                                                                </button>
                                                            </motion.div>
                                                        </div>
                                                    );
                                                }

                                                const revenues = currentTrendData.map(d => d.revenue);
                                                const highValue = revenues.length ? Math.max(...revenues) : 0;
                                                const lowValue = revenues.length ? Math.min(...revenues) : 0;
                                                const lastRevenue = revenues.length ? revenues[revenues.length - 1] : 0;
                                                const change = revenues.length > 1 ? Number(((Number(revenues[revenues.length - 1]) - Number(revenues[revenues.length - 2])) / (Number(revenues[revenues.length - 2]) || 1) * 100)).toFixed(1) : 0;

                                                const trendData = currentTrendData.map(d => ({
                                                    date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                                                    value: d.revenue,
                                                    fullDate: d.date
                                                }));

                                                const CustomTooltip = ({ active, payload }: any) => {
                                                    if (active && payload && payload.length) {
                                                        const d = payload[0].payload;
                                                        return (
                                                            <div className="bg-white/95 border-2 border-slate-100 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
                                                                <div className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-[0.1em]">{d.date}</div>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-xl font-black text-slate-900 tracking-tighter">₹{d.value.toLocaleString()}</div>
                                                                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${theme.text} ${theme.light} border-current`}>REVENUE</div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                };

                                                return (
                                                    <>
                                                        <div className="flex items-center justify-between flex-wrap gap-2.5 text-sm mb-6">
                                                            <div className="flex items-center gap-6">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-muted-foreground font-medium">Latest Sale:</span>
                                                                    <span className="font-bold text-slate-800">₹{lastRevenue.toLocaleString()}</span>
                                                                    <div className={`flex items-center gap-1 ${Number(change) >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-bold`}>
                                                                        {Number(change) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                                        <span>({Number(change) >= 0 ? '+' : ''}{change}%)</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-6 text-muted-foreground">
                                                                <span>
                                                                    High: <span className="text-sky-600 font-bold">₹{highValue.toLocaleString()}</span>
                                                                </span>
                                                                <span>
                                                                    Low: <span className="text-amber-600 font-bold">₹{lowValue.toLocaleString()}</span>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <ChartContainer
                                                            config={{ value: { label: 'Revenue', color: theme.hex } }}
                                                            className="h-96 w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
                                                        >
                                                            <ComposedChart
                                                                data={trendData}
                                                                margin={{ top: 20, right: 10, left: 5, bottom: 20 }}
                                                            >
                                                                <defs>
                                                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor={theme.hex} stopOpacity={0.15} />
                                                                        <stop offset="100%" stopColor={theme.hex} stopOpacity={0} />
                                                                    </linearGradient>
                                                                    <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                        <circle cx="10" cy="10" r="1" fill="var(--border)" fillOpacity="0.3" />
                                                                    </pattern>
                                                                    <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
                                                                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
                                                                    </filter>
                                                                    <filter id="lineShadow" x="-100%" y="-100%" width="300%" height="300%">
                                                                        <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor={`${theme.hex}44`} />
                                                                    </filter>
                                                                </defs>

                                                                <rect x="0" y="0" width="100%" height="100%" fill="url(#dotGrid)" style={{ pointerEvents: 'none' }} />

                                                                <CartesianGrid
                                                                    strokeDasharray="4 8"
                                                                    stroke="#f1f5f9"
                                                                    strokeOpacity={1}
                                                                    horizontal={true}
                                                                    vertical={false}
                                                                />

                                                                {trendData.length > 0 && (
                                                                    <ReferenceLine
                                                                        x={trendData[trendData.length - 1].date}
                                                                        stroke={theme.hex}
                                                                        strokeDasharray="4 4"
                                                                        strokeWidth={1.5}
                                                                    />
                                                                )}

                                                                <XAxis
                                                                    dataKey="date"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 800 }}
                                                                    tickMargin={15}
                                                                    interval="preserveStartEnd"
                                                                />

                                                                <YAxis
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 800 }}
                                                                    tickFormatter={(v) => `₹${Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + 'k' : v}`}
                                                                    tickMargin={15}
                                                                />

                                                                <ChartTooltip
                                                                    content={<CustomTooltip />}
                                                                    cursor={{ strokeDasharray: '4 4', stroke: '#cbd5e1', strokeOpacity: 0.8 }}
                                                                />

                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="value"
                                                                    stroke="none"
                                                                    fill="url(#areaGradient)"
                                                                    animationDuration={3000}
                                                                />

                                                                <Line
                                                                    type="monotone"
                                                                    dataKey="value"
                                                                    stroke={theme.hex}
                                                                    strokeWidth={4}
                                                                    filter="url(#lineShadow)"
                                                                    dot={(props) => {
                                                                        const { cx, cy, index } = props;
                                                                        const revenues = trendData.map(d => d.value);
                                                                        const high = Math.max(...revenues);
                                                                        const low = Math.min(...revenues);
                                                                        const val = trendData[index].value;

                                                                        if (index === 0 || index === trendData.length - 1 || val === high || (val === low && low !== high)) {
                                                                            return (
                                                                                <circle
                                                                                    key={`dot-${index}`}
                                                                                    cx={cx}
                                                                                    cy={cy}
                                                                                    r={6}
                                                                                    fill={theme.hex}
                                                                                    stroke="white"
                                                                                    strokeWidth={3}
                                                                                    filter="url(#dotShadow)"
                                                                                />
                                                                            );
                                                                        }
                                                                        return <g key={`dot-${index}`} />;
                                                                    }}
                                                                    activeDot={{
                                                                        r: 8,
                                                                        fill: theme.hex,
                                                                        stroke: 'white',
                                                                        strokeWidth: 4,
                                                                        filter: 'url(#dotShadow)',
                                                                    }}
                                                                />
                                                            </ComposedChart>
                                                        </ChartContainer>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </MetricCardContent>
                                </MetricCard>
                            </div>

                            {/* Recent Activity */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex flex-col relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-64 h-64 opacity-[0.03] -mr-12 -mt-12 rounded-full ${theme.primary} blur-3xl`} />

                                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-2xl ${theme.primary} flex items-center justify-center shadow-lg ${theme.shadow}`}>
                                        <Activity className="w-5 h-5 text-white" />
                                    </div>
                                    Network Pulse
                                </h3>

                                <div className="relative pl-2 space-y-5 flex-1 overflow-visible">
                                    <div className="absolute left-[27px] top-6 bottom-6 w-[2px] bg-slate-50"></div>

                                    {(data?.lists.activity || []).slice(0, isActivityExpanded ? 10 : 5).map((log, i) => {
                                        const config = getActivityConfig(log.action);
                                        return (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="relative flex items-center gap-4 group z-10"
                                            >
                                                <div className={`relative w-14 h-14 rounded-[1.25rem] flex items-center justify-center ${config.bg} ${config.color} border-4 border-white shadow-xl group-hover:scale-110 transition-transform duration-500 ease-out`}>
                                                    <config.icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 leading-tight uppercase tracking-[0.15em] mb-1">
                                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                    </p>
                                                    <p className="text-sm font-black text-slate-800 leading-snug group-hover:text-slate-900 transition-colors">
                                                        {log.action.replace(/_/g, " ")}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {(!data?.lists.activity || data.lists.activity.length === 0) && (
                                        <EmptyState 
                                            icon={Activity}
                                            title="System Quiet"
                                            description="No recent activities recorded. Start exploring your dashboard to see logs here."
                                        />
                                    )}
                                </div>

                                {data?.lists.activity && data.lists.activity.length > 5 && (
                                    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center">
                                        <button
                                            onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                                            className="px-8 py-3 bg-slate-900 hover:bg-black rounded-full text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-3"
                                        >
                                            {isActivityExpanded ? 'Compact View' : 'Full Log'} {isActivityExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </>
                )}

                {/* --- CONNECTED SUPPLIERS TAB --- */}
                {activeTab === 'suppliers' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <Users className={`w-6 h-6 ${theme.text}`} />
                                        My Network
                                    </h2>
                                    <p className="text-sm text-slate-500">Manage your connected suppliers.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full max-w-sm">
                                    <div className="relative w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search directory..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">

                                {/* Recommended/Search Suppliers */}
                                <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            {searchQuery ? (
                                                <><Search className="w-5 h-5 text-indigo-500" /> Search Results</>
                                            ) : (
                                                <><Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-100" /> Recommended Suppliers</>
                                            )}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {isDirectoryLoading ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Skeleton className="w-12 h-12 rounded-xl" />
                                                            <div>
                                                                <Skeleton className="h-4 w-24 mb-2" />
                                                                <Skeleton className="h-3 w-16" />
                                                            </div>
                                                        </div>
                                                        <Skeleton className="h-8 w-20 rounded-lg" />
                                                    </div>
                                                    <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Skeleton className="h-3 w-10 mb-1" />
                                                            <Skeleton className="h-3 w-full" />
                                                        </div>
                                                        <div>
                                                            <Skeleton className="h-3 w-10 mb-1" />
                                                            <Skeleton className="h-3 w-20" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            (() => {
                                                const filtered = directorySuppliers
                                                    .filter(s => s.connectionStatus === 'NONE' && !data?.lists?.suppliers?.some(conn => conn.id === s.id));

                                                if (filtered.length === 0) {
                                                    return (
                                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                                {searchQuery ? <Search className="w-5 h-5 text-slate-400" /> : <Sparkles className="w-5 h-5 text-slate-400" />}
                                                            </div>
                                                            <p className="text-slate-600 font-medium">{searchQuery ? 'No suppliers found' : 'No new recommendations'}</p>
                                                            <p className="text-slate-400 text-sm mt-1">{searchQuery ? 'Try adjusting your search terms' : 'You have connected with all available suppliers'}</p>
                                                        </div>
                                                    );
                                                }

                                                return filtered
                                                    .slice(0, searchQuery ? 100 : 5)
                                                    .map((supplier) => (
                                                        <div key={supplier.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative overflow-hidden">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600 shadow-sm">
                                                                        {supplier.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-slate-800">{supplier.name}</div>
                                                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                                                            <Users className="w-3 h-3" /> Supplier
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleConnectRequest(supplier.id)}
                                                                    disabled={connectingSupplierId === supplier.id}
                                                                    className="h-8 px-3 text-xs font-bold !bg-black !text-white hover:!bg-neutral-800 border-none relative z-10"
                                                                >
                                                                    {connectingSupplierId === supplier.id ? (
                                                                        <>
                                                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                            Connecting...
                                                                        </>
                                                                    ) : (
                                                                        "Connect"
                                                                    )}
                                                                </Button>
                                                            </div>

                                                            <div className="mt-4 pt-3 border-t border-slate-50 grid grid-cols-2 gap-2">
                                                                <div className="max-w-full overflow-hidden">
                                                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Email</div>
                                                                    <div className="text-xs font-medium text-slate-700 truncate" title={supplier.email || supplier.user?.email}>{supplier.email || supplier.user?.email}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Role</div>
                                                                    <div className="text-xs font-medium text-slate-700">Global Supplier</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ));
                                            })()
                                        )}
                                    </div>
                                </div>


                                {(supplierRequests.length > 0) && (
                                    <div className="mb-8">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-amber-500" />
                                                Pending Requests
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {supplierRequests.map((req, index) => (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    key={req.id}
                                                    className="bg-white rounded-3xl p-1 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                                >
                                                    <div className="bg-slate-50/50 rounded-[20px] p-5 h-full flex flex-col relative overflow-hidden">
                                                        {/* Header */}
                                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-[2px] shadow-lg">
                                                                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-bold text-slate-700">
                                                                        {req.supplier?.name?.charAt(0).toUpperCase() || "S"}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{req.supplier?.name || "Unknown Supplier"}</h3>
                                                                    <div className="flex items-center gap-1.5 mt-1">
                                                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                                        <span className="text-xs font-medium text-amber-600">Pending Request</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Message Box */}
                                                        <div className="mb-6 relative z-10 bg-white p-4 rounded-xl border border-slate-100 shadow-sm min-h-[80px]">
                                                            {req.message ? (
                                                                <>
                                                                    <div className="absolute -top-2 -left-1">
                                                                        <div className="w-4 h-4 text-amber-200 fill-current opacity-50">
                                                                            <svg viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.896 14.389 16.03 15.152 15.399C15.915 14.768 17.079 14.453 18.665 14.453L23 14.453L23 2.99999L11.517 3L11.517 14.453L12.871 14.453C13.882 14.453 14.389 14.908 14.389 15.823L14.389 21L14.017 21ZM5.389 21L5.389 18C5.389 16.896 5.761 16.03 6.524 15.399C7.287 14.768 8.451 14.453 10.037 14.453L15.372 14.453L15.372 2.99999L1 3L1 14.453L2.354 14.453C3.365 14.453 3.872 14.908 3.872 15.823L3.872 21L5.389 21Z" /></svg>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-slate-600 italic leading-relaxed pl-2 relative z-10 line-clamp-3">
                                                                        "{req.message}"
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-xs text-slate-300 italic">
                                                                    No message included
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="mt-auto pt-2 grid grid-cols-2 gap-3 relative z-10">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handleRejectRequest(req.id)}
                                                                className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-10 rounded-xl font-semibold transition-all"
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleAcceptRequest(req.id)}
                                                                className="bg-slate-900 hover:bg-black text-white border-none shadow-lg shadow-slate-900/20 h-10 rounded-xl font-semibold transition-all"
                                                            >
                                                                Accept
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Link className="w-5 h-5 text-slate-500" />
                                        Connected Network
                                    </h3>
                                </div>

                                {(data?.lists?.suppliers && data.lists.suppliers.length > 0) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {data?.lists.suppliers && data.lists.suppliers.map((supplier, index) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: (supplierRequests.length + index) * 0.05 }}
                                                key={supplier.id}
                                                className="bg-white rounded-3xl p-1 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                            >
                                                <div className="bg-slate-50/50 rounded-[20px] p-5 h-full flex flex-col relative overflow-hidden">
                                                    {/* Decorative Background */}
                                                    <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${theme.light} opacity-0 group-hover:opacity-20 transition-opacity blur-2xl`} />

                                                    {/* Header */}
                                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-14 h-14 rounded-2xl ${theme.gradient} p-[2px] shadow-lg`}>
                                                                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-bold text-slate-700">
                                                                    {supplier.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{supplier.name}</h3>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                    <span className="text-xs font-medium text-emerald-600">Active Supplier</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <i
                                                            className="h-8 w-8 flex items-center justify-center cursor-pointer text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDisconnectSupplier(supplier.id);
                                                            }}
                                                            title="Disconnect Supplier"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </i>
                                                    </div>

                                                    {/* Contact Info */}
                                                    <div className="space-y-3 mb-6 relative z-10 bg-white/60 p-3 rounded-xl border border-slate-100/50 backdrop-blur-sm">
                                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                                <Mail className="w-4 h-4" />
                                                            </div>
                                                            <span className="truncate flex-1 font-medium">{supplier.email || supplier.user?.email || "No email"}</span>
                                                        </div>
                                                        {(supplier.phone || supplier.contactName) && (
                                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                                    <Phone className="w-4 h-4" />
                                                                </div>
                                                                <span className="truncate flex-1 font-medium">
                                                                    {supplier.contactName && <span className="text-slate-900">{supplier.contactName}</span>}
                                                                    {supplier.contactName && supplier.phone && <span className="mx-1 text-slate-300">|</span>}
                                                                    {supplier.phone}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="mt-auto pt-4 relative z-10">
                                                        <i
                                                            className="w-full h-11 rounded-xl !bg-slate-900 hover:opacity-90 text-white shadow-lg shadow-slate-900/20 border-none group/btn flex items-center justify-center gap-2 font-semibold cursor-pointer"
                                                            onClick={() => {
                                                                setReorderSupplierId(supplier.id);
                                                                setActiveTab('reorder');
                                                            }}
                                                        >
                                                            <Zap className="w-4 h-4 fill-white" />
                                                            <span>Quick Reorder</span>
                                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform opacity-60" />
                                                        </i>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState 
                                        icon={Users}
                                        title="No Connected Suppliers"
                                        description="You haven't connected with any suppliers yet. Start by exploring the directory to build your network."
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- SENT REORDERS TAB --- */}
                {activeTab === 'sent_reorders' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <Package className={`w-6 h-6 ${theme.text}`} />
                                        Sent Reorders
                                    </h2>
                                    <p className="text-sm text-slate-500">Track the status of your stock replenishment requests.</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
                                {(() => {
                                    const filteredReorders = myRequests
                                        .filter(r => r.payload?.type === 'REORDER')
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                                    if (filteredReorders.length > 0) {
                                        return (
                                            <div className="grid grid-cols-1 gap-4">
                                                {filteredReorders.map(req => {
                                                    const supplierName = data?.lists?.suppliers?.find(s => s.id === req.supplierId)?.name || "Unknown Supplier";
                                                    const statusConfig = req.status === 'ACCEPTED' ? { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle } :
                                                        req.status === 'REJECTED' ? { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: X } :
                                                            { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: Activity };
                                                    const StatusIcon = statusConfig.icon;

                                                    return (
                                                        <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                                                            <div className="flex items-center gap-5 flex-1">
                                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${statusConfig.bg} ${statusConfig.text}`}>
                                                                    <StatusIcon className="w-7 h-7" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1.5 ">
                                                                        <h4 className="font-bold text-slate-800 text-lg truncate flex items-center gap-2">
                                                                            Order #{req.id.slice(0, 8).toUpperCase()}
                                                                        </h4>
                                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shrink-0 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                                            {req.status === 'PENDING' && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse opacity-60" />}
                                                                            {req.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-slate-500 truncate">
                                                                        <span className="flex items-center gap-1.5 truncate">
                                                                            <Store className="w-3.5 h-3.5 text-slate-400" />
                                                                            To: <span className="font-medium text-slate-700 truncate">{supplierName}</span>
                                                                        </span>
                                                                        <span className="hidden md:flex items-center gap-1.5 border-l border-slate-200 pl-4 shrink-0">
                                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Items</span>
                                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                                        <ClipboardList className="w-4 h-4 text-slate-500" />
                                                                        <span className="font-bold text-slate-800">{req.payload?.items?.length || 0}</span>
                                                                    </div>
                                                                </div>

                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedReorder(req);
                                                                        setShowReorderDetails(true);
                                                                    }}
                                                                    className="!bg-black cursor-pointer !text-white hover:!bg-slate-800 shadow-md shadow-black/10 border-none rounded-xl px-5 h-10 font-semibold gap-2 transition-all"
                                                                >
                                                                    Details <ChevronDown className="w-4 h-4 opacity-60" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    }

                                    return (
                                        <EmptyState 
                                            icon={Package}
                                            title="No Reorders Yet"
                                            description="Your sent reorder requests will appear here once you place orders with suppliers."
                                            action={
                                                <Button
                                                    onClick={() => setActiveTab('reorder')}
                                                    className="!bg-slate-900 text-white hover:opacity-90 shadow-lg shadow-slate-900/20 border-none font-bold rounded-xl pointer-events-auto"
                                                >
                                                    Create New Reorder
                                                </Button>
                                            }
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- NEW REORDER TAB --- */}
                {activeTab === 'reorder' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]"
                    >
                        {/* Left: Inventory Catalog */}
                        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
                            <div className="p-5 border-b border-slate-100 bg-white z-10 flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Catalog</h2>
                                        <p className="text-sm text-slate-500">Select items to reorder from suppliers</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleSmartFill}
                                        disabled={isAiLoading}
                                        className="hidden cursor-pointer md:flex gap-2 !bg-black !text-white hover:!bg-slate-800 border-transparent relative overflow-hidden group transition-all"
                                    >
                                        {isAiLoading ? (
                                            <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                                        )}
                                        {isAiLoading ? "Analyzing..." : "AI Auto-Fill"}
                                    </Button>
                                </div>
                                <div className="flex gap-2">


                                    <div className="relative">
                                        <button className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl border transition-all cursor-pointer !bg-white !text-black ${inventoryFilter !== 'all' ? 'border-2 border-black' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <Filter className="w-4 h-4" />
                                        </button>
                                        <select
                                            value={inventoryFilter}
                                            onChange={(e) => setInventoryFilter(e.target.value as any)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        >
                                            <option value="all">All Items</option>
                                            <option value="low_stock">Low Stock Only</option>
                                            <option value="healthy">Healthy Stock</option>
                                            <option value="expired">Expired (Returns)</option>
                                        </select>
                                    </div>
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search inventory..."
                                            value={reorderSearchQuery}
                                            onChange={(e) => setReorderSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                                        />
                                        {reorderSearchQuery && (
                                            <button onClick={() => setReorderSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                <div className="grid grid-cols-1 gap-2">
                                    {isReorderLoading ? (
                                        [...Array(6)].map((_, i) => (
                                            <div key={i} className="flex items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 gap-4">
                                                <Skeleton className="w-10 h-10 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                                <Skeleton className="h-8 w-16" />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {inventoryList.filter(med => {
                                                const matchesSearch = med.brandName.toLowerCase().includes(reorderSearchQuery.toLowerCase()) ||
                                                    med.genericName.toLowerCase().includes(reorderSearchQuery.toLowerCase());
                                                return matchesSearch;
                                            }).length === 0 && (
                                                    <EmptyState 
                                                        icon={Search}
                                                        title="No Items Found"
                                                        description={`We couldn't find any items matching "${reorderSearchQuery}".`}
                                                    />
                                                )}
                                            {inventoryList.filter(med => {
                                                const matchesSearch = med.brandName.toLowerCase().includes(reorderSearchQuery.toLowerCase()) ||
                                                    med.genericName.toLowerCase().includes(reorderSearchQuery.toLowerCase());
                                                return matchesSearch;
                                            }).map((med) => {
                                                const inCart = cart.get(med.id) || 0;
                                                return (
                                                    <div
                                                        key={med.id}
                                                        className="group flex items-center p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${med.totalQty === 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 mr-4">
                                                            <h4 className="font-bold text-slate-800 truncate">{med.brandName}</h4>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <span className="truncate">{med.genericName}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                <span>{med.strength}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-right mr-2 hidden sm:block">
                                                                <div className={`text-xs font-bold ${med.totalQty < 10 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                                    {med.totalQty} Units
                                                                </div>
                                                                {med.expiringSoon && <span className="text-[10px] text-amber-600 font-bold block">Expiring Soon</span>}
                                                            </div>

                                                            {inCart > 0 ? (
                                                                <div className="flex items-center !bg-black rounded-lg p-1 shadow-md shadow-black/10">
                                                                    <i
                                                                        onClick={() => handleAddToCart(med.id, inCart - 1)}
                                                                        className="w-7 h-7 flex cursor-pointer items-center justify-center !text-white hover:!text-white rounded-md hover:bg-white/10 transition-colors"
                                                                    >
                                                                        -
                                                                    </i>
                                                                    <span className="w-8 text-center font-bold text-sm !text-white">{inCart}</span>
                                                                    <i
                                                                        onClick={() => handleAddToCart(med.id, inCart + 1)}
                                                                        className="w-7 h-7 cursor-pointer flex items-center justify-center !text-white hover:!text-white rounded-md hover:bg-white/10 transition-colors"
                                                                    >
                                                                        +
                                                                    </i>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleAddToCart(med.id, 1)}
                                                                    className="!bg-black border border-transparent !text-white hover:!bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-black/10"
                                                                >
                                                                    Add
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div className="w-full md:w-[400px] flex flex-col gap-4">
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 flex-1 flex flex-col overflow-hidden">
                                <div className="p-5 border-b border-slate-100 bg-slate-50/80">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-slate-700" />
                                        Reorder Summary
                                    </h3>
                                </div>

                                <div className="p-5 flex-1 overflow-hidden bg-white flex flex-col gap-5">
                                    {/* Supplier Select */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</label>
                                            <span className="text-[10px] items-center gap-1 flex text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                                                {data?.lists?.suppliers?.length || 0} Available
                                            </span>
                                        </div>
                                        <Select value={reorderSupplierId} onValueChange={setReorderSupplierId} disabled={!data?.lists?.suppliers?.length}>
                                            <SelectTrigger className="w-full !bg-slate-900 border-none h-12 rounded-xl !text-white shadow-lg shadow-slate-900/10 focus:ring-0">
                                                <span className="text-white font-bold truncate">
                                                    {reorderSupplierId
                                                        ? data?.lists?.suppliers?.find(s => s.id === reorderSupplierId)?.name
                                                        : <span className="text-slate-400 font-normal">Select a supplier...</span>
                                                    }
                                                </span>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white rounded-xl border-slate-200 shadow-xl p-1 z-50">
                                                {data?.lists?.suppliers?.map((s) => (
                                                    <SelectItem key={s.id} value={s.id} textValue={s.name} className="rounded-lg cursor-pointer focus:bg-slate-50 py-3">
                                                        <div className="font-bold text-slate-800">{s.name}</div>
                                                        <div className="text-xs text-slate-400">{s.email}</div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {!data?.lists?.suppliers?.length && (
                                            <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg flex items-center gap-2 font-medium">
                                                <X className="w-3 h-3" /> No suppliers connected
                                            </div>
                                        )}
                                    </div>

                                    {/* Cart Items */}
                                    <div className="flex-auto bg-slate-50 rounded-2xl p-4 border border-slate-100 relative min-h-[120px] overflow-y-auto custom-scrollbar">
                                        <div className="absolute top-0 right-0 p-2 opacity-5">
                                            <ClipboardList className="w-24 h-24" />
                                        </div>
                                        {cart.size === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 min-h-[100px]">
                                                <span className="text-sm font-medium">No items selected</span>
                                            </div>
                                        ) : (
                                            <ul className="space-y-3 relative z-10">
                                                {Array.from(cart.entries()).map(([id, qty]) => {
                                                    const m = inventoryList.find(x => x.id === id) || suggestedItems.find(x => x.id === id);
                                                    return (
                                                        <li key={id} className="flex justify-between items-start text-sm">
                                                            <div className="flex-1 pr-2">
                                                                <span className="font-bold text-slate-700 block">{m?.brandName}</span>
                                                                <span className="text-xs text-slate-400">{m?.genericName}</span>
                                                            </div>
                                                            <div className="bg-white px-2 py-1 rounded border border-slate-200 font-mono font-bold text-slate-800 text-xs shadow-sm">
                                                                x{qty}
                                                            </div>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        )}
                                    </div>

                                    {/* Note Input */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Note to Supplier</label>
                                        <textarea
                                            className="w-full p-3 text-sm bg-slate-50 border border-slate-100 rounded-xl resize-none focus:outline-none focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                                            rows={2}
                                            placeholder="Optional delivery instructions..."
                                            value={reorderNote}
                                            onChange={e => setReorderNote(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                                    <Button
                                        className="w-full h-14 cursor-pointer !bg-slate-900 text-white hover:opacity-95 shadow-xl shadow-slate-900/30 font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                                        disabled={cart.size === 0 || !reorderSupplierId || isSendingReorder}
                                        onClick={handleReorderClick}
                                    >
                                        {isSendingReorder ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {isSendingReorder ? "Sending..." : `Send Request (${cart.size} Items)`}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* --- RETURNS TAB --- */}
                {activeTab === 'return' && (
                    <div className="flex flex-col gap-6 h-full pb-8">
                        {/* Return Sub-Tabs */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 p-1 backdrop-blur-md rounded-2xl border border-slate-200 w-fit shadow-sm">
                                {[
                                    { id: 'new', label: 'Process New', icon: RefreshCw },
                                    { id: 'pending', label: 'Pending Returns', icon: Clock },
                                    { id: 'history', label: 'Return History', icon: HistoryIcon }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setReturnSubTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${returnSubTab === tab.id
                                            ? "!bg-black !text-white shadow-lg !shadow-black/20 scale-105"
                                            : "!bg-black/90 !text-white/70 hover:!bg-black hover:!text-white"
                                            }`}
                                    >
                                        <tab.icon className={`w-4 h-4 ${returnSubTab === tab.id ? 'animate-spin-slow' : ''}`} />
                                        {tab.label}
                                        {tab.id === 'pending' && myRequests.filter(r => r.payload?.type === 'RETURN' && r.status === 'PENDING').length > 0 && (
                                            <span className="ml-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px]">
                                                {myRequests.filter(r => r.payload?.type === 'RETURN' && r.status === 'PENDING').length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {returnSubTab === 'new' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col md:flex-row gap-6 h-[calc(100vh-220px)] min-h-[500px]"
                            >
                                {/* Left: Expiring Inventory */}
                                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
                                    <div className="p-5 border-b border-slate-100 bg-white z-10 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-xl font-bold text-black tracking-tight flex items-center gap-2">
                                                    <RefreshCw className="w-5 h-5" /> Returns Management
                                                </h2>
                                                <p className="text-sm text-slate-500">Expiring or damaged items to return to suppliers</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={handleSmartFill}
                                                disabled={isAiLoading}
                                                className="cursor-pointer gap-2 !bg-black !text-white"
                                            >
                                                <Sparkles className="w-4 h-4" /> Refresh Suggestions
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                        <div className="grid grid-cols-1 gap-2">
                                            {isReorderLoading ? (
                                                [1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center p-3 rounded-2xl border border-slate-100 bg-white opacity-50 animate-pulse">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-100 mr-4" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-4 bg-slate-100 rounded w-1/3" />
                                                            <div className="h-2 bg-slate-50 rounded w-1/2" />
                                                        </div>
                                                        <div className="w-20 h-8 bg-slate-50 rounded-lg" />
                                                    </div>
                                                ))
                                            ) : returnList.length === 0 ? (
                                                <EmptyState 
                                                    icon={CheckCircle}
                                                    title="Inventory Healthy"
                                                    description="No expiring items found in your inventory. Good job with the stock management!"
                                                />
                                            ) : (
                                                returnList.map((item) => {
                                                    const key = `${item.id}_${item.batchNumber}`;
                                                    const inCart = returnCart.get(key) || 0;
                                                    return (
                                                        <div key={key} className="group flex items-center p-3 rounded-2xl border border-red-50 bg-white hover:border-red-200 hover:shadow-sm transition-all duration-200">
                                                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mr-4">
                                                                <Clock className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 mr-4">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-bold text-slate-800 truncate">{item.brandName}</h4>
                                                                    {item.id.includes('mock') ? (
                                                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 rounded-sm uppercase tracking-tight">Sample</span>
                                                                    ) : (
                                                                        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 rounded-sm uppercase tracking-tight border border-indigo-100/50">AI Identified</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                                    <span className="font-mono bg-slate-50 px-1 rounded text-[10px]">#{item.batchNumber}</span>
                                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${item.reason === 'Expired' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                        {item.reason}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400">Est. Refund: ₹{item.purchasePrice || 0}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right mr-2 hidden sm:block">
                                                                    <div className="text-xs font-bold text-slate-500">{item.suggestedQty} Units</div>
                                                                </div>
                                                                {inCart > 0 ? (
                                                                    <div className="flex items-center !bg-red-600 rounded-lg p-1 shadow-md shadow-red-600/20">
                                                                        <i onClick={() => handleReturnAddToCart(key, inCart - 1)} className="w-7 h-7 flex cursor-pointer items-center justify-center !text-white hover:bg-white/10 rounded-md">-</i>
                                                                        <span className="w-8 text-center font-bold text-sm !text-white">{inCart}</span>
                                                                        <i onClick={() => handleReturnAddToCart(key, inCart + 1)} className="w-7 h-7 flex cursor-pointer items-center justify-center !text-white hover:bg-white/10 rounded-md">+</i>
                                                                    </div>
                                                                ) : (
                                                                    <button onClick={() => handleReturnAddToCart(key, item.suggestedQty)} className="!bg-red-600 border-transparent cursor-pointer !text-white hover:!bg-red-700 px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-red-600/10">
                                                                        Return
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Return Summary */}
                                <div className="w-full md:w-[400px] flex flex-col gap-4">
                                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 flex-1 flex flex-col overflow-hidden">
                                        <div className="p-5 border-b border-slate-100 bg-black">
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <RefreshCw className="w-5 h-5 text-white" /> Return Summary
                                            </h3>
                                        </div>
                                        <div className="p-5 flex-1 overflow-hidden bg-white flex flex-col gap-5">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Select Supplier</label>
                                                <Select value={returnSupplierId} onValueChange={setReturnSupplierId} disabled={!data?.lists?.suppliers?.length}>
                                                    <SelectTrigger className="w-full !bg-slate-900 border-none h-12 rounded-xl !text-white shadow-lg focus:ring-0">
                                                        <span className="text-white font-bold truncate">
                                                            {returnSupplierId ? data?.lists?.suppliers?.find(s => s.id === returnSupplierId)?.name : "Select a supplier..."}
                                                        </span>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white rounded-xl border-slate-200 shadow-xl p-1 z-50">
                                                        {data?.lists?.suppliers?.map((s) => (
                                                            <SelectItem key={s.id} value={s.id} textValue={s.name} className="rounded-lg cursor-pointer py-3">
                                                                <div className="font-bold text-slate-800">{s.name}</div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex-auto bg-slate-50 rounded-2xl p-4 border border-slate-100 relative min-h-[120px] overflow-y-auto custom-scrollbar">
                                                {returnCart.size === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                                        <span className="text-sm font-medium">No items selected</span>
                                                    </div>
                                                ) : (
                                                    <ul className="space-y-3">
                                                        {Array.from(returnCart.entries()).map(([key, qty]) => {
                                                            const [medId, batch] = key.split('_');
                                                            const item = returnList.find(r => r.id === medId && r.batchNumber === batch);
                                                            return (
                                                                <li key={key} className="flex justify-between items-start text-sm">
                                                                    <div className="flex-1 pr-2">
                                                                        <span className="font-bold text-slate-700 block">{item?.brandName}</span>
                                                                        <span className="text-xs text-slate-400">Batch: {batch}</span>
                                                                    </div>
                                                                    <div className="bg-white px-2 py-1 rounded border border-slate-200 font-mono font-bold text-slate-800 text-xs shadow-sm">
                                                                        x{qty}
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Note</label>
                                                <textarea
                                                    className="w-full p-3 text-sm bg-slate-50 border border-slate-100 rounded-xl resize-none focus:outline-none focus:bg-white focus:border-slate-300 transition-all font-medium"
                                                    rows={2}
                                                    placeholder="Reason for return..."
                                                    value={returnNote}
                                                    onChange={e => setReturnNote(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                                            <button
                                                className="w-full h-14 cursor-pointer !bg-black text-white  font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                                                disabled={returnCart.size === 0 || !returnSupplierId || isSendingReturn}
                                                onClick={executeReturn}
                                            >
                                                {isSendingReturn ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <ArrowRight className="w-4 h-4" />
                                                )}
                                                {isSendingReturn ? "Sending..." : "Submit Return Request"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        {returnSubTab === 'pending' ? <Clock className="w-5 h-5 text-amber-500" /> : <HistoryIcon className="w-5 h-5 text-indigo-500" />}
                                        {returnSubTab === 'pending' ? 'Pending Return Requests' : 'Return Request History'}
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50">
                                    {(() => {
                                        const filtered = myRequests.filter(r => {
                                            const isReturnType = r.payload?.type === 'RETURN';
                                            if (!isReturnType) return false;
                                            return returnSubTab === 'pending' ? r.status === 'PENDING' : r.status !== 'PENDING';
                                        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                                        if (filtered.length === 0) {
                                            return (
                                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                                    <div className="w-16 h-16 bg-slate-200/50 rounded-full flex items-center justify-center mb-4">
                                                        <Package className="w-8 h-8 opacity-30" />
                                                    </div>
                                                    <p className="font-medium text-slate-500">No {returnSubTab} returns found</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="grid grid-cols-1 gap-4">
                                                {filtered.map(req => {
                                                    const supplier = data?.lists?.suppliers?.find(s => s.id === req.supplierId);
                                                    const statusConfig = req.status === 'ACCEPTED' ? { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' } :
                                                        req.status === 'REJECTED' ? { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' } :
                                                            req.status === 'FULFILLED' ? { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' } :
                                                                { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };

                                                    return (
                                                        <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                                                            <div className="flex items-center gap-5 flex-1">
                                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${statusConfig.bg} ${statusConfig.text}`}>
                                                                    <RefreshCw className="w-7 h-7" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-3 mb-1.5 ">
                                                                        <h4 className="font-bold text-slate-800 text-lg truncate flex items-center gap-2">
                                                                            Return #{req.id.slice(0, 8).toUpperCase()}
                                                                        </h4>
                                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                                            {req.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                                        <span className="flex items-center gap-1.5">
                                                                            <Store className="w-3.5 h-3.5 text-slate-400" />
                                                                            <span className="font-medium text-slate-700">{supplier?.name || "Unknown Supplier"}</span>
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                            {new Date(req.createdAt).toLocaleDateString()}
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                                                                            <Package className="w-3.5 h-3.5 text-slate-400" />
                                                                            {req.payload?.items?.length || 0} Items
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedReorder(req);
                                                                    setShowReorderDetails(true);
                                                                }}
                                                                className="!border-slate-200 cursor-pointer !bg-white hover:!bg-slate-50 !text-slate-600 px-5 h-10 font-bold rounded-xl gap-2 transition-all"
                                                            >
                                                                View Details <ChevronDown className="w-4 h-4 opacity-40" />
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                {activeTab === 'sale' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]"
                    >
                        {/* Left: Product Catalog */}
                        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
                            <div className="p-5 border-b border-slate-100 bg-white z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product Catalog</h2>
                                        <p className="text-sm text-slate-500">Select items to add to the register</p>
                                    </div>
                                    <div className="bg-slate-100 p-2 rounded-xl">
                                        <Search className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <button
                                            className={`h-[46px] w-[46px] flex items-center justify-center rounded-xl border transition-all cursor-pointer !bg-white !text-black ${posInventoryFilter !== 'all' ? 'border-2 border-black' : 'border-slate-200 hover:border-slate-300'}`}
                                            title={`Filter: ${posInventoryFilter === 'all' ? 'All' : posInventoryFilter === 'out_of_stock' ? 'Out of Stock' : 'Available'}`}
                                        >
                                            <Filter className="w-4 h-4" />
                                        </button>
                                        <select
                                            value={posInventoryFilter}
                                            onChange={(e) => setPosInventoryFilter(e.target.value as any)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        >
                                            <option value="all">All Items</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                            <option value="in_stock">Available</option>
                                        </select>
                                    </div>

                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by brand or generic name..."
                                            value={posQuery}
                                            onChange={(e) => setPosQuery(e.target.value)}
                                            autoFocus
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 font-medium"
                                        />
                                        {posQuery && (
                                            <button onClick={() => setPosQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                <div className="grid grid-cols-1 gap-2">
                                    {isPosLoading ? (
                                        [...Array(6)].map((_, i) => (
                                            <div key={i} className="flex items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 gap-4">
                                                <Skeleton className="w-10 h-10 rounded-lg" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                                <Skeleton className="h-8 w-16" />
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            {posResults.filter((med: any) => {
                                                const totalStock = med.totalStock || 0;
                                                if (posInventoryFilter === 'out_of_stock') return totalStock === 0;
                                                if (posInventoryFilter === 'in_stock') return totalStock > 0;
                                                return true;
                                            }).length === 0 && (
                                                    <EmptyState 
                                                        icon={Search}
                                                        title="No Products Found"
                                                        description="Try searching for a different medicine or adjust your filters."
                                                    />
                                                )}
                                            {posResults.filter((med: any) => {
                                                const totalStock = med.totalStock || 0;
                                                if (posInventoryFilter === 'out_of_stock') return totalStock === 0;
                                                if (posInventoryFilter === 'in_stock') return totalStock > 0;
                                                return true;
                                            }).map((med: any) => {
                                                const totalStock = med.totalStock || 0;
                                                const cartItem = posCart.get(med.id);
                                                const inCart = cartItem ? cartItem.qty : 0;
                                                const hasSubstitutes = med.substitutes && med.substitutes.length > 0;

                                                return (
                                                    <div key={med.id} className="flex flex-col gap-1">
                                                        <div
                                                            className={`group flex items-center p-3 rounded-2xl border transition-all duration-200 ${totalStock > 0 ? 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm' : 'bg-slate-50 border-slate-100'}`}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${totalStock > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400 opacity-60'}`}>
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 mr-4">
                                                                <h4 className="font-bold text-slate-800 truncate">{med.brandName}</h4>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                    <span className="truncate">{med.genericName}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                    <span>{med.strength}</span>
                                                                </div>
                                                            </div>

                                                            {totalStock > 0 ? (
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-right mr-2 hidden sm:block">
                                                                        <div className={`text-xs font-bold ${totalStock - inCart < 10 ? 'text-amber-600' : 'text-slate-500'}`}>
                                                                            {totalStock - inCart} in stock
                                                                        </div>
                                                                    </div>
                                                                    {inCart > 0 ? (
                                                                        <div className="flex items-center !bg-black rounded-lg p-1 shadow-md shadow-black/10">
                                                                            <i
                                                                                onClick={() => handlePOSAddToCart(med, inCart - 1)}
                                                                                className="w-7 h-7 flex cursor-pointer items-center justify-center !text-white hover:!text-white rounded-md hover:bg-white/10 transition-colors"
                                                                            >
                                                                                -
                                                                            </i>
                                                                            <span className="w-8 text-center font-bold text-sm !text-white">{inCart}</span>
                                                                            <i
                                                                                onClick={() => handlePOSAddToCart(med, inCart + 1)}
                                                                                className="w-7 h-7 cursor-pointer flex items-center justify-center !text-white hover:!text-white rounded-md hover:bg-white/10 transition-colors"
                                                                            >
                                                                                +
                                                                            </i>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handlePOSAddToCart(med, 1)}
                                                                            className="!bg-black border border-transparent !text-white hover:!bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md shadow-black/10 cursor-pointer"
                                                                        >
                                                                            Add
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col items-end gap-1.5">
                                                                    <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-red-100">Out of Stock</span>
                                                                    {hasSubstitutes && (
                                                                        <button 
                                                                            onClick={() => setViewingSubstitutesFor(viewingSubstitutesFor === med.id ? null : med.id)}
                                                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                                                        >
                                                                            <Sparkles className="w-3 h-3" />
                                                                            {viewingSubstitutesFor === med.id ? "Hide Substitutes" : "Find Substitutes"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Substitutes Section */}
                                                        <AnimatePresence>
                                                            {viewingSubstitutesFor === med.id && hasSubstitutes && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden"
                                                                >
                                                                    <div className="bg-slate-50/50 rounded-2xl p-2 mt-1 border border-slate-100 ml-6 space-y-1.5 shadow-inner">
                                                                        <div className="px-3 pt-1 pb-2">
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Alternatives</p>
                                                                        </div>
                                                                        {med.substitutes.map((sub: any) => {
                                                                            const subCartItem = posCart.get(sub.id);
                                                                            const subInCart = subCartItem ? subCartItem.qty : 0;
                                                                            return (
                                                                                <div key={sub.id} className="bg-white rounded-xl p-2.5 border border-slate-100 flex items-center justify-between shadow-sm">
                                                                                    <div className="flex-1 min-w-0 mr-3">
                                                                                        <h5 className="font-bold text-slate-700 text-sm truncate">{sub.brandName}</h5>
                                                                                        <p className="text-[10px] text-emerald-600 font-bold">{sub.available_units} units available</p>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-sm font-bold text-slate-900 mr-2">₹{Number(sub.price).toFixed(2)}</span>
                                                                                        {subInCart > 0 ? (
                                                                                            <div className="flex items-center bg-indigo-600 rounded-lg p-0.5">
                                                                                                <i
                                                                                                    onClick={() => handlePOSAddToCart(sub, subInCart - 1)}
                                                                                                    className="w-6 h-6 flex cursor-pointer items-center justify-center !text-white rounded-md hover:bg-white/10 transition-colors text-xs"
                                                                                                >
                                                                                                    -
                                                                                                </i>
                                                                                                <span className="w-6 text-center font-bold text-xs !text-white">{subInCart}</span>
                                                                                                <i
                                                                                                    onClick={() => handlePOSAddToCart(sub, subInCart + 1)}
                                                                                                    className="w-6 h-6 cursor-pointer flex items-center justify-center !text-white rounded-md hover:bg-white/10 transition-colors text-xs"
                                                                                                >
                                                                                                    +
                                                                                                </i>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <button
                                                                                                onClick={() => handlePOSAddToCart(sub, 1)}
                                                                                                className="!bg-indigo-600 !text-white hover:!bg-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-indigo-100"
                                                                                            >
                                                                                                Add
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Register / Cart */}
                        <div className="w-full md:w-[400px] flex flex-col gap-4">
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 flex-1 flex flex-col overflow-hidden">
                                <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                            <ShoppingCart className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">Current Sale</h3>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
                                        {new Date().toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Cart Items (Receipt Look) */}
                                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar bg-white relative">
                                    {posCart.size === 0 ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-3">
                                            <ShoppingCart className="w-12 h-12 opacity-10" />
                                            <p className="text-sm font-medium">Register is empty</p>
                                            <p className="text-xs max-w-[150px] text-center opacity-60">Scan items or select from catalog to begin</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-4">
                                            {Array.from(posCart.values()).map(({ medicine: m, qty }) => {
                                                const price = Number(m.sellingPrice || (m.inventory && m.inventory.length > 0 ? Number(m.inventory[0].mrp) : (m.price || 0)));
                                                const subtotal = price * qty;
                                                return (
                                                    <li key={m.id} className="flex justify-between items-start group">
                                                        <div className="flex-1 pr-4">
                                                            <div className="font-bold text-slate-800 text-sm">{m.brandName}</div>
                                                            <div className="text-xs text-slate-400 mt-0.5">{m.genericName} {m.strength && `• ${m.strength}`}</div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-xs font-bold text-slate-500">x{qty}</div>
                                                            <span className="font-mono text-sm font-bold text-slate-900">₹{Number(subtotal).toFixed(2)}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                            <div className="border-t-2 border-dashed border-slate-100 my-4" />
                                            <div className="flex justify-between items-center text-lg font-bold text-slate-900 mt-2">
                                                <span>Total</span>
                                                <span className="font-mono">₹{Number(Array.from(posCart.values()).reduce((acc, item) => {
                                                    const m = item.medicine;
                                                    const price = Number(m.sellingPrice || (m.inventory && m.inventory.length > 0 ? Number(m.inventory[0].mrp) : (m.price || 0)));
                                                    return acc + (price * item.qty);
                                                }, 0)).toFixed(2)}</span>
                                            </div>
                                        </ul>
                                    )}
                                </div>

                                {/* Payment Section */}
                                <div className="p-5 bg-slate-50 border-t border-slate-100">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        {[
                                            { id: "CASH", icon: Banknote, label: "Cash", disabled: false },
                                            { id: "ONLINE", icon: CreditCard, label: "Online", disabled: false },
                                            { id: "UPI", icon: Smartphone, label: "UPI", disabled: true },
                                            { id: "OTHER", icon: MoreHorizontal, label: "Other", disabled: true }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                disabled={item.disabled}
                                                onClick={() => !item.disabled && setPosPaymentMethod(item.id)}
                                                className={`flex items-center cursor-pointer justify-center gap-2 py-3 px-2 rounded-xl text-xs font-bold border transition-all duration-200 
                                                    ${item.disabled ? 'cursor-not-allowed !bg-white !text-black border-slate-200 opacity-60' : ''}
                                                    ${!item.disabled && posPaymentMethod === item.id
                                                        ? "!bg-slate-900 !text-white !border-slate-900 shadow-md shadow-slate-900/20 scale-[1.02]"
                                                        : (!item.disabled ? "!bg-white !text-slate-600 !border-slate-200 hover:!bg-slate-50 hover:!border-slate-300" : "")
                                                    }`}
                                            >
                                                <item.icon className="w-3.5 h-3.5" />
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-emerald-600 font-medium text-center mb-4 flex items-center justify-center gap-1">
                                        <Activity className="w-3 h-3" /> Cash and Online payments are now accepted
                                    </p>

                                    <Button
                                        className="w-full h-14 !bg-slate-900 cursor-pointer text-white hover:opacity-95 shadow-xl shadow-slate-900/30 font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px] active:translate-y-[0px]"
                                        disabled={posCart.size === 0 || isCheckoutLoading}
                                        onClick={handlePOSCheckoutClick}
                                    >
                                        {isCheckoutLoading ? (
                                            <Sparkles className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-5 h-5" />
                                        )}
                                        {isCheckoutLoading ? "Processing..." : "Complete Sale"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div >
                )}

                {/* --- HISTORY TAB --- */}
                {
                    activeTab === 'history' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Sales History</h2>
                                    <p className="text-sm text-slate-500">View and download past receipts</p>
                                </div>
                            </div>

                            <div className="flex-1 p-6 bg-slate-50">
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-y-auto max-h-[70vh] shadow-sm custom-scrollbar relative">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold text-slate-700">Receipt Details</th>
                                                <th className="px-6 py-4 font-semibold text-slate-700">Date & Items</th>
                                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Total Amount</th>
                                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {isHistoryLoading ? (
                                                [...Array(5)].map((_, i) => (
                                                    <tr key={i}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <Skeleton className="w-10 h-10 rounded-xl" />
                                                                <div className="space-y-2">
                                                                    <Skeleton className="h-4 w-32" />
                                                                    <Skeleton className="h-3 w-24" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="space-y-2">
                                                                <Skeleton className="h-4 w-24" />
                                                                <Skeleton className="h-3 w-16" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end">
                                                                <Skeleton className="h-6 w-16 rounded-lg" />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Skeleton className="w-9 h-9 rounded-lg" />
                                                                <Skeleton className="w-24 h-9 rounded-lg" />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : receipts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-12">
                                                        <EmptyState 
                                                            icon={FileText}
                                                            title="No Sales History"
                                                            description="You haven't processed any sales yet. Complete a checkout in the POS section to see receipts here."
                                                            action={
                                                                <Button
                                                                    onClick={() => setActiveTab('sale')}
                                                                    className="!bg-black !text-white rounded-xl px-8"
                                                                >
                                                                    Go to POS
                                                                </Button>
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ) : (
                                                receipts.map((receipt) => (
                                                    <tr key={receipt.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-10 h-10 rounded-xl ${theme.light} flex items-center justify-center`}>
                                                                    <FileText className={`w-5 h-5 ${theme.text}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800">
                                                                        {data?.store?.name || 'Store Name'}
                                                                    </p>
                                                                    <p className="text-xs text-slate-500 font-mono mt-0.5 opacity-75">
                                                                        {receipt.data?.receiptNo || `Receipt #${receipt.id.slice(0, 8)}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2 text-slate-600">
                                                                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">{new Date(receipt.createdAt).toLocaleDateString()}</span>
                                                                    <span className="text-xs text-slate-400">{new Date(receipt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                                <span className="text-xs text-slate-500 font-medium">
                                                                    {receipt.data?.items?.length || 0} Items Prescribed
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-lg font-bold text-slate-800">
                                                                ₹{(receipt.data?.total || 0).toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <i

                                                                    onClick={() => downloadReceiptPDF(receipt.id, receipt.data?.receiptNo)}
                                                                    className={`w-9 h-9  p-0 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500`}
                                                                    title="Download PDF"
                                                                >
                                                                    <Download className="w-4 h-10 cursor-pointer" />
                                                                </i>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => viewReceiptPDF(receipt.id)}
                                                                    className="gap-2 cursor-pointer !bg-black !text-white hover:!bg-slate-800 shadow-md shadow-black/10 border-transparent"
                                                                >
                                                                    <FileText className="w-3.5 h-3.5" /> View PDF
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )))}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </motion.div>
                    )
                }


                {/* Suppliers Directory Modal */}



            </main>

            {/* PayU Payment Modal */}
            <AnimatePresence>
                {showPayUModal && payUPaymentInfo && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md"
                        >
                            <PharmacyPayment
                                amount={payUPaymentInfo.amount}
                                email={payUPaymentInfo.email}
                                name={payUPaymentInfo.name}
                                phone={payUPaymentInfo.phone}
                                orderId={payUPaymentInfo.orderId}
                                payuData={payUPaymentInfo.payuData}
                            />
                            <button
                                onClick={() => setShowPayUModal(false)}
                                className="mt-4 w-full py-3 text-sm font-bold text-white/60 hover:text-white transition-colors"
                            >
                                Cancel Payment
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
         



            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
                                    <LogOut className="w-8 h-8 text-red-500 translate-x-0.5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Sign Out</h3>
                                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                        Are you sure you want to end your session? You'll need to sign in again to access your store.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                    <button

                                        className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                        onClick={() => setShowLogoutConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                        onClick={logout}
                                    >
                                        Yes, Sign Out
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* POS Confirmation Modal */}
            <AnimatePresence>
                {showPOSConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                            onClick={() => setShowPOSConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl ${theme.light} flex items-center justify-center mb-2`}>
                                    <ShoppingCart className={`w-8 h-8 ${theme.text}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Confirm Sale</h3>
                                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                        Are you sure you want to process this sale for <span className="font-bold text-slate-700">{posCart.size} items</span>?
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                    <Button
                                        variant="outline"
                                        className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                        onClick={() => setShowPOSConfirm(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                        onClick={() => {
                                            executeCheckout();
                                            setShowPOSConfirm(false);
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Receipt Preview Modal */}
            <AnimatePresence>
                {showReceiptPreview && currentReceiptUrl && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg md:max-w-4xl flex flex-col overflow-hidden h-[90vh]"
                        >
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-600 text-lg leading-tight">Transaction Successful</h3>
                                        <p className="text-xs text-slate-500 font-medium">Receipt Generated</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowReceiptPreview(false)} className="p-2 cursor-pointer !bg-black hover:bg-slate-800 rounded-lg transition-colors shadow-md shadow-black/10">
                                    <X className="w-5 h-5 !text-white" />
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                                {/* PDF Preview */}
                                <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center border-r border-slate-100">
                                    <iframe
                                        src={currentReceiptUrl + "#toolbar=0"}
                                        className="w-full h-full rounded-lg shadow-sm bg-white"
                                        title="Receipt Preview"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="w-full md:w-72 bg-white p-6 flex flex-col shrink-0 overflow-y-auto">
                                    <h4 className="font-bold text-slate-700 mb-4">Actions</h4>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-600 mb-2">Send Receipt to Email</label>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="email"
                                                placeholder="customer@example.com"
                                                value={receiptEmail}
                                                onChange={(e) => setReceiptEmail(e.target.value)}
                                                className="w-full px-3 py-2 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                                            />
                                            <Button
                                                onClick={handleSendReceipt}
                                                disabled={isSendingEmail || !receiptEmail}
                                                className="w-full cursor-pointer !bg-black hover:!bg-slate-800 !text-white shadow-lg shadow-black/20"
                                                size="sm"
                                            >
                                                {isSendingEmail ? "Sending..." : "Send Email"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 text-center mb-3">Or download directly</p>
                                        <a
                                            href={currentReceiptUrl}
                                            download={`Receipt-${Date.now()}.pdf`}
                                            className="block w-full bg-black text-white text-center py-2 px-4 border border-black rounded-lg font-medium hover:bg-black transition-colors"
                                        >
                                            Download PDF
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Disconnect Supplier Confirmation Modal */}
            <AnimatePresence>
                {showDisconnectConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                            onClick={() => setShowDisconnectConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                                    <Trash2 className="w-8 h-8 text-slate-900" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Disconnect Supplier?</h3>
                                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                        Are you sure you want to remove this supplier from your network? You will need to request a connection again to reorder.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                    <button
                                        type="button"
                                        style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none' }}
                                        className="h-12 rounded-xl w-full font-bold transition-all hover:opacity-80 cursor-pointer"
                                        onClick={() => setShowDisconnectConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none' }}
                                        className="h-12 rounded-xl w-full font-bold shadow-lg shadow-black/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        disabled={isDisconnectLoading}
                                        onClick={() => {
                                            if (disconnectSupplierId) {
                                                executeDisconnectSupplier();
                                            }
                                        }}
                                    >
                                        {isDisconnectLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Disconnecting...
                                            </>
                                        ) : (
                                            "Disconnect"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reorder Details Modal */}
            <AnimatePresence>
                {showReorderDetails && selectedReorder && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 z-[200]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
                            onClick={() => setShowReorderDetails(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-slate-800">Order Details</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${selectedReorder.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            selectedReorder.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-amber-100 text-amber-700 border-amber-200'
                                            }`}>
                                            {selectedReorder.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-mono">#{selectedReorder.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => setShowReorderDetails(false)}
                                    className="p-2 !bg-black cursor-pointer hover:bg-slate-800 rounded-lg transition-colors shadow-md shadow-black/10"
                                >
                                    <X className="w-5 h-5 !text-white" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-6">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <Store className="w-3.5 h-3.5" /> Supplier
                                        </div>
                                        <p className="font-semibold text-slate-700">
                                            {data?.lists?.suppliers?.find(s => s.id === selectedReorder.supplierId)?.name || 'Unknown Supplier'}
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <Calendar className="w-3.5 h-3.5" /> Date Sent
                                        </div>
                                        <p className="font-semibold text-slate-700">
                                            {new Date(selectedReorder.createdAt).toLocaleDateString()} at {new Date(selectedReorder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-slate-400" />
                                        Requested Items
                                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {selectedReorder.payload?.items?.length || 0}
                                        </span>
                                    </h4>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                                <tr>
                                                    <th className="px-4 py-3 pl-6">Medicine Name</th>
                                                    <th className="px-4 py-3 text-right pr-6">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedReorder.payload?.items?.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 pl-6 font-medium text-slate-700">{item.medicineName}</td>
                                                        <td className="px-4 py-3 text-right pr-6 font-mono text-slate-600">{item.quantity}</td>
                                                    </tr>
                                                ))}
                                                {(!selectedReorder.payload?.items || selectedReorder.payload.items.length === 0) && (
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-8 text-center text-slate-400">
                                                            No items listed in this request.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Note (if applicable) */}
                                {selectedReorder.payload?.note && (
                                    <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 text-sm text-yellow-800">
                                        <span className="font-bold block mb-1">Note:</span>
                                        {selectedReorder.payload.note}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                                <Button
                                    onClick={() => setShowReorderDetails(false)}
                                    className="px-6 rounded-xl cursor-pointer font-bold !bg-black border border-transparent !text-white hover:!bg-slate-800 shadow-lg shadow-black/10"
                                >
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Reorder Result Modal */}
            <AnimatePresence>
                {reorderResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${reorderResult.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {reorderResult.type === 'success' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {reorderResult.type === 'success' ? 'Success!' : 'Something went wrong'}
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                {reorderResult.message}
                            </p>

                            <Button
                                onClick={() => {
                                    if (reorderResult.type === 'success') {
                                        // Reset form on success close
                                        setActiveTab('overview');
                                        setCart(new Map());
                                        setReorderNote("");
                                        setReorderSupplierId("");
                                        setSuggestedItems([]);
                                    }
                                    setReorderResult(null);
                                }}
                                className="w-full h-12 cursor-pointer rounded-xl font-bold !bg-black !text-white hover:!bg-slate-800"
                            >
                                {reorderResult.type === 'success' ? 'Done' : 'Try Again'}
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>




            {/* Feedback / Notification Modal */}
            <AnimatePresence>
                {showFeedback && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-blue-100 text-blue-600">
                                <Sparkles className="w-8 h-8" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Notification
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                {feedbackMessage}
                            </p>

                            <Button
                                onClick={() => setShowFeedback(false)}
                                className="w-full h-12 cursor-pointer rounded-xl font-bold !bg-black !text-white hover:!bg-slate-800"
                            >
                                Got it
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Reject Request Confirmation Modal */}
            <AnimatePresence>
                {requestToReject && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                            onClick={() => setRequestToReject(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center mb-2">
                                    <X className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Reject Request?</h3>
                                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                        Are you sure you want to reject this supplier request? This action cannot be undone.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                    <Button
                                        variant="outline"
                                        className="h-12 cursor-pointer rounded-xl !bg-black !text-white hover:!bg-neutral-800 border-none font-semibold shadow-md"
                                        onClick={() => setRequestToReject(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-neutral-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                        onClick={executeRejectRequest}
                                    >
                                        Confirm Reject
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            {/* Dock Navigation */}
            <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col justify-center pointer-events-none">
                <div className="pointer-events-auto">
                    <Dock direction="vertical" panelHeight={60} magnification={70} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl dark:bg-white/80">
                        {NAV_ITEMS.map((item) => (
                            <DockItem
                                key={item.tab}
                                onClick={() => {
                                    if (item.tab === 'reorder') { handleOpenReorder(); }
                                    else if (item.tab === 'sale') { searchPOSMedicines(""); }
                                    else if (item.tab === 'history') { handleViewReceipts(); }
                                    setActiveTab(item.tab as any);
                                }}
                            >
                                <DockLabel>{item.label}</DockLabel>
                                <DockIcon>
                                    <item.icon className={`w-6 h-6 transition-colors duration-300 ${activeTab === item.tab ? item.color : 'text-slate-400'}`} />
                                </DockIcon>
                            </DockItem>
                        ))}
                    </Dock>
                </div>
            </div>
        </div>
    );
};









export default StoreOwnerDashboard;

