// src/pages/SuperAdminDashboard.tsx
import React, { useEffect, useState } from "react";

import { useSetRecoilState, useRecoilValue } from "recoil";
import { authState, clearAuthState } from "../state/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Store as StoreIcon, Activity, Search,
    Package, Truck, LogOut, Trash2,
    PieChart as PieChartIcon,
    Bell, Lock, X, ArrowRightLeft,
    Send, Mail, MessageSquare, CheckCircle2, RefreshCw, ShoppingCart, Share2, Filter, Calendar, AlertCircle
} from "lucide-react";
import { format } from 'date-fns';
import { Dock, DockIcon, DockItem, DockLabel } from "../components/ui/dock";
import { adminApi } from "../lib/api/endpoints";
import type { User, Store, Supplier } from "../lib/types";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { FaExchangeAlt } from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as dagre from 'dagre';

// --- Types ---

interface AnalyticsData {
    overview: {
        users: { total: number; verified: number };
        stores: { total: number; active: number; inactive: number };
        suppliers: { total: number };
        medicines: { total: number };
        financials: {
            totalRevenue: number | string;
            inventoryValue: number | string;
            totalSalesCount: number;
        };
        operations: {
            pendingSupplierRequests: number;
            failedUploads: number;
            expiringBatchesNext30Days: number;
        };
    };
    trends: {
        users: Array<{ date: string; count: number }>;
        sales: Array<{ date: string; count: number; revenue: number | string }>;
    };
    distributions: {
        paymentMethods: Array<{ method: string; count: number; revenue: number | string }>;
        userRoles: Array<{ role: string; count: number }>;
    };
    recentCriticalActivity: Array<{
        id: string;
        action: string;
        resource: string;
        createdAt: string;
        user?: { username: string; email: string };
    }>;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
// const RADIAN = Math.PI / 180; 
// Removed unused label renderer to keep UI clean





const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : "bg-red-50 text-red-700 border border-red-200"
        }`}>
        {isActive ? "Active" : "Suspended"}
    </span>
);

const TableSkeleton = () => (
    <>
        {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="animate-pulse">
                <td className="px-6 py-4">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-20"></div>
                </td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded w-24 ml-auto"></div></td>
            </tr>
        ))}
    </>
);

// --- Main Page ---

const AnalyticsSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-32 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
                        <div className="w-16 h-6 rounded-full bg-slate-100"></div>
                    </div>
                    <div>
                        <div className="w-24 h-8 bg-slate-200 rounded mb-2"></div>
                        <div className="w-32 h-4 bg-slate-100 rounded"></div>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart Skeleton */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[400px]">
                <div className="w-48 h-6 bg-slate-200 rounded mb-6"></div>
                <div className="w-full h-[300px] bg-slate-100 rounded-xl"></div>
            </div>

            {/* Side Stats Skeleton */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[200px]">
                    <div className="w-40 h-6 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-3">
                        <div className="w-full h-12 bg-slate-100 rounded-lg"></div>
                        <div className="w-full h-12 bg-slate-100 rounded-lg"></div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-[180px]">
                    <div className="w-40 h-6 bg-slate-200 rounded mb-4"></div>
                    <div className="w-full h-24 bg-slate-100 rounded-lg"></div>
                </div>
            </div>
        </div>
    </div>
);

// --- Components ---

const FilterDropdown = ({ options, current, onChange, isOpen, setIsOpen, label }: any) => {
    const hasFilter = current !== 'ALL';
    // Close on click outside is handled by the fixed distinct div

    return (
        <div className="relative z-50">
            {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
            <div
                className="w-12 h-12 flex items-center justify-center bg-transparent text-black cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
                title={`Filter ${label}`}
            >
                <Filter className={`w-5 h-5 ${hasFilter ? 'fill-current' : ''}`} />
            </div>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="absolute top-14 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-slate-900/5"
                >
                    <div className="p-2 space-y-1 bg-slate-50/50 backdrop-blur-xl">
                        {options.map((opt: any) => (
                            <div
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all flex items-center justify-between cursor-pointer ${current === opt.value
                                    ? 'bg-black text-white font-semibold shadow-md ring-1 ring-black'
                                    : 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 border border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <span>{opt.label}</span>
                                {current === opt.value && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 170, height: 80 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: {
                    x: nodeWithPosition.x - 170 / 2,
                    y: nodeWithPosition.y - 80 / 2,
                },
            };
        }),
        edges,
    };
};

const SuperAdminDashboard: React.FC = () => {
    const setAuth = useSetRecoilState(authState);
    const auth = useRecoilValue(authState);
    const navigate = useNavigate();

    const NAV_ITEMS = [
        { label: 'Analytics', icon: PieChartIcon, tab: 'analytics', color: 'text-indigo-500' },
        { label: 'Network', icon: Share2, tab: 'network', color: 'text-cyan-500' },
        { label: 'Stores', icon: StoreIcon, tab: 'stores', color: 'text-blue-500' },
        { label: 'Suppliers', icon: Truck, tab: 'suppliers', color: 'text-emerald-500' },
        { label: 'Users', icon: Users, tab: 'users', color: 'text-pink-500' },
        { label: 'Notifications', icon: Bell, tab: 'notifications', color: 'text-amber-500' },
    ];

    const [activeTab, setActiveTab] = useState<"analytics" | "stores" | "suppliers" | "users" | "notifications" | "network">("analytics");

    // Notification State
    const [notifyForm, setNotifyForm] = useState({
        targetRole: "ALL",
        type: "SYSTEM" as "SYSTEM" | "EMAIL" | "BOTH",
        subject: "",
        message: "",
    });
    const [sending, setSending] = useState(false);
    const [notificationResult, setNotificationResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showNotificationResultModal, setShowNotificationResultModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [feedback, setFeedback] = useState<{ show: boolean, message: string }>({ show: false, message: "" });

    // Data State
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [stores, setStores] = useState<Store[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [graphData, setGraphData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

    // Search / Filter
    const [searchQuery, setSearchQuery] = useState("");

    // Filters State
    const [storeFilter, setStoreFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
    const [showStoreFilterMenu, setShowStoreFilterMenu] = useState(false);

    const [supplierFilter, setSupplierFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
    const [showSupplierFilterMenu, setShowSupplierFilterMenu] = useState(false);

    const [userFilter, setUserFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'SUPPLIER' | 'STORE_OWNER' | 'ADMIN'>('ALL');
    const [showUserFilterMenu, setShowUserFilterMenu] = useState(false);

    // Graph Filters
    const [graphTimeRange, setGraphTimeRange] = useState<'7D' | '15D' | '30D'>('7D');
    const [showGraphFilterMenu, setShowGraphFilterMenu] = useState(false);

    const [storeToDelete, setStoreToDelete] = useState<{ id: string; name: string } | null>(null);
    const [storeToToggle, setStoreToToggle] = useState<{ id: string; name: string; isActive: boolean } | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<{ id: string; name: string } | null>(null);
    const [supplierToToggle, setSupplierToToggle] = useState<{ id: string; name: string; isActive: boolean } | null>(null);
    const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
    const [userToConvert, setUserToConvert] = useState<{ id: string; name: string } | null>(null);
    const [userToToggle, setUserToToggle] = useState<{ id: string; name: string; isActive: boolean } | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    // Refs
    // Effects
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const needsFetch = 
            (activeTab === 'analytics' && !analytics) ||
            (activeTab === 'stores' && stores.length === 0) ||
            (activeTab === 'suppliers' && suppliers.length === 0) ||
            (activeTab === 'users' && users.length === 0) ||
            (activeTab === 'network' && !graphData);

        if (needsFetch) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, analytics, stores.length, suppliers.length, users.length, graphData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "analytics") {
                const res = await adminApi.getDashboardAnalytics();
                if (res.data.success) setAnalytics(res.data.data);
            } else if (activeTab === "stores") {
                const res = await adminApi.getStores({ q: searchQuery });
                if (res.data.success) setStores(res.data.data.stores);
            } else if (activeTab === "suppliers") {
                const res = await adminApi.getSuppliers(searchQuery);
                if (res.data.success) setSuppliers(res.data.data.suppliers);
            } else if (activeTab === "users") {
                const res = await adminApi.getUsers({ q: searchQuery });
                if (res.data.success) setUsers(res.data.data.users);
            } else if (activeTab === "network") {
                const res = await adminApi.getGraphData();
                if (res.data.success) {
                    const rawData = res.data.data;
                    setGraphData(rawData);

                    // Transform to React Flow format
                    const initialNodes = rawData.nodes.map((node: any) => ({
                        id: node.id,
                        type: 'default',
                        position: { x: 0, y: 0 }, // Initial position, will be calculated by dagre
                        data: {
                            label: (
                                <div className="p-2">
                                    <div className="font-bold text-sm">{node.label}</div>
                                    <div className="text-xs text-slate-500 truncate max-w-[140px]" title={node.subLabel}>{node.subLabel}</div>
                                    <div className="text-[10px] uppercase font-bold mt-1 tracking-wider text-slate-400">{node.type}</div>
                                </div>
                            )
                        },
                        style: {
                            background: '#fff',
                            border: `1px solid ${node.type === 'STORE' ? '#10b981' :
                                node.type === 'SUPPLIER' ? '#ec4899' : // Pink matches previous edit
                                    '#3b82f6'
                                }`,
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            width: 170,
                        }
                    }));

                    const initialEdges = rawData.edges.map((edge: any, i: number) => ({
                        id: `e-${i}`,
                        source: edge.source,
                        target: edge.target,
                        animated: true,
                        style: { stroke: '#94a3b8' },
                    }));

                    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
                    setNodes(layoutedNodes);
                    setEdges(layoutedEdges);
                }
            }
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setLoading(false);
        }
    };

    // Handlers


    const initiateToggleStore = (store: Store) => {
        setStoreToToggle({ id: store.id, name: store.name, isActive: store.isActive || false });
    };

    const performToggleStore = async () => {
        if (!storeToToggle) return;
        try {
            const res = await adminApi.suspendStore(storeToToggle.id, !storeToToggle.isActive);
            if (res.data.success) {
                fetchData();
                setStoreToToggle(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const initiateToggleSupplier = (supplier: Supplier) => {
        setSupplierToToggle({ id: supplier.id, name: supplier.name, isActive: supplier.isActive || false });
    };

    const performToggleSupplier = async () => {
        if (!supplierToToggle) return;
        try {
            const res = await adminApi.suspendSupplier(supplierToToggle.id, !supplierToToggle.isActive);
            if (res.data.success) {
                fetchData();
                setSupplierToToggle(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const initiateDeleteSupplier = (supplierId: string, supplierName: string) => {
        setSupplierToDelete({ id: supplierId, name: supplierName });
    };

    const performDeleteSupplier = async () => {
        if (!supplierToDelete) return;
        try {
            await adminApi.deleteSupplier(supplierToDelete.id);
            setSupplierToDelete(null);
            console.log(`Supplier ${supplierToDelete.name} deleted successfully.`);
            fetchData();
        } catch (err: any) {
            console.error(err);
            setFeedback({ show: true, message: "Error: " + err.message });
        }
    };

    const initiateConvertUser = (userId: string, username: string) => {
        setUserToConvert({ id: userId, name: username });
    };

    const performConvertUser = async () => {
        if (!userToConvert) return;
        try {
            const res = await adminApi.convertToSupplier(userToConvert.id);
            if (res.data) {
                // alert(`User ${userToConvert.name} converted to supplier successfully.`);
                setUserToConvert(null);
                fetchData();
            }
        } catch (err: any) {
            console.error(err);
            setFeedback({ show: true, message: "Error: " + err.message });
        }
    };

    const initiateDeleteUser = (userId: string, username: string) => {
        setUserToDelete({ id: userId, name: username });
    };

    const performDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await adminApi.deleteUser(userToDelete.id);
            setUserToDelete(null);
            fetchData();
        } catch (err: any) {
            console.error(err);
            setFeedback({ show: true, message: "Error: " + err.message });
        }
    };

    const initiateToggleUser = (user: User) => {
        setUserToToggle({ id: user.id, name: user.username, isActive: user.isActive || false });
    };

    const performToggleUser = async () => {
        if (!userToToggle) return;
        try {
            const res = await adminApi.suspendUser(userToToggle.id, !userToToggle.isActive);
            if (res.data.success) {
                fetchData();
                setUserToToggle(null);
            }
        } catch (err: any) {
            console.error(err);
            setFeedback({ show: true, message: "Error: " + (err.message || "Failed to toggle user status") });
        }
    };




    const initiateDeleteStore = (storeId: string, storeName: string) => {
        setStoreToDelete({ id: storeId, name: storeName });
    };

    const performDeleteStore = async () => {
        if (!storeToDelete) return;
        try {
            await adminApi.deleteStore(storeToDelete.id);
            setStoreToDelete(null);
            fetchData();
        } catch (err: any) {
            console.error(err);
            setFeedback({ show: true, message: "Error: " + err.message });
        }
    };



    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const performLogout = () => {
        setAuth(clearAuthState());
        navigate("/login");
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const res: any = await adminApi.sendNotification(notifyForm);

            if (res.data?.success) {
                setNotificationResult({ success: true, message: "Your broadcast message has been queued for delivery." });
                setShowNotificationResultModal(true);
                setNotifyForm({ ...notifyForm, subject: "", message: "" });
            } else {
                setNotificationResult({ success: false, message: res.data?.error || "Failed to send notification." });
                setShowNotificationResultModal(true);
            }
        } catch (err: any) {
            console.error("Error sending notification:", err);
            setFeedback({ show: true, message: "Error sending notification: " + (err.response?.data?.message || err.message) });
        } finally {
            setSending(false);
        }
    };



    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            {/* Header */}
            <header className={`sticky top-0 z-20 transition-all duration-500 ease-in-out ${isScrolled ? "bg-white/10 backdrop-blur-3xl backdrop-saturate-150 border-none shadow-none support-[backdrop-filter]:bg-white/20" : "bg-transparent border-none shadow-none"}`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src="/newAdmin.png"
                                alt="Admin Logo"
                                className="w-12 h-12 object-contain"
                            />
                            <div>
                                <motion.h1
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
                                >
                                    Admin Console
                                </motion.h1>
                                <motion.p
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="text-xs text-slate-500 font-medium"
                                >
                                    Pharmacy Management System
                                </motion.p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">

                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-semibold text-slate-600">
                                    {format(new Date(), 'EEE d MMM')}
                                </span>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <i
                                    onClick={fetchData}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-slate-500 border border-slate-200 shadow-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all cursor-pointer"
                                    title="Refresh System Data"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                </i>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6, type: "spring" }}
                                className="flex items-center gap-3"
                            >
                                {/* User Profile */}
                                <div className="hidden md:flex flex-col items-end">
                                    <span className="text-sm font-semibold text-slate-700">
                                        Admin
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-md shadow-slate-200/50 overflow-hidden">
                                    {auth.user?.imageUrl ? (
                                        <img src={auth.user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-slate-600 font-bold text-sm">
                                            {auth.user?.username?.charAt(0)?.toUpperCase() || "A"}
                                        </span>
                                    )}
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <i
                                        onClick={handleLogout}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-transparent text-slate-500 border border-slate-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all ml-3"
                                        title="Sign Out"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </i>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
                <AnimatePresence mode="wait">
                    {activeTab === "analytics" && (
                        (loading && !analytics) ? <AnalyticsSkeleton /> : analytics && (() => {
                            const getFilteredGraphData = () => {
                                const data = analytics.trends.sales.map(s => ({ ...s, revenue: Number(s.revenue) }));
                                // Assuming data is sorted by date ascending. If not, sort first.
                                // Taking last N items based on range. Be careful if data length < range.
                                const total = data.length;
                                let count = 7;
                                if (graphTimeRange === '15D') count = 15;
                                if (graphTimeRange === '30D') count = 30;

                                return data.slice(Math.max(0, total - count));
                            };


                            return (
                                <motion.div
                                    key="analytics"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-8"
                                >
                                    {/* 1. Key Metrics Strip */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {/* Swapped: Store Performance (Previously Total Revenue was here) */}
                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
                                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                                <StoreIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Store Performance</p>
                                                <p className="text-xl font-black text-slate-800">
                                                    {analytics.overview.stores.total}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Swapped: Active Supply Partners (Previously Inventory Value was here) */}
                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
                                            <div className="p-3 bg-black rounded-xl text-emerald-600">
                                                <Truck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Suppliers</p>
                                                <p className="text-xl font-black text-slate-800">
                                                    {analytics.overview.suppliers.total}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                                <ShoppingCart className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Sales</p>
                                                <p className="text-xl font-black text-slate-800">
                                                    {Number(analytics.overview.financials.totalSalesCount).toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
                                            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Users</p>
                                                <p className="text-xl font-black text-slate-800">
                                                    {analytics.overview.users.total} <span className="text-sm font-normal text-slate-400">({analytics.overview.users.total} Verified)</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Main Graph Area & Side Stats */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                                        {/* Big Graph */}
                                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">Sales Trend</h3>
                                                    <p className="text-sm text-slate-500">Revenue & Order count over date</p>
                                                </div>
                                                <div className="relative z-30">
                                                    <div
                                                        role="button"
                                                        onClick={() => setShowGraphFilterMenu(!showGraphFilterMenu)}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 !bg-white rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer select-none"
                                                        style={{ backgroundColor: '#ffffff' }}
                                                    >
                                                        {graphTimeRange === '7D' ? 'Last 7 Days' : graphTimeRange === '15D' ? 'Last 15 Days' : 'Last 30 Days'}
                                                        <span className="text-slate-400 text-[10px] ml-1">▼</span>
                                                    </div>
                                                    {showGraphFilterMenu && (
                                                        <>
                                                            <div className="fixed inset-0 z-20" onClick={() => setShowGraphFilterMenu(false)} />
                                                            <div className="absolute top-full right-0 mt-3 w-48 !bg-white border border-slate-100 rounded-2xl shadow-xl z-30 overflow-hidden p-1.5 ring-1 ring-slate-900/5">
                                                                {['7D', '15D', '30D'].map((range: any) => (
                                                                    <div
                                                                        key={range}
                                                                        role="button"
                                                                        onClick={() => { setGraphTimeRange(range); setShowGraphFilterMenu(false); }}
                                                                        className={`w-full text-left px-4 py-3 text-sm rounded-xl flex items-center justify-between transition-all cursor-pointer select-none ${graphTimeRange === range
                                                                            ? 'text-violet-600 font-bold !bg-white shadow-sm ring-1 ring-slate-100'
                                                                            : 'text-slate-600 !bg-white hover:bg-gray-50'
                                                                            }`}
                                                                        style={{ backgroundColor: '#ffffff' }}
                                                                    >
                                                                        {range === '7D' ? 'Last 7 Days' : range === '15D' ? 'Last 15 Days' : 'Last 30 Days'}
                                                                        {graphTimeRange === range && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 w-full min-h-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={getFilteredGraphData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(str) => { const d = new Date(str); return `${d.getMonth() + 1}/${d.getDate()}`; }} />
                                                        <YAxis yAxisId="left" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                                        <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Side Stats - Operations & Inventory */}
                                        {/* Side Stats - Swapped Financials & Inventory into view */}
                                        <div className="space-y-6 flex flex-col h-full">
                                            {/* Swapped: Total Revenue (Previously Store Performance) */}
                                            <div className="bg-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden flex-1 flex flex-col justify-center">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Activity className="w-24 h-24 text-white" />
                                                </div>
                                                <div className="relative z-10">
                                                    <p className="text-indigo-200 uppercase tracking-widest text-xs font-bold mb-1">Total Revenue</p>
                                                    <div className="text-4xl font-black mb-1">
                                                        ₹{Number(analytics.overview.financials.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0, compactDisplay: "short" })}
                                                    </div>
                                                    <p className="text-sm text-indigo-300">Generated across ecosystem</p>
                                                </div>
                                            </div>

                                            {/* Swapped: Inventory Value (Previously Active Suppliers) */}
                                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex-1 flex flex-col justify-center">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Package className="w-5 h-5" /></div>
                                                    <span className="text-xs font-bold bg-black text-emerald-700 px-2 py-1 rounded-full">Assets</span>
                                                </div>
                                                <div className="text-2xl font-bold text-slate-800">
                                                    ₹{Number(analytics.overview.financials.inventoryValue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </div>
                                                <p className="text-xs text-slate-500">Total Inventory Value</p>
                                            </div>
                                        </div>
                                    </div>




                                    {/* 4. Distributions */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
                                            <h3 className="font-bold text-slate-800 mb-2">Payment Methods</h3>
                                            <p className="text-sm text-slate-500 mb-6">Distribution by transaction count</p>

                                            <div className="h-[250px] relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analytics.distributions.paymentMethods}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="count"
                                                            nameKey="method"
                                                        >
                                                            {analytics.distributions.paymentMethods.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            formatter={(value: any, name: any, props: any) => [
                                                                `${value} txns (₹${Number(props.payload.revenue).toLocaleString()})`,
                                                                name
                                                            ]}
                                                            contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
                                                        />
                                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <h3 className="font-bold text-slate-800 mb-2">User Roles</h3>
                                            <p className="text-sm text-slate-500 mb-6">Distribution of user types</p>

                                            <div className="h-[250px] relative">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analytics.distributions.userRoles}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            paddingAngle={5}
                                                            dataKey="count"
                                                            nameKey="role"
                                                        >
                                                            {analytics.distributions.userRoles.map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length + 2]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                {/* Center Text */}
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                                    <div className="text-center">
                                                        <span className="text-2xl font-bold text-slate-800">{analytics.overview.users.total}</span>
                                                        <span className="block text-xs text-slate-500">Users</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })()
                    )}

                    {activeTab === "network" && (
                        <motion.div
                            key="network"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4 }}
                            className="rounded-3xl overflow-hidden shadow-2xl relative h-[700px] border border-slate-200 bg-white"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>

                            <div className="absolute top-6 left-6 z-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Ecosystem Network</h2>
                                <p className="text-slate-500 text-sm">Interactive visualization of users, stores, and suppliers.</p>
                                <div className="mt-4 flex gap-2">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        <span className="text-xs text-blue-700 font-medium">User</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span className="text-xs text-emerald-700 font-medium">Store</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-full border border-pink-100">
                                        <span className="w-2 h-2 rounded-full bg-[#ff0071]"></span>
                                        <span className="text-xs text-pink-700 font-medium">Supplier</span>
                                    </div>
                                </div>
                            </div>

                            {loading && !graphData ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                                </div>
                            ) : (
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    fitView
                                >
                                    <Background color="#94a3b8" gap={16} size={1} />
                                    <Controls className="bg-white border text-slate-500 fill-slate-500" />
                                    <MiniMap
                                        nodeColor={(node) => {
                                            // Extract color from the node style border we set earlier
                                            const border = node.style?.border as string;
                                            if (border && border.includes('#10b981')) return '#10b981';
                                            if (border && border.includes('#ec4899')) return '#ec4899';
                                            return '#3b82f6';
                                        }}
                                        style={{ backgroundColor: '#f8fafc' }}
                                    />
                                </ReactFlow>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "stores" && (
                        <motion.div
                            key="stores"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm"
                        >
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <StoreIcon className="w-5 h-5 text-indigo-500" />
                                    Registered Stores
                                </h2>
                                <div className="flex gap-2 items-center">
                                    <FilterDropdown
                                        options={[
                                            { value: 'ALL', label: 'All Stores' },
                                            { value: 'ACTIVE', label: 'Active' },
                                            { value: 'SUSPENDED', label: 'Suspended' }
                                        ]}
                                        current={storeFilter}
                                        onChange={setStoreFilter}
                                        isOpen={showStoreFilterMenu}
                                        setIsOpen={setShowStoreFilterMenu}
                                        label="Stores"
                                    />
                                    <Button
                                        size="icon"
                                        className="w-12 h-12 !bg-transparent !text-black hover:!bg-slate-100 rounded-lg transition-all"
                                        onClick={fetchData}
                                        title="Refresh Stores"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                                    </Button>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
                                        />
                                        {searchQuery && (
                                            <p
                                                onClick={() => setSearchQuery("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Store Name</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Slug</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Owner Email</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.tr
                                                    key="skeleton"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <td colSpan={5} className="p-0 border-none">
                                                        <table className="w-full">
                                                            <tbody>
                                                                <TableSkeleton />
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </motion.tr>
                                            ) : (
                                                <>
                                                    {stores.filter(s => {
                                                        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
                                                        if (!matchesSearch) return false;
                                                        if (storeFilter === 'ACTIVE') return s.isActive;
                                                        if (storeFilter === 'SUSPENDED') return !s.isActive;
                                                        return true;
                                                    }).map((store, index) => (
                                                        <motion.tr
                                                            key={store.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                                            className="hover:bg-indigo-50/50 transition-colors group cursor-default"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{store.name}</span>
                                                                    <span className="text-xs text-slate-400">ID: {store.id.slice(0, 8)}...</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 group-hover:bg-white group-hover:border-indigo-200 transition-colors">
                                                                    {store.slug}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white text-[10px] flex items-center justify-center font-bold">
                                                                        {store.users?.[0]?.user?.email?.[0].toUpperCase() || "?"}
                                                                    </div>
                                                                    <span className="text-slate-600 text-sm">{store.users?.[0]?.user?.email || "No Owner"}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge isActive={store.isActive || false} />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        size="sm"
                                                                        className="!bg-black !text-white hover:!bg-slate-800 !border !border-black hover:scale-105 transition-all shadow-md shadow-slate-200"
                                                                        onClick={() => initiateToggleStore(store)}
                                                                    >
                                                                        {store.isActive ? "Suspend" : "Activate"}
                                                                    </Button>
                                                                    <p
                                                                        className="ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all hover:scale-110"
                                                                        onClick={() => initiateDeleteStore(store.id, store.name)}
                                                                        title="Delete Store"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                    {stores.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                                No stores found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "suppliers" && (
                        <motion.div
                            key="suppliers"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm"
                        >
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-indigo-500" />
                                    Global Suppliers
                                </h2>
                                <div className="flex gap-2 items-center">
                                    <FilterDropdown
                                        options={[
                                            { value: 'ALL', label: 'All Suppliers' },
                                            { value: 'ACTIVE', label: 'Active' },
                                            { value: 'SUSPENDED', label: 'Suspended' }
                                        ]}
                                        current={supplierFilter}
                                        onChange={setSupplierFilter}
                                        isOpen={showSupplierFilterMenu}
                                        setIsOpen={setShowSupplierFilterMenu}
                                        label="Suppliers"
                                    />
                                    <Button
                                        size="icon"
                                        className="w-12 h-12 !bg-transparent !text-black hover:!bg-slate-100 rounded-lg transition-all"
                                        onClick={fetchData}
                                        title="Refresh Suppliers"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                                    </Button>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
                                        />
                                        {searchQuery && (
                                            <p
                                                onClick={() => setSearchQuery("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Supplier Name</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Contact</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Linked Account</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.tr
                                                    key="skeleton"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <td colSpan={5} className="p-0 border-none">
                                                        <table className="w-full">
                                                            <tbody>
                                                                <TableSkeleton />
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </motion.tr>
                                            ) : (
                                                <>
                                                    {suppliers.filter(s => {
                                                        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
                                                        if (!matchesSearch) return false;
                                                        if (supplierFilter === 'ACTIVE') return s.isActive;
                                                        if (supplierFilter === 'SUSPENDED') return !s.isActive;
                                                        return true;
                                                    }).map((supplier, index) => (
                                                        <motion.tr
                                                            key={supplier.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                                            className="hover:bg-slate-50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 font-medium text-slate-900">{supplier.name}</td>
                                                            <td className="px-6 py-4 text-slate-500">{supplier.contactName || "-"}</td>
                                                            <td className="px-6 py-4 text-slate-500">
                                                                <div className="flex flex-col">
                                                                    <span>{supplier.user?.email || "No Account"}</span>
                                                                    <span className="text-xs text-slate-400">{supplier.user?.username}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge isActive={supplier.isActive || false} />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        size="sm"
                                                                        className="!bg-black !text-white hover:!bg-slate-800 !border !border-black hover:scale-105 transition-all shadow-md shadow-slate-200"
                                                                        onClick={() => initiateToggleSupplier(supplier)}
                                                                    >
                                                                        {supplier.isActive ? "Suspend" : "Activate"}
                                                                    </Button>
                                                                    <p
                                                                        className="ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all hover:scale-110"
                                                                        onClick={() => initiateDeleteSupplier(supplier.id, supplier.name)}
                                                                        title="Delete Supplier"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                    {suppliers.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                                No suppliers found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}


                    {activeTab === "users" && (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm"
                        >
                            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" />
                                    User Management
                                </h2>
                                <div className="flex gap-2 items-center">
                                    <FilterDropdown
                                        options={[
                                            { value: 'ALL', label: 'All Users' },
                                            { value: 'ACTIVE', label: 'Active' },
                                            { value: 'SUSPENDED', label: 'Suspended' },
                                            { value: 'SUPPLIER', label: 'Suppliers' },
                                            { value: 'STORE_OWNER', label: 'Store Owners' },
                                            { value: 'ADMIN', label: 'Admins' }
                                        ]}
                                        current={userFilter}
                                        onChange={setUserFilter}
                                        isOpen={showUserFilterMenu}
                                        setIsOpen={setShowUserFilterMenu}
                                        label="Users"
                                    />
                                    <Button
                                        size="icon"
                                        className="w-12 h-12 !bg-transparent !text-black hover:!bg-slate-100 rounded-lg transition-all"
                                        onClick={fetchData}
                                        title="Refresh Users"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                                    </Button>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by username or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 pr-9 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 shadow-sm"
                                        />
                                        {searchQuery && (
                                            <p
                                                onClick={() => setSearchQuery("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                                            >
                                                <X className="w-3 h-3" />
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-slate-700">User Details</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Email Address</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                            <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.tr
                                                    key="skeleton"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    <td colSpan={5} className="p-0 border-none">
                                                        <table className="w-full">
                                                            <tbody>
                                                                <TableSkeleton />
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </motion.tr>
                                            ) : (
                                                <>

                                                    {users.filter(u => {
                                                        const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                            u.email.toLowerCase().includes(searchQuery.toLowerCase());
                                                        if (!matchesSearch) return false;

                                                        if (userFilter === 'ACTIVE') return u.isActive;
                                                        if (userFilter === 'SUSPENDED') return !u.isActive;
                                                        if (userFilter === 'SUPPLIER') return u.globalRole === 'SUPPLIER';
                                                        if (userFilter === 'STORE_OWNER') return u.globalRole === 'STORE_OWNER';
                                                        if (userFilter === 'ADMIN') return u.globalRole === 'ADMIN' || u.globalRole === 'SUPERADMIN';

                                                        return true;
                                                    }).map((user, index) => (
                                                        <motion.tr
                                                            key={user.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -20 }}
                                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                                            className="hover:bg-slate-50 transition-colors group cursor-default"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                                                                        {user.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-800">{user.username}</p>
                                                                        <p className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md inline-block mt-0.5 font-mono">ID: {user.id.slice(0, 8)}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-slate-600">
                                                                <div className="flex items-center gap-2">
                                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                                    {user.email}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-white border-slate-200 text-slate-700 shadow-sm">
                                                                    {user.globalRole || "N/A"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge isActive={user.isActive || false} />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                                    {user.globalRole !== "SUPPLIER" && user.globalRole !== "SUPERADMIN" && (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="!bg-black !text-white hover:!bg-slate-800 border-none h-8 mr-2 flex items-center gap-2"
                                                                            onClick={() => initiateConvertUser(user.id, user.username)}
                                                                        >
                                                                            <FaExchangeAlt /> Convert
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        size="sm"
                                                                        className="!bg-black !text-white hover:!bg-slate-800 !border !border-black hover:scale-105 transition-all shadow-md shadow-slate-200 h-8 gap-2 font-medium"
                                                                        onClick={() => initiateToggleUser(user)}
                                                                    >
                                                                        {user.isActive ? "Suspend" : "Activate"}
                                                                    </Button>
                                                                    <p
                                                                        className="ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all hover:scale-110 cursor-pointer"
                                                                        onClick={() => initiateDeleteUser(user.id, user.username)}
                                                                        title="Delete User"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                    {!loading && users.length === 0 && (
                                                        <tr>
                                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                                No users found.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="max-w-6xl mx-auto space-y-6">
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                                <div className="p-8 relative z-10">
                                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                                                <MdNotificationsActive className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Broadcast Center</h2>
                                                <p className="text-slate-500 text-sm font-medium mt-1">Send important updates and announcements</p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSendNotification} className="flex gap-6 items-stretch h-[500px]">
                                        <div className="w-5/12 space-y-6 flex flex-col">
                                            {/* Target Audience */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Target Audience</label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[
                                                        { value: 'ALL', label: 'All Users', desc: 'Everyone', icon: Users },
                                                        { value: 'SUPPLIER', label: 'Suppliers', desc: 'Partners', icon: Truck },
                                                        { value: 'STORE_OWNER', label: 'Store Owners', desc: 'Merchants', icon: StoreIcon },
                                                    ].map((opt) => (
                                                        <div
                                                            key={opt.value}
                                                            onClick={() => setNotifyForm({ ...notifyForm, targetRole: opt.value })}
                                                            className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${notifyForm.targetRole === opt.value
                                                                ? 'border-black bg-slate-50'
                                                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className={`p-2 rounded-lg transition-colors ${notifyForm.targetRole === opt.value ? 'bg-black text-white' : 'bg-white border border-slate-200 text-slate-500 group-hover:bg-slate-100'}`}>
                                                                <opt.icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <span className={`block text-sm font-bold ${notifyForm.targetRole === opt.value ? 'text-black' : 'text-slate-700'}`}>{opt.label}</span>
                                                            </div>
                                                            {notifyForm.targetRole === opt.value && (
                                                                <div className="absolute right-3 text-black">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Delivery Method */}
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Delivery Method</label>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {[
                                                        { value: 'SYSTEM', label: 'In-App', desc: 'Dashboard', icon: Bell },
                                                        { value: 'EMAIL', label: 'Email', desc: 'Direct Mail', icon: Mail },
                                                        { value: 'BOTH', label: 'All Channels', desc: 'Maximum Reach', icon: Send },
                                                    ].map((opt) => (
                                                        <div
                                                            key={opt.value}
                                                            onClick={() => setNotifyForm({ ...notifyForm, type: opt.value as any })}
                                                            className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${notifyForm.type === opt.value
                                                                ? 'border-black bg-slate-50'
                                                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className={`p-2 rounded-lg transition-colors ${notifyForm.type === opt.value ? 'bg-black text-white' : 'bg-white border border-slate-200 text-slate-500 group-hover:bg-slate-100'}`}>
                                                                <opt.icon className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <span className={`block text-sm font-bold ${notifyForm.type === opt.value ? 'text-black' : 'text-slate-700'}`}>{opt.label}</span>
                                                            </div>
                                                            {notifyForm.type === opt.value && (
                                                                <div className="absolute right-3 text-black">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-7/12 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col">
                                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
                                                <MessageSquare className="w-5 h-5 text-black" />
                                                Compose Message
                                            </h3>
                                            <div className="flex-1 space-y-5 flex flex-col">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Subject Line</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-300 text-sm"
                                                        placeholder="e.g., Important Maintenance Update"
                                                        value={notifyForm.subject}
                                                        onChange={e => setNotifyForm({ ...notifyForm, subject: e.target.value })}
                                                    />
                                                </div>

                                                <div className="space-y-2 flex-1 flex flex-col">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Message Content</label>
                                                    <textarea
                                                        required
                                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-300 resize-none leading-relaxed text-sm flex-1"
                                                        placeholder="Write your announcement here..."
                                                        value={notifyForm.message}
                                                        onChange={e => setNotifyForm({ ...notifyForm, message: e.target.value })}
                                                    />
                                                    <div className="flex justify-between items-center text-xs text-slate-400 px-1 pt-1">
                                                        <span>Supports basic HTML tags</span>
                                                        <span>{notifyForm.message.length} chars</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-6">
                                                <button
                                                    type="submit"
                                                    disabled={sending}
                                                    className={`relative overflow-hidden h-11 px-8 rounded-lg !text-white font-bold shadow-lg shadow-black/10 transition-all duration-300 flex items-center justify-center ${sending ? '!bg-black opacity-80 cursor-wait' : '!bg-black hover:!bg-slate-800 hover:scale-[1.02] hover:shadow-black/20'
                                                        }`}
                                                >
                                                    <span className="relative z-10 flex items-center gap-3">
                                                        {sending ? "Dispatching..." : "Send Broadcast"}
                                                        {!sending && <Send className="w-5 h-5" />}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Notification Result Modal */}
            <AnimatePresence>
                {
                    showNotificationResultModal && notificationResult && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setShowNotificationResultModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${notificationResult.success ? "bg-black" : "bg-red-50"}`}>
                                        {notificationResult.success ? (
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500 translate-x-0.5" />
                                        ) : (
                                            <AlertCircle className="w-8 h-8 text-red-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {notificationResult.success ? "Success!" : "Notice"}
                                        </h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            {notificationResult.message}
                                        </p>
                                    </div>
                                    <div className="w-full mt-4">
                                        <Button
                                            className="w-full h-12 rounded-xl !bg-black hover:!bg-slate-800 text-white border-none shadow-lg shadow-slate-900/20 font-semibold"
                                            onClick={() => setShowNotificationResultModal(false)}
                                        >
                                            {notificationResult.success ? "Done" : "Close"}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {
                    showLogoutConfirm && (
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
                                            Are you sure you want to end your session? You'll need to sign in again.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !bg-black !text-white hover:!bg-neutral-800 border-none font-semibold shadow-md"
                                            onClick={() => setShowLogoutConfirm(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performLogout}
                                        >
                                            Yes, Sign Out
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Delete Store Confirmation Modal */}
            <AnimatePresence>
                {
                    storeToDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setStoreToDelete(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
                                        <Trash2 className="w-8 h-8 text-red-500 translate-x-0.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Delete Store?</h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            Are you sure you want to permanently delete <span className="font-semibold text-slate-900">"{storeToDelete.name}"</span>?
                                            <br />
                                            <span className="text-xs text-red-500 mt-1 block">This action cannot be undone.</span>
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                            onClick={() => setStoreToDelete(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performDeleteStore}
                                        >
                                            Yes, Delete
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Suspend/Activate Store Confirmation Modal */}
            <AnimatePresence>
                {
                    storeToToggle && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setStoreToToggle(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${storeToToggle.isActive ? "bg-amber-50" : "bg-black"}`}>
                                        {storeToToggle.isActive ? (
                                            <Lock className="w-8 h-8 text-amber-500" />
                                        ) : (
                                            <Activity className="w-8 h-8 text-emerald-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {storeToToggle.isActive ? "Suspend Store?" : "Activate Store?"}
                                        </h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            Are you sure you want to {storeToToggle.isActive ? "suspend" : "activate"} access for <span className="font-semibold text-slate-900">"{storeToToggle.name}"</span>?
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                            onClick={() => setStoreToToggle(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performToggleStore}
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Delete Supplier Confirmation Modal */}
            <AnimatePresence>
                {
                    supplierToDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setSupplierToDelete(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
                                        <Trash2 className="w-8 h-8 text-red-500 translate-x-0.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Delete Supplier?</h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            Are you sure you want to permanently delete <span className="font-semibold text-slate-900">"{supplierToDelete.name}"</span>?
                                            <br />
                                            <span className="text-xs text-red-500 mt-1 block">This action cannot be undone.</span>
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                            onClick={() => setSupplierToDelete(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performDeleteSupplier}
                                        >
                                            Yes, Delete
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Suspend/Activate Supplier Confirmation Modal */}
            <AnimatePresence>
                {
                    supplierToToggle && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setSupplierToToggle(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${supplierToToggle.isActive ? "bg-amber-50" : "bg-black"}`}>
                                        {supplierToToggle.isActive ? (
                                            <Lock className="w-8 h-8 text-amber-500" />
                                        ) : (
                                            <Activity className="w-8 h-8 text-emerald-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {supplierToToggle.isActive ? "Suspend Supplier?" : "Activate Supplier?"}
                                        </h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            Are you sure you want to {supplierToToggle.isActive ? "suspend" : "activate"} access for <span className="font-semibold text-slate-900">"{supplierToToggle.name}"</span>?
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                            onClick={() => setSupplierToToggle(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performToggleSupplier}
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Delete User Confirmation Modal */}
            <AnimatePresence>
                {
                    userToDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setUserToDelete(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
                                        <Trash2 className="w-8 h-8 text-red-500 translate-x-0.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Delete User?</h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            Are you sure you want to permanently delete <span className="font-semibold text-slate-900">"{userToDelete.name}"</span>?
                                            <br />
                                            <span className="text-xs text-red-500 mt-1 block">This action cannot be undone.</span>
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                            onClick={() => setUserToDelete(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performDeleteUser}
                                        >
                                            Yes, Delete
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Convert User to Supplier Confirmation Modal */}
            <AnimatePresence>
                {
                    userToConvert && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setUserToConvert(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-2">
                                        <ArrowRightLeft className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Convert to Supplier?</h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            Are you sure you want to upgrade <span className="font-semibold text-slate-900">"{userToConvert.name}"</span> to a Supplier account?
                                            <br />
                                            <span className="text-xs text-indigo-500 mt-1 block">They will gain access to supplier features.</span>
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                            onClick={() => setUserToConvert(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performConvertUser}
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
            {/* Suspend/Activate User Confirmation Modal */}
            <AnimatePresence>
                {
                    userToToggle && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                                onClick={() => setUserToToggle(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 ${userToToggle.isActive ? "bg-amber-50" : "bg-black"}`}>
                                        {userToToggle.isActive ? (
                                            <Lock className="w-8 h-8 text-amber-500" />
                                        ) : (
                                            <Activity className="w-8 h-8 text-emerald-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {userToToggle.isActive ? "Suspend User?" : "Activate User?"}
                                        </h3>
                                        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                            Are you sure you want to {userToToggle.isActive ? "suspend" : "activate"} access for <span className="font-semibold text-slate-900">"{userToToggle.name}"</span>?
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                                        <Button
                                            variant="outline"
                                            className="h-12 cursor-pointer rounded-xl !border-black !text-black hover:!bg-slate-50 !bg-white font-semibold"
                                            onClick={() => setUserToToggle(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="h-12 cursor-pointer rounded-xl !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20 font-semibold"
                                            onClick={performToggleUser}
                                        >
                                            Confirm
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* General Feedback / Alert Modal */}
            <AnimatePresence>
                {feedback.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center"
                        >
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Notification</h3>
                            <p className="text-slate-500 mb-6">{feedback.message}</p>
                            <Button
                                onClick={() => setFeedback({ ...feedback, show: false })}
                                className="w-full h-12 cursor-pointer rounded-xl !bg-black !text-white hover:!bg-slate-800 font-bold"
                            >
                                Close
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Dock Navigation */}
            < div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col justify-center pointer-events-none" >
                <div className="pointer-events-auto">
                    <Dock direction="vertical" panelHeight={60} magnification={70} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl dark:bg-white/80">
                        {NAV_ITEMS.map((item) => (
                            <DockItem key={item.tab} onClick={() => setActiveTab(item.tab as any)}>
                                <DockLabel>{item.label}</DockLabel>
                                <DockIcon>
                                    <item.icon className={`w-6 h-6 transition-colors duration-300 ${activeTab === item.tab ? item.color : 'text-slate-400'}`} />
                                </DockIcon>
                            </DockItem>
                        ))}
                    </Dock>
                </div>
            </div >
        </div >
    );
};

export default SuperAdminDashboard;
