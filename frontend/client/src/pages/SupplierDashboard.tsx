import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, clearAuthState } from "../state/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package, Calendar,
    Search, Send, Clock, CheckCircle, XCircle,
    LogOut, LayoutGrid, User, ShoppingBag, Inbox, Upload,
    Store as StoreIcon, Phone, MapPin, Building, Download, FileSpreadsheet, RefreshCw, X, History, Info, Loader2
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { suppliersApi } from "../lib/api/endpoints";
import { SupplierService } from "../lib/api/supplierService";
import type { Store, SupplierRequest } from "../lib/types";
import { Dock, DockIcon, DockItem, DockLabel } from "../components/ui/dock";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Components ---



const RequestBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "ACCEPTED":
            return <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Connected</div>;
        case "REJECTED":
            return <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-200"><XCircle className="w-3.5 h-3.5" /> Rejected</div>;
        case "FULFILLED":
            return <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Fulfilled</div>;
        default:
            return <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</div>;
    }
};

// --- Main Component ---

const SupplierDashboard: React.FC = () => {
    const auth = useRecoilValue(authState);
    const setAuth = useSetRecoilState(authState);
    const navigate = useNavigate();

    // Fix for crash: Redirect immediately if no user and stop rendering the rest
    useEffect(() => {
        if (!auth.token || !auth.user) {
            navigate("/login");
        }
    }, [auth.token, auth.user, navigate]);

    if (!auth.token || !auth.user) {
        return null; // Or a loading spinner
    }

    const [activeTab, setActiveTab] = useState<"dashboard" | "marketplace" | "requests" | "orders" | "history" | "my-stores" | "profile" | "upload">("dashboard");
    const [loading, setLoading] = useState(false);
    const [uploadStatusMessage, setUploadStatusMessage] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isConnecting, setIsConnecting] = useState(false);

    // Data
    const [isScrolled, setIsScrolled] = useState(false);
    const [stores, setStores] = useState<Store[]>([]);
    const [requests, setRequests] = useState<SupplierRequest[]>([]);
    const [connectedStores, setConnectedStores] = useState<Store[]>([]);
    const [imgError, setImgError] = useState(false);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: "",
        contactName: "",
        phone: "",
        address: "",
        defaultLeadTime: 0,
        defaultMOQ: 0
    });

    // Check if we have an existing profile to load
    useEffect(() => {
        if (auth.suppliers && auth.suppliers.length > 0) {
            const s = auth.suppliers[0];
            setProfileForm(prev => ({ ...prev, name: s.name }));
            // We'd ideally fetch the full details here if they aren't in auth state
        }
    }, [auth.suppliers]);

    // State to track if we've already done an initial load
    const [dataLoaded, setDataLoaded] = useState(false);

    // ... Forms ...
    const [requestMessage, setRequestMessage] = useState("");
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const currentSupplier = auth.suppliers && auth.suppliers.length > 0 ? auth.suppliers[0] : null;

    // Fulfill Modal State
    const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
    const [requestToFulfill, setRequestToFulfill] = useState<SupplierRequest | null>(null);
    const [fulfillItems, setFulfillItems] = useState<any[]>([]);

   

  
    const [historyDetailRequest, setHistoryDetailRequest] = useState<SupplierRequest | null>(null);
    const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string; subtext?: string } | null>(null);
    const [profileResult, setProfileResult] = useState<{ success: boolean; message: string; subtext?: string } | null>(null);

    // Order Action States
    const [actionLoading, setActionLoading] = useState<string | null>(null); // Stores ID of item being processed
    const [actionResult, setActionResult] = useState<{ type: 'success' | 'error', message: string, title: string } | null>(null);

    // Disconnect Modal State
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
    const [storeToDisconnect, setStoreToDisconnect] = useState<string | null>(null);

    // Reject Modal State
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [requestToReject, setRequestToReject] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleSubmitFulfillment = async () => {
        if (!requestToFulfill) return;
        try {
            const isReturn = requestToFulfill.payload?.type === 'RETURN';

            // Validate only if REORDER
            if (!isReturn && fulfillItems.some(i => !i.batchNumber || !i.expiryDate)) {
                setActionResult({ type: 'error', title: 'Validation Error', message: "Please provide Batch Number and Expiry Date for all items." });
                alert("Please provide Batch Number and Expiry Date for all items.");
                return;
            }

            setActionLoading("FULFILL");
            // For Returns, we can send empty items or just the items as confirmation.
            // The backend schema allows optional items.
            const res = await suppliersApi.fulfillRequest(requestToFulfill.id, { items: fulfillItems });

            if (res.data.success) {
                setFulfillModalOpen(false);
                setRequestToFulfill(null);
                setFulfillItems([]);
                setActionResult({
                    type: 'success',
                    title: isReturn ? 'Return Processed' : 'Order Accepted',
                    message: isReturn
                        ? 'The return request has been marked as processed.'
                        : 'The order has been successfully accepted and inventory is being processed.'
                });
                refreshData();
            }
        } catch (err: any) {
            console.error(err);
            setActionResult({
                type: 'error',
                title: 'Submission Failed',
                message: err.message || "Failed to fulfill request."
            });
        } finally {
            setActionLoading(null);
        }
    };

    // --- REFACTORED DATA FETCHING ---
    // This replaces fetchData to center data handling and cache response
    const refreshData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Main Supplier Details (Requests, Orders, Connected Stores, Profile)
            if (currentSupplier?.id) {
                const res = await suppliersApi.getDetails(currentSupplier.id);
                if (res.data.success) {
                    const supData = res.data.data.supplier;
                    const requestsData = res.data.data.requests;

                    setRequests(requestsData || []);

                    if (supData?.supplierStores) {
                        setConnectedStores(supData.supplierStores.map((s: any) => s.store));
                    }

                    // Populate profile form if needed (only if fields are empty to avoid overwriting user edits in progress?)
                    // Actually, usually we overwrite on refresh.
                    if (supData) {
                        setProfileForm({
                            name: supData.name || "",
                            contactName: supData.contactName || "",
                            phone: supData.phone || "",
                            address: supData.address || "",
                            defaultLeadTime: supData.defaultLeadTime || 0,
                            defaultMOQ: supData.defaultMOQ || 0
                        });
                    }
                }
            }

            // 2. Fetch Marketplace (Stores) - Always fetch on refresh if we are on that tab OR if we want to cache everything
            // Let's only fetch if on marketplace or if stores empty
            if (activeTab === 'marketplace' || stores.length === 0) {
                const resStores = await suppliersApi.getDiscoveryStores();
                if (resStores.data.success) setStores(resStores.data.data.stores);
            }

            setDataLoaded(true);

        } catch (err) {
            console.error("Refresh error", err);
        } finally {
            setLoading(false);
        }
    };

    // UseEffect: Initial Load only if needed
    useEffect(() => {
        if (!currentSupplier) return;

        // If data never loaded, load it.
        if (!dataLoaded) {
            refreshData();
        }
    }, [currentSupplier, dataLoaded]);

    // Note: Removed tab-specific refetch to ensure caching as requested.
    // Users must click the Refresh button for new data.

    // ... (rest of code) ...

    <input
        type="file"
        accept=".csv, .xlsx, .xls"
        disabled={!selectedStore}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-50"
        onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (!currentSupplier) {
                setActionResult({ type: 'error', title: 'Profile Required', message: "Please create a supplier profile first." });
                return;
            }
            if (!selectedStore) {
                setActionResult({ type: 'error', title: 'Select Store', message: "Please select a target store first." });
                return;
            }
            try {
                setLoading(true);
                // 1. Upload File
                const uploadRes = await SupplierService.uploadFile({
                    storeSlug: selectedStore.slug,
                    supplierId: currentSupplier.id,
                    file
                });

                const uploadId = (uploadRes as any).upload_id;
                if (!uploadId) throw new Error("No upload ID returned");

                // 2. Poll for Status
                // We will poll every 2 seconds for a max of 2 minutes (60 attempts)
                let status = "PENDING";
                let attempts = 0;
                const maxAttempts = 60;

                // Simple inline polling
                // We utilize the detailed status object: { status, progressPercent, processedRows, totalRows, phase }
                while (status !== "APPLIED" && status !== "FAILED" && attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 2000)); // Wait 2s

                    const statusObj = await SupplierService.getUploadStatus(uploadId);

                    // Extract status string
                    status = statusObj.status;

                    // Update UI Feedback
                    if (typeof statusObj.progressPercent === 'number') {
                        setUploadProgress(statusObj.progressPercent);
                    }

                    // Construct a helpful message
                    let msg = `Status: ${status}`;
                    if (statusObj.phase) msg += ` - ${statusObj.phase}`;
                    if (statusObj.totalRows > 0) {
                        msg += ` (${statusObj.processedRows} / ${statusObj.totalRows} rows)`;
                    }
                    setUploadStatusMessage(msg);

                    console.log(`Upload ${uploadId} poll:`, statusObj);
                    attempts++;
                }

                if (status !== 'APPLIED') {
                    throw new Error(`Upload processing failed or timed out. Final Status: ${status}`);
                }

                // 3. Success -> Proceed
                // IF this upload was to accept a pending order
                if (pendingAcceptRequestId) {
                    try {
                        const acceptRes = await suppliersApi.acceptRequest(pendingAcceptRequestId);
                        if (acceptRes.data.success) {
                            setActionResult({ type: 'success', title: 'Order Fulfilled', message: `Order Fulfilled & Accepted! Inventory Updated (ID: ${uploadId})` });
                            setPendingAcceptRequestId(null);
                            setActiveTab("orders");
                            refreshData();
                        } else {
                            setActionResult({ type: 'error', title: 'Database Error', message: "Inventory Uploaded & Applied, but failed to update order status in local DB." });
                        }
                    } catch (acceptErr: any) {
                        console.error(acceptErr);
                        setActionResult({ type: 'error', title: 'Accept Error', message: `Inventory Uploaded & Applied, but failed to accept order: ${acceptErr.message}` });
                    }
                } else {
                    setActionResult({ type: 'success', title: 'Upload Successful', message: `Upload successful and applied! ID: ${uploadId}` });
                }

            } catch (err: any) {
                console.error(err);
                setActionResult({ type: 'error', title: 'Upload Failed', message: "Upload processing failed: " + (err.message || "Unknown error") });
            } finally {
                setLoading(false);
                e.target.value = "";
            }
        }}
    />

    const handleDisconnectStore = (storeId: string) => {
        setStoreToDisconnect(storeId);
        setDisconnectModalOpen(true);
    };

    const confirmDisconnect = async () => {
        if (!storeToDisconnect) return;
        try {
            const res = await suppliersApi.disconnectStore(storeToDisconnect);
            if (res.data.success) {
                setConnectedStores(prev => prev.filter(s => s.id !== storeToDisconnect));
                setDisconnectModalOpen(false);
                setStoreToDisconnect(null);
                setActionResult({
                    type: 'success',
                    title: 'Disconnected',
                    message: 'You have successfully disconnected from the store.'
                });
            }
        } catch (err) {
            console.error("Failed to disconnect", err);
            setActionResult({
                type: 'error',
                title: 'Disconnection Failed',
                message: 'Failed to disconnect store. Please try again.'
            });
            setDisconnectModalOpen(false);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentSupplier) {
            setActionResult({ type: 'error', title: 'Profile Required', message: "You must create a Supplier Profile first! Go to the 'Profile' tab." });
            return;
        }

        if (!selectedStore) return;

        try {
            setIsConnecting(true);
            const res = await suppliersApi.createRequest({
                storeId: selectedStore.id,
                supplierId: currentSupplier.id,
                message: requestMessage
            });
            if (res.data.success) {
                setActionResult({ type: 'success', title: 'Request Sent', message: "Request sent successfully!" });
                setSelectedStore(null);
                setRequestMessage("");
                setActiveTab("requests");
            } else {
                setActionResult({ type: 'error', title: 'Request Failed', message: "Failed to send request: Unknown error" });
            }
        } catch (err: any) {
            setActionResult({ type: 'error', title: 'Error', message: "Error: " + err.message });
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setLoading(true);
            if (!profileForm.name.trim()) {
                setActionResult({ type: 'error', title: 'Validation', message: "Business Name is required" });
                return;
            }

            const res = await suppliersApi.createGlobal({
                name: profileForm.name,
                contactName: profileForm.contactName,
                phone: profileForm.phone,
                address: profileForm.address,
                defaultLeadTime: Number(profileForm.defaultLeadTime),
                defaultMOQ: Number(profileForm.defaultMOQ)
            });

            if (res.data.success) {
                setProfileResult({
                    success: true,
                    message: "Profile Updated",
                    subtext: "Your business details have been successfully saved."
                });

                const supData = res.data.data.supplier;
                if (!currentSupplier) {
                    const newSupplierShort = {
                        id: supData.id,
                        storeId: null, // global supplier
                        name: supData.name,
                        isActive: true
                    };
                    setAuth(prev => ({
                        ...prev,
                        suppliers: [newSupplierShort]
                    }));
                }
            } else {
                setProfileResult({
                    success: false,
                    message: "Update Failed",
                    subtext: "An unknown error occurred while saving your profile."
                });
            }
        } catch (err: any) {
            setProfileResult({
                success: false,
                message: "Update Failed",
                subtext: err.message || "Failed to save profile changes."
            });
        } finally {
            setLoading(false);
        }
    };

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        console.log("Logout clicked");
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        setAuth(clearAuthState());
        navigate("/login");
    };

    const [pendingAcceptRequestId, setPendingAcceptRequestId] = useState<string | null>(null);

    const handleAcceptRequest = async (requestId: string) => {
        const req = requests.find(r => r.id === requestId);

        // If it's a REORDER or RETURN request, open modal to allow editing quantities/batches
        if ((req?.payload?.type === 'REORDER' || req?.payload?.type === 'RETURN') && req.payload.items) {
            setRequestToFulfill(req);

            // Auto-generate batch details
            const defaultExpiry = new Date();
            defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1); // Default to 1 year expiry
            const isoExpiry = defaultExpiry.toISOString().split('T')[0];

            // Pre-fill items from request with payload data or auto-generated for Reorders
            setFulfillItems(req.payload.items.map((i: any) => ({
                medicineId: i.medicineId,
                medicineName: i.medicineName || "Unknown Item",
                quantity: i.quantity,
                batchNumber: i.batchNumber || `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Use existing for Returns
                expiryDate: i.expiryDate || isoExpiry,
                purchasePrice: i.purchasePrice || 0,
                mrp: i.mrp || 0
            })));
            setFulfillModalOpen(true);
            return;
        }

        // Standard Connection Request Accept
        try {
            const res = await suppliersApi.acceptRequest(requestId);
            if (res.data.success) {
                setActionResult({ type: 'success', title: 'Accepted', message: "Request accepted!" });
                // Optimistic update
                setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "ACCEPTED" } : r));
                refreshData();
            }
        } catch (err: any) {
            console.error(err);
            setActionResult({ type: 'error', title: 'Accept Failed', message: "Failed to accept request: " + err.message });
        }
    };

    const handleRejectRequest = (requestId: string) => {
        setRequestToReject(requestId);
        setRejectionReason("");
        setRejectModalOpen(true);
    };

    const submitRejection = async () => {
        if (!requestToReject) return;

        try {
            setActionLoading(requestToReject);
            const res = await suppliersApi.rejectRequest(requestToReject, rejectionReason);
            if (res.data.success) {
                setActionResult({ type: 'success', title: 'Order Rejected', message: 'The order request has been rejected.' });
                setRequests(prev => prev.map(r => r.id === requestToReject ? { ...r, status: "REJECTED" } : r));
                setRejectModalOpen(false);
                setRequestToReject(null);
            }
        } catch (err: any) {
            console.error(err);
            setActionResult({ type: 'error', title: 'Rejection Failed', message: err.message });
        } finally {
            setActionLoading(null);
        }
    };

    // Skeleton Component for Requests
    const RequestSkeleton = () => (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-slate-100 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-100 rounded w-1/4" />
                            <div className="h-3 bg-slate-50 rounded w-1/3" />
                        </div>
                        <div className="w-20 h-6 bg-slate-100 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );



    const pendingCount = requests.filter(r => r.status === "PENDING").length;


    const filteredMarketplaceStores = stores.filter(store =>
        !requests.some(r => r.storeId === store.id && r.status === "PENDING")
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">

            {/* Main Content Area - Full Width */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header
                    className={`fixed top-0 left-0 w-full z-40 pl-28 pr-8
  transition-[background-color,backdrop-filter,box-shadow,border-color]
  duration-500 ease-out
  ${isScrolled
                            ? 'bg-white/60 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'
                            : 'bg-white/0 backdrop-blur-md border-b border-transparent shadow-none'
                        }`}
                >                    <div className="w-full py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <img src="/bgremovedsupplier.png" alt="Supplier Logo" className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                        Supplier Portal
                                    </h1>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {currentSupplier ? currentSupplier.name : "Setup Required"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 relative z-50">
                                {/* Date Display */}
                                <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm text-slate-600 font-medium text-sm">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                </div>



                                {/* Divider */}
                                <div className="hidden md:block h-8 w-px bg-slate-200"></div>

                                {/* User Profile */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-sm font-bold text-slate-800 leading-none">
                                            {currentSupplier ? currentSupplier.name : auth.user?.username || "Supplier"}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mt-1">
                                            Supplier
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-white shadow-md shadow-slate-200/50 overflow-hidden">
                                        {auth.user?.imageUrl && !imgError ? (
                                            <img
                                                key={auth.user.imageUrl}
                                                src={auth.user.imageUrl}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={() => setImgError(true)}
                                            />
                                        ) : (
                                            <span className="text-slate-600 font-bold text-sm">
                                                {(currentSupplier?.name?.charAt(0) || auth.user?.username?.charAt(0) || "S").toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Existing Actions (Refresh & Logout) */}
                                <div className="flex items-center gap-2 ml-2">
                                    <i
                                        onClick={() => refreshData()}
                                        className="h-9 w-9 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm rounded-full flex items-center justify-center cursor-pointer"
                                        title="Refresh Data"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    </i>
                                    <i
                                        onClick={handleLogout}
                                        className="h-9 w-9 bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm rounded-full flex items-center justify-center cursor-pointer"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </i>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main
                    className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 pt-32 pb-32 pl-28 pr-8"
                    onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
                >
                    <div className="w-full">
                        <AnimatePresence mode="wait">

                            {/* DASHBOARD TAB */}
                            {/* DASHBOARD TAB */}
                            {activeTab === "dashboard" && (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-8"
                                >
                                    {/* 1. KPI Cards Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Card 1: Connected Stores */}
                                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <StoreIcon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Store Partners</p>
                                                <div className="text-3xl font-black text-slate-800">{connectedStores.length}</div>
                                            </div>
                                        </div>

                                        {/* Card 2: Pending Requests */}
                                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                                <Inbox className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Requests</p>
                                                <div className="text-3xl font-black text-slate-800">{pendingCount}</div>
                                            </div>
                                        </div>

                                        {/* Card 3: Network Reach */}
                                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                                <ShoppingBag className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Marketplace</p>
                                                <div className="text-3xl font-black text-slate-800">{stores.length}</div>
                                            </div>
                                        </div>

                                        {/* Card 4: Total Users (Placeholder to match Admin Layout, using Profile Status data) */}
                                        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                                            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                                <User className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Supplier Profile</p>
                                                <div className="text-lg font-bold text-slate-800 truncate max-w-[120px]">
                                                    {currentSupplier?.isActive ? "Active" : "Inactive"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Main Content Area */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Chart Section */}
                                        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col h-[420px]">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-800">Connection Activity</h3>
                                                    <p className="text-sm text-slate-500 mt-1">Network growth & request trends</p>
                                                </div>
                                            </div>
                                            <div className="flex-1 w-full min-h-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={(() => {
                                                        const dateMap = new Map();
                                                        for (let i = 6; i >= 0; i--) {
                                                            const d = new Date();
                                                            d.setDate(d.getDate() - i);
                                                            const dateString = d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
                                                            dateMap.set(dateString, 0);
                                                        }
                                                        requests.forEach(r => {
                                                            if (r.createdAt) {
                                                                const d = new Date(r.createdAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
                                                                dateMap.set(d, (dateMap.get(d) || 0) + 1);
                                                            }
                                                        });
                                                        return Array.from(dateMap).map(([date, count]) => ({ date, count }));
                                                    })()}>
                                                        <defs>
                                                            <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis
                                                            dataKey="date"
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            dy={10}
                                                        />
                                                        <YAxis
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            allowDecimals={false}
                                                            dx={-10}
                                                        />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="count"
                                                            stroke="#6366f1"
                                                            strokeWidth={3}
                                                            fillOpacity={1}
                                                            fill="url(#colorRequests)"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Right Side Column */}
                                        <div className="space-y-6">
                                            {/* Recent Inbound List - Imitating "Assets" or "Small List" */}
                                            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col h-[420px]">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-slate-800">Recent Inbound</h3>
                                                    <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium">Live</span>
                                                </div>

                                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                                    {requests.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                                                                <Inbox className="w-6 h-6 text-slate-300" />
                                                            </div>
                                                            <span className="text-sm font-medium">No activity yet</span>
                                                            <p className="text-xs text-slate-400 mt-1 center">Requests will appear here</p>
                                                        </div>
                                                    ) : (
                                                        requests.slice(0, 5).map(req => (
                                                            <div key={req.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group border border-transparent hover:border-slate-100">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${req.status === 'ACCEPTED' ? 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700' : 'bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700'}`}>
                                                                        {req.store?.name?.charAt(0) || "S"}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-slate-800">{req.store?.name}</span>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                                {req.status}
                                                                            </span>
                                                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                {new Date(req.createdAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="!bg-black !text-white hover:!bg-slate-800 rounded-lg group-hover:opacity-100 transition-all font-medium text-xs shadow-md shadow-black/10"
                                                                    onClick={() => {
                                                                        setActiveTab('requests');
                                                                        // Optional: Set a filter or focus on this item
                                                                    }}
                                                                >
                                                                    View
                                                                </Button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <p className="text-xs text-slate-400 font-medium">Total Inbound: <span className="text-slate-900">{requests.length}</span></p>
                                                    <Button size="sm" className="!bg-black !text-white hover:!bg-slate-800 font-semibold text-xs h-9 px-4 rounded-lg shadow-md shadow-black/10" onClick={() => setActiveTab('requests')}>
                                                        See All History &rarr;
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* MARKETPLACE TAB */}
                            {activeTab === "marketplace" && (
                                <motion.div
                                    key="marketplace"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6 mt-2"
                                >
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800">Marketplace</h2>
                                            <p className="text-slate-500">Discover stores and expand your network.</p>
                                        </div>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Search stores..."
                                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="text-center py-12 text-slate-400">Loading marketplace...</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredMarketplaceStores.map(store => (
                                                <div key={store.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all group relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <StoreIcon className="w-12 h-12 text-slate-100 group-hover:text-emerald-50 group-hover:scale-110 transition-transform duration-500" />
                                                    </div>

                                                    <div className="relative z-10">
                                                        <h3 className="text-lg font-bold text-slate-800">{store.name}</h3>
                                                        <p className="text-sm text-slate-500 font-mono mt-1 bg-slate-100 w-fit px-2 py-0.5 rounded text-xs">{store.slug}</p>

                                                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                                                            <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{store.currency}</span>
                                                            <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{store.timezone}</span>
                                                        </div>

                                                        <Button
                                                            className="w-full mt-6 !bg-black !text-white hover:!bg-slate-800 transition-colors shadow-lg shadow-black/20"
                                                            onClick={() => setSelectedStore(store)}
                                                        >
                                                            Connect
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            {filteredMarketplaceStores.length === 0 && (
                                                <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                                    No active stores found for discovery.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* REQUESTS TAB */}
                            {activeTab === "requests" && (
                                <motion.div
                                    key="requests"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full mt-2"
                                >
                                    <div className="flex flex-col gap-6">
                                        {/* Header - Floating Minimal */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                                    <Inbox className="w-6 h-6 text-indigo-500" /> Requests
                                                </h2>
                                                <p className="text-slate-500 mt-1">Manage inbound and outbound store partnerships & return requests</p>
                                            </div>
                                            <div className="flex items-center gap-3">

                                                <div className="relative">
                                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search requests..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm w-64 transition-all"
                                                    />
                                                    {searchQuery && (
                                                        <p
                                                            onClick={() => setSearchQuery("")}
                                                            className="absolute h-5 w-5 right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors !bg-transparent hover:!bg-slate-100"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            {loading ? (
                                                <RequestSkeleton />
                                            ) : (
                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                                    <table className="w-full text-left text-sm">
                                                        <thead className="bg-slate-50/80 border-b border-slate-200 backdrop-blur-sm">
                                                            <tr>
                                                                <th className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Store / Entity</th>
                                                                <th className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Direction</th>
                                                                <th className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Message</th>
                                                                <th className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs">Date</th>
                                                                <th className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs text-center">Status</th>
                                                                <th className="px-6 py-5 font-semibold text-slate-700 uppercase tracking-wider text-xs text-center">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">

                                                            {(() => {
                                                                const filteredRequests = requests.filter(req => {
                                                                    // EXCLUDE reorders explicitly
                                                                    if (req.payload?.type === 'REORDER') return false;

                                                                    if (!searchQuery) return true;
                                                                    const q = searchQuery.toLowerCase();
                                                                    const storeName = req.store?.name || "";
                                                                    const msg = req.message || "";
                                                                    const type = req.payload?.type || "";
                                                                    return storeName.toLowerCase().includes(q) ||
                                                                        msg.toLowerCase().includes(q) ||
                                                                        req.id.toLowerCase().includes(q) ||
                                                                        type.toLowerCase().includes(q);
                                                                });

                                                                if (filteredRequests.length === 0) {
                                                                    return (
                                                                        <tr>
                                                                            <td colSpan={6} className="px-6 py-20 text-center">
                                                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                                    <Inbox className="w-8 h-8 text-slate-300" />
                                                                                </div>
                                                                                <h3 className="text-lg font-medium text-slate-900">No Requests Found</h3>
                                                                                <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                                                                                    {searchQuery ? "No requests match your search query." : "You haven't sent or received any connection requests yet. Check the Marketplace to connect with stores."}
                                                                                </p>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                }

                                                                return filteredRequests.map(req => {
                                                                    const isInbound = req.createdById !== auth.user?.id;
                                                                    const isReturn = req.payload?.type === 'RETURN';
                                                                    const storeName = req.store?.name || (stores.find(s => s.id === req.storeId)?.name) || "Store (" + (req.storeId?.slice(0, 8) || "Unknown") + ")";

                                                                    return (
                                                                        <tr key={req.id} className="group hover:bg-slate-50 transition-colors">
                                                                            <td className="px-6 py-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border ${isReturn ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 border-indigo-200'}`}>
                                                                                        {storeName.charAt(0)}
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <p className="font-semibold text-slate-900">{storeName}</p>
                                                                                            {isReturn && (
                                                                                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-tighter border border-red-200">Return</span>
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="text-xs text-slate-500 font-mono">ID: {req.storeId?.slice(0, 6)}...</p>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4">
                                                                                {isInbound ?
                                                                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border w-fit ${isReturn ? 'text-red-600 bg-red-50 border-red-100' : 'text-blue-600 bg-blue-50 border-blue-100'}`}>
                                                                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isReturn ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                                                        {isReturn ? 'Incoming Return' : 'Incoming Connection'}
                                                                                    </div>
                                                                                    :
                                                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 w-fit">
                                                                                        <Send className="w-3 h-3" /> Outgoing
                                                                                    </div>
                                                                                }
                                                                            </td>
                                                                            <td className="px-6 py-4 max-w-[200px]">
                                                                                {isReturn ? (
                                                                                    <div className="flex flex-col gap-1">
                                                                                        <p className="text-slate-600 text-sm font-bold">
                                                                                            {req.payload?.items?.length || 0} items to return
                                                                                        </p>
                                                                                        <div className="flex flex-wrap gap-1">
                                                                                            {req.payload?.items?.slice(0, 3).map((item: any, i: number) => (
                                                                                                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[120px]">
                                                                                                    {item.medicineName}
                                                                                                </span>
                                                                                            ))}
                                                                                            {(req.payload?.items?.length || 0) > 3 && (
                                                                                                <span className="text-[10px] text-slate-400 font-medium">+{req.payload.items.length - 3} more</span>
                                                                                            )}
                                                                                        </div>
                                                                                        {req.payload?.note && <span className="text-xs text-slate-400 italic mt-0.5 mt-1 border-t border-slate-100 pt-1">"{req.payload.note}"</span>}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="truncate text-slate-500 text-sm" title={req.message || ""}>{req.message || <span className="text-slate-300 italic">No message</span>}</p>
                                                                                )}
                                                                            </td>
                                                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "-"}
                                                                            </td>
                                                                            <td className="px-6 py-4 text-center">
                                                                                <div className="flex justify-center">
                                                                                    <RequestBadge status={req.status} />
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-6 py-4 text-center">
                                                                                {isInbound && req.status === "PENDING" ? (
                                                                                    <div className="flex items-center justify-center gap-2 transition-opacity">
                                                                                        <Button
                                                                                            size="sm"
                                                                                            className="h-8 cursor-pointer shadow-sm !bg-black hover:!bg-slate-800 !text-white border-0 shadow-md shadow-black/10"
                                                                                            onClick={() => handleAcceptRequest(req.id)}
                                                                                        >
                                                                                            {isReturn ? 'Process' : 'Accept'}
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="sm"
                                                                                            className="h-8 !bg-black cursor-pointer !text-white hover:!bg-slate-800 border-none shadow-md shadow-black/10"
                                                                                            onClick={() => handleRejectRequest(req.id)}
                                                                                        >
                                                                                            Reject
                                                                                        </Button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-xs text-slate-400 font-medium">No actions</span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                });
                                                            })()}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === "orders" && (
                                <motion.div
                                    key="orders"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6 mt-2"
                                >
                                    {/* Header - Floating Minimal */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Order Management</h2>
                                            <p className="text-slate-500 text-lg">Process and fulfill incoming stock requests.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search orders..."
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    {/* Orders List */}
                                    <div className="space-y-6">
                                        {(() => {
                                            const filteredRequests = requests.filter(req => {
                                                // Robustly determine request type (using message if payload is missing)
                                                let type = req.payload?.type;

                                                if (!type && req.message && typeof req.message === 'string' && req.message.trim().startsWith('{')) {
                                                    try {
                                                        // Try to parse message as JSON to recover payload
                                                        const parsed = JSON.parse(req.message);
                                                        if (parsed && parsed.type) {
                                                            type = parsed.type;
                                                            // Ensure payload is available for rendering
                                                            if (!req.payload) req.payload = parsed;
                                                        }
                                                    } catch (e) {
                                                        // Not JSON, ignore
                                                    }
                                                }

                                                // Show Reorders/Returns that are NOT fulfilled or rejected yet (Active work)
                                                if (type !== 'REORDER' && type !== 'RETURN') return false;
                                                if (req.status === 'FULFILLED' || req.status === 'REJECTED') return false;

                                                if (!searchQuery) return true;
                                                const q = searchQuery.toLowerCase();
                                                return (req.store?.name?.toLowerCase() || "").includes(q) || req.id.toLowerCase().includes(q);
                                            });
                                            return filteredRequests.length === 0 ? (
                                                <div className="bg-white rounded-xl border border-dashed border-slate-300 p-20 text-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <Inbox className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-slate-900">No Pending Orders</h3>
                                                    <p className="text-slate-500 mt-2">New order requests will appear here.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-6">
                                                    {filteredRequests.map(req => {
                                                        const isPending = req.status === 'PENDING';
                                                        const isAccepted = req.status === 'ACCEPTED';
                                                        const isFulfilled = req.status === 'FULFILLED';

                                                        return (
                                                            <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                                                {/* Order Header */}
                                                                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm group-hover:scale-105 transition-transform">
                                                                            {req.store?.name?.[0] || "S"}
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                                                {req.store?.name || "Unknown Store"}
                                                                                {req.payload?.type === 'RETURN' && (
                                                                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold border border-red-200 uppercase tracking-wide">
                                                                                        Return
                                                                                    </span>
                                                                                )}
                                                                            </h3>
                                                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium font-mono mt-0.5">
                                                                                <span>#{req.id.slice(0, 8)}</span>
                                                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                                <span>{new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-emerald-700 text-[10px] font-bold border border-emerald-100 shadow-sm uppercase tracking-wide">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                                                                            CASH
                                                                        </div>

                                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                            isAccepted ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                                isFulfilled ? 'bg-black text-emerald-700 border-emerald-200' :
                                                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                                            }`}>
                                                                            {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                                                            {isAccepted && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                                            {isFulfilled && <CheckCircle className="w-3.5 h-3.5" />}
                                                                            {req.status}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Order Body */}
                                                                <div className="p-8">
                                                                    {req.payload?.note && (
                                                                        <div className="bg-amber-50/50 text-slate-700 text-sm p-4 rounded-xl mb-8 border border-amber-100 flex gap-3">
                                                                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                                                                            <div>
                                                                                <span className="font-bold text-amber-700 block text-xs mb-1 uppercase tracking-wider">Note from Store</span>
                                                                                "{req.payload.note}"
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center justify-between mb-4">
                                                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                                            {req.payload?.type === 'RETURN' ? (
                                                                                <><RefreshCw className="w-5 h-5 text-red-400" /> Return Items</>
                                                                            ) : (
                                                                                <><Package className="w-5 h-5 text-slate-400" /> Requested Items</>
                                                                            )}
                                                                            <span className="text-slate-400 font-normal">({req.payload?.items?.length || 0})</span>
                                                                        </h4>
                                                                    </div>

                                                                    <div className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden mb-8">
                                                                        <table className="w-full text-sm text-left">
                                                                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                                                                <tr>
                                                                                    <th className="px-6 py-4 text-xs uppercase tracking-wider">Medicine Name</th>
                                                                                    <th className="px-6 py-4 text-right text-xs uppercase tracking-wider">Quantity</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {req.payload?.items?.map((item: any, idx: number) => (
                                                                                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                                                                                        <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-3">
                                                                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                                                                                <Package className="w-4 h-4" />
                                                                                            </div>
                                                                                            {item.medicineName || "Unknown Item"}
                                                                                        </td>
                                                                                        <td className="px-6 py-4 text-right text-slate-900 font-bold font-mono text-base">
                                                                                            {item.quantity}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>

                                                                    <div className="flex justify-end gap-4">
                                                                        {isPending ? (
                                                                            <>
                                                                                <Button onClick={() => handleRejectRequest(req.id)} disabled={actionLoading === req.id} className="!bg-black !text-white hover:!bg-black px-6 min-w-[120px] shadow-lg shadow-black/20">
                                                                                    {actionLoading === req.id ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                                                                    Reject Order
                                                                                </Button>
                                                                                <Button onClick={() => handleAcceptRequest(req.id)} className="!bg-black hover:!bg-slate-800 !text-white px-8 shadow-lg shadow-black/20">
                                                                                    Accept Order
                                                                                </Button>
                                                                            </>
                                                                        ) : isAccepted ? (
                                                                            <></>
                                                                            // <Button onClick={() => openFulfillModal(req)} className={`!bg-black hover:!bg-slate-800 !text-white px-8 shadow-lg shadow-black/20 ${req.payload?.type === 'RETURN' ? '!bg-red-600 hover:!bg-red-700 shadow-red-600/20' : ''}`}>
                                                                            //     {req.payload?.type === 'RETURN' ? 'Process Return' : 'Fulfill Order'}
                                                                            // </Button>
                                                                        ) : (
                                                                            <div className="text-slate-400 italic text-sm">No actions available</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            )}

                            {/* HISTORY TAB - All Order History */}
                            {activeTab === "history" && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6 mt-2"
                                >
                                    {/* Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Order History</h2>
                                            <p className="text-slate-500 text-lg">View all past and current order requests.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    placeholder="Search history..."
                                                    value={searchQuery}
                                                    onChange={e => setSearchQuery(e.target.value)}
                                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    {/* History List */}
                                    <div className="space-y-6">
                                        {(() => {
                                            const filteredRequests = requests.filter(req => {
                                                // Robustly determine request type
                                                let type = req.payload?.type;

                                                if (!type && req.message && typeof req.message === 'string' && req.message.trim().startsWith('{')) {
                                                    try {
                                                        const parsed = JSON.parse(req.message);
                                                        if (parsed && parsed.type) {
                                                            type = parsed.type;
                                                            if (!req.payload) req.payload = parsed;
                                                        }
                                                    } catch (e) { }
                                                }

                                                if (type !== 'REORDER' && type !== 'RETURN') return false;

                                                if (!searchQuery) return true;
                                                const q = searchQuery.toLowerCase();
                                                return (req.store?.name?.toLowerCase() || "").includes(q) || req.id.toLowerCase().includes(q);
                                            });
                                            return filteredRequests.length === 0 ? (
                                                <div className="bg-white rounded-xl border border-dashed border-slate-200 p-20 text-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <History className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-slate-900">No Order History</h3>
                                                    <p className="text-slate-500 mt-2">You have no order history yet.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-6">
                                                    {filteredRequests.map(req => {
                                                        const isPending = req.status === 'PENDING';
                                                        const isAccepted = req.status === 'ACCEPTED';
                                                        const isFulfilled = req.status === 'FULFILLED';

                                                        return (
                                                            <div key={req.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                                                {/* Order Header */}
                                                                <div className="bg-white px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 font-bold shadow-sm group-hover:scale-105 transition-transform">
                                                                            {req.store?.name?.[0] || "S"}
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                                                {req.store?.name || "Unknown Store"}
                                                                                {req.payload?.type === 'RETURN' && (
                                                                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold border border-red-200 uppercase tracking-wide">
                                                                                        Return
                                                                                    </span>
                                                                                )}
                                                                            </h3>
                                                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium font-mono mt-0.5">
                                                                                <span>#{req.id.slice(0, 8)}</span>
                                                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                                <span>{new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-sm ${isPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                            isAccepted ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                                isFulfilled ? 'bg-black text-emerald-700 border-emerald-200' :
                                                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                                            }`}>
                                                                            {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                                                            {isAccepted && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                                            {isFulfilled && <CheckCircle className="w-3.5 h-3.5" />}
                                                                            {req.status}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Order Body - Simplified for History */}
                                                                <div className="px-6 py-4 flex items-center justify-between">
                                                                    <div className="text-sm text-slate-600">
                                                                        {req.payload?.type === 'RETURN' ? (
                                                                            <span className="font-bold text-slate-900 capitalize flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Return Request</span>
                                                                        ) : (
                                                                            <>Requested <span className="font-bold text-slate-900">{req.payload?.items?.length || 0} items</span></>
                                                                        )}

                                                                        {isAccepted ? (
                                                                            <span className="text-emerald-600 font-medium ml-2 inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {req.payload?.type === 'RETURN' ? 'Processed' : 'Fulfilled'}</span>
                                                                        ) : isPending ? (
                                                                            <span className="text-amber-600 font-medium ml-2">Pending</span>
                                                                        ) : (
                                                                            <span className="text-red-500 font-medium ml-2">Rejected</span>
                                                                        )}
                                                                    </div>

                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-xs !bg-black !text-white hover:!bg-slate-800 border-none h-8 shadow-md shadow-black/10"
                                                                        onClick={() => setHistoryDetailRequest(req)}
                                                                    >
                                                                        View Details
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </motion.div>
                            )}
                            {activeTab === "my-stores" && (
                                <motion.div
                                    key="my-stores"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6 mt-2"
                                >
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800">Connected Stores</h2>
                                            <p className="text-slate-500">Manage your active partnerships and store integrations.</p>
                                        </div>
                                        <div className="relative pb-1">
                                            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                {connectedStores.length} Active
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stores Grid */}
                                    {loading ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-48 bg-white border border-slate-100 rounded-xl shadow-sm animate-pulse" />
                                            ))}
                                        </div>
                                    ) : connectedStores.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <StoreIcon className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-medium text-slate-900">No Connected Stores</h3>
                                            <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                                                You haven't connected with any stores yet. Visit the Marketplace to send connection requests.
                                            </p>
                                            <Button
                                                onClick={() => setActiveTab("marketplace")}
                                                className="mt-6 !bg-black !text-white hover:!bg-neutral-800"
                                            >
                                                Browse Marketplace
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {connectedStores.map(store => (
                                                <div key={store.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all group relative overflow-hidden">
                                                    {/* Background Decorative Icon - Matches Marketplace */}
                                                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <StoreIcon className="w-12 h-12 text-slate-100 group-hover:text-blue-50 group-hover:scale-110 transition-transform duration-500" />
                                                    </div>

                                                    <div className="relative z-10">
                                                        <h3 className="text-lg font-bold text-slate-800">{store.name}</h3>
                                                        <p className="text-sm text-slate-500 font-mono mt-1 bg-slate-100 w-fit px-2 py-0.5 rounded text-xs">{store.slug}</p>

                                                        <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                                                            <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{store.currency || "USD"}</span>
                                                            <span className="bg-slate-50 px-2 py-1 rounded border border-slate-100">{store.timezone || "UTC"}</span>
                                                        </div>

                                                        <Button
                                                            className="w-full mt-6 !bg-black !text-white hover:!bg-slate-800 transition-colors shadow-sm"
                                                            onClick={() => handleDisconnectStore(store.id)}
                                                        >
                                                            Disconnect
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* PROFILE TAB */}
                            {activeTab === "profile" && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6 mt-2"
                                >
                                    {/* Header Section */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Supplier Profile</h2>
                                            <p className="text-slate-500 text-lg">Manage your business identity and operational settings.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                onClick={() => setProfileForm({
                                                    name: "",
                                                    contactName: "",
                                                    phone: "",
                                                    address: "",
                                                    defaultLeadTime: 0,
                                                    defaultMOQ: 0
                                                })}
                                                disabled={loading}
                                                className="!bg-black !text-white hover:!bg-black px-6 h-11 rounded-xl font-medium transition-all border-none"
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                onClick={handleSaveProfile}
                                                disabled={loading}
                                                className="!bg-black hover:!bg-slate-800 !text-white shadow-lg shadow-black/20 px-6 h-11 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                                            >
                                                {loading ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>Save Changes</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Business Identity Card - Full Width */}
                                    <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-8">
                                        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                                                <Building className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">Business Details</h3>
                                                <p className="text-slate-400 text-sm">Manage your company identity and logistics settings.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Business Name</label>
                                                <div className="relative">
                                                    <StoreIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        value={profileForm.name}
                                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                                        placeholder="e.g. Acme Supplies Ltd."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Person</label>
                                                <div className="relative">
                                                    <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        value={profileForm.contactName}
                                                        onChange={e => setProfileForm({ ...profileForm, contactName: e.target.value })}
                                                        placeholder="e.g. John Doe"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        value={profileForm.phone}
                                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        placeholder="e.g. +1 (555) 000-0000"
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                                                    />
                                                </div>
                                            </div>

                                            {/* Operations Fields moved here */}
                                            <div className="col-span-2 pt-4 border-t border-slate-50 mt-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Address / HQ</label>
                                                <div className="relative">
                                                    <MapPin className="w-5 h-5 text-slate-400 absolute top-3 left-3" />
                                                    <textarea
                                                        value={profileForm.address}
                                                        onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                                        placeholder="e.g. 123 Industrial Park..."
                                                        rows={2}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 resize-none leading-relaxed"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Lead Time (Days)</label>
                                                <div className="relative">
                                                    <Clock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="number"
                                                        value={profileForm.defaultLeadTime}
                                                        onChange={e => setProfileForm({ ...profileForm, defaultLeadTime: parseInt(e.target.value) || 0 })}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                                    />
                                                </div>

                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Min. Order Qty</label>
                                                <div className="relative">
                                                    <Package className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="number"
                                                        value={profileForm.defaultMOQ}
                                                        onChange={e => setProfileForm({ ...profileForm, defaultMOQ: parseInt(e.target.value) || 0 })}
                                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* UPLOAD TAB */}
                            {activeTab === "upload" && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6 mt-12"
                                >
                                    {/* Header Section */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Bulk Catalog Upload</h2>
                                            <p className="text-slate-500 text-lg">Update your product listings via CSV file upload.</p>
                                        </div>
                                    </div>

                                    {/* Main Content Actions */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Configuration Side */}
                                        <div className="space-y-6">
                                            {/* Store Selector */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                        <StoreIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">Target Store</h3>
                                                        <p className="text-xs text-slate-400">Where these products will go</p>
                                                    </div>
                                                </div>

                                                {loading && connectedStores.length === 0 ? (
                                                    <div className="h-12 w-full bg-slate-100 animate-pulse rounded-lg" />
                                                ) : connectedStores.length === 0 ? (
                                                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
                                                        No connected stores found.
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <select
                                                            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium text-slate-700 appearance-none cursor-pointer"
                                                            value={selectedStore?.id || ""}
                                                            onChange={(e) => {
                                                                const s = connectedStores.find(st => st.id === e.target.value);
                                                                setSelectedStore(s || null);
                                                            }}
                                                        >
                                                            <option value="">Select a Store...</option>
                                                            {connectedStores.map(store => (
                                                                <option key={store.id} value={store.id}>
                                                                    {store.name} ({store.currency})
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Template Downloader */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                                        <FileSpreadsheet className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">Data Template</h3>
                                                        <p className="text-xs text-slate-400">Use correct CSV format</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => SupplierService.downloadTemplate()}
                                                    className="w-full h-11 !bg-black !text-white hover:!bg-slate-800 transition-colors rounded-xl text-sm font-medium shadow-md shadow-black/10"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download CSV Template
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Upload Zone */}
                                        <div className="lg:col-span-2">
                                            <div
                                                className={`h-full min-h-[320px] relative border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center p-8 text-center bg-white ${!selectedStore
                                                    ? 'border-slate-200 opacity-60 cursor-not-allowed bg-slate-50'
                                                    : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/30 cursor-pointer'
                                                    }`}
                                            >
                                                <input
                                                    type="file"
                                                    accept=".csv, .xlsx, .xls"
                                                    disabled={!selectedStore || loading}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-50"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        if (!currentSupplier) {
                                                            setActionResult({ type: 'error', title: 'Profile Required', message: "Please create a supplier profile first." });
                                                            return;
                                                        }
                                                        if (!selectedStore) {
                                                            setActionResult({ type: 'error', title: 'Select Store', message: "Please select a target store first." });
                                                            return;
                                                        }

                                                        let isMounted = true;
                                                        try {
                                                            setLoading(true);
                                                            setUploadProgress(0);
                                                            setUploadStatusMessage("Initiating upload...");

                                                            const uploadRes = await SupplierService.uploadFile({
                                                                storeSlug: selectedStore.slug,
                                                                supplierId: currentSupplier.id,
                                                                file
                                                            });
                                                            const uploadId = (uploadRes as any).upload_id;
                                                            if (!uploadId) throw new Error("No upload ID returned");

                                                            let status = "PENDING";
                                                            let attempts = 0;
                                                            let simulatedProgress = 0;
                                                            const maxAttempts = 60;

                                                            while (status !== "APPLIED" && status !== "FAILED" && attempts < maxAttempts) {
                                                                if (!isMounted) break;
                                                                await new Promise(r => setTimeout(r, 1000)); // Poll every 1s for smoother progress
                                                                try {
                                                                    const statusRes = await SupplierService.getUploadStatus(uploadId);
                                                                    status = statusRes.status;

                                                                    // Use backend progress if available, otherwise simulate
                                                                    if (typeof statusRes.progress === 'number' && statusRes.progress > 0) {
                                                                        setUploadProgress(statusRes.progress);
                                                                    } else {
                                                                        // Simulate progress: advance 5-15% per tick, cap at 90%
                                                                        simulatedProgress = Math.min(simulatedProgress + 5 + Math.random() * 10, 90);
                                                                        setUploadProgress(simulatedProgress);
                                                                    }

                                                                    setUploadStatusMessage(`Processing: ${status}...`);

                                                                    if (status === "APPLIED") {
                                                                        setUploadProgress(100);
                                                                        // Small delay to let user see 100%
                                                                        await new Promise(r => setTimeout(r, 500));
                                                                        setUploadResult({
                                                                            success: true,
                                                                            message: "Catalog Upload Successful",
                                                                            subtext: `${statusRes.rows_processed || 0} products have been processed and added to your store.`
                                                                        });
                                                                    } else if (status === "FAILED") {
                                                                        setUploadResult({
                                                                            success: false,
                                                                            message: "Upload Failed",
                                                                            subtext: statusRes.error || "An unknown error occurred while processing your file."
                                                                        });
                                                                    }
                                                                } catch (err) {
                                                                    console.error("Polling error", err);
                                                                }
                                                                attempts++;
                                                            }
                                                        } catch (error) {
                                                            console.error("Upload flow error:", error);
                                                            setUploadResult({
                                                                success: false,
                                                                message: "Upload Initiation Failed",
                                                                subtext: "Could not start the upload process. Please check your network connection."
                                                            });
                                                        } finally {
                                                            if (isMounted) {
                                                                setLoading(false);
                                                                setUploadStatusMessage("");
                                                                setUploadProgress(0);
                                                                e.target.value = "";
                                                            }
                                                        }
                                                    }}
                                                />

                                                {/* Upload UI Content */}
                                                <div className="relative z-10 pointer-events-none space-y-4 w-full flex flex-col items-center">
                                                    {loading ? (
                                                        <div className="flex flex-col items-center justify-center animate-in fade-in duration-300">
                                                            <div className="relative w-32 h-32 mb-4">
                                                                <svg className="w-full h-full transform -rotate-90">
                                                                    <circle
                                                                        cx="64"
                                                                        cy="64"
                                                                        r="56"
                                                                        stroke="currentColor"
                                                                        strokeWidth="8"
                                                                        fill="none"
                                                                        className="text-slate-100"
                                                                    />
                                                                    <circle
                                                                        cx="64"
                                                                        cy="64"
                                                                        r="56"
                                                                        stroke="currentColor"
                                                                        strokeWidth="8"
                                                                        fill="none"
                                                                        className="text-indigo-600 transition-all duration-500 ease-out"
                                                                        strokeDasharray={351.86}
                                                                        strokeDashoffset={351.86 - (351.86 * uploadProgress) / 100}
                                                                        strokeLinecap="round"
                                                                    />
                                                                </svg>
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <span className="text-2xl font-bold text-slate-700">{Math.round(uploadProgress)}%</span>
                                                                </div>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-slate-800 mb-1">Processing Data</h3>
                                                            <p className="text-slate-500 text-sm font-medium">{uploadStatusMessage || "Please wait..."}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-2 transition-colors duration-300 ${selectedStore ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-300'}`}>
                                                                <Upload className="w-10 h-10" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h3 className={`text-xl font-bold transition-colors ${selectedStore ? 'text-slate-800' : 'text-slate-400'}`}>
                                                                    Drop your products file here
                                                                </h3>
                                                                <p className={`text-sm ${selectedStore ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                    Support for .csv, .xlsx, .xls
                                                                </p>
                                                            </div>
                                                            {selectedStore ? (
                                                                <div className="pt-4">
                                                                    <span className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-200">
                                                                        Select File
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="pt-4">
                                                                    <span className="px-4 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200">
                                                                        Select a store first
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence >
                    </div >
                </main >

                {/* Order History Details Modal */}
                {
                    historyDetailRequest && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 overflow-hidden max-h-[90vh] flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800">Order Details</h3>
                                        <p className="text-sm text-slate-500 font-mono">#{historyDetailRequest.id}</p>
                                    </div>
                                    <button onClick={() => setHistoryDetailRequest(null)} className="p-2 cursor-pointer !bg-black hover:!bg-slate-800 rounded-full transition-colors shadow-md shadow-black/10">
                                        <X className="w-5 h-5 !text-white" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                    {/* Order Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Store / Entity</p>
                                            <p className="font-semibold text-slate-800">{historyDetailRequest.store?.name || "Unknown Store"}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date</p>
                                            <p className="font-semibold text-slate-800">
                                                {historyDetailRequest.createdAt
                                                    ? new Date(historyDetailRequest.createdAt).toLocaleString(undefined, {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short'
                                                    })
                                                    : "-"}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <RequestBadge status={historyDetailRequest.status} />
                                            </div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Items</p>
                                            <p className="font-semibold text-slate-800">{historyDetailRequest.payload?.items?.length || 0}</p>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    {historyDetailRequest.payload?.note && (
                                        <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-4 rounded-xl text-sm italic">
                                            <span className="font-bold not-italic block mb-1 text-xs uppercase">Note:</span>
                                            "{historyDetailRequest.payload.note}"
                                        </div>
                                    )}

                                    {/* Items Table */}
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-slate-400" /> Requested Items
                                        </h4>
                                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-3 text-xs uppercase tracking-wider">Medicine Name</th>
                                                        <th className="px-4 py-3 text-xs uppercase tracking-wider">Medicine ID</th>
                                                        <th className="px-4 py-3 text-right text-xs uppercase tracking-wider">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {historyDetailRequest.payload?.items?.map((item: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50">
                                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                                {item.medicineName || "Unknown Item"}
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                                                                {item.medicineId?.slice(0, 8)}...
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-slate-700">
                                                                {item.quantity}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                                    <Button onClick={() => setHistoryDetailRequest(null)} className="!bg-black !text-white hover:!bg-slate-800 shadow-lg shadow-black/20">
                                        Close Details
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }

                {/* Connection Request Modal */}
                {/* Connection Request Modal - Only show if not in upload mode/tab */}
                {
                    selectedStore && activeTab === 'marketplace' && !connectedStores.some(s => s.id === selectedStore.id) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Connect with {selectedStore.name}</h3>
                                        <p className="text-sm text-slate-500">Send a request to start supplying this store.</p>
                                    </div>
                                    <button onClick={() => setSelectedStore(null)} className="p-2 cursor-pointer !bg-black hover:!bg-slate-800 rounded-full transition-colors shadow-md shadow-black/10">
                                        <X className="w-5 h-5 !text-white" />
                                    </button>
                                </div>

                                <form onSubmit={handleConnect}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Message (Optional)</label>
                                        <textarea
                                            rows={4}
                                            value={requestMessage}
                                            onChange={e => setRequestMessage(e.target.value)}
                                            placeholder="Hi, we'd like to supply widgets to your store..."
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button type="button" variant="outline" className="cursor-pointer !border-black !text-black hover:!bg-slate-50 !bg-white" onClick={() => setSelectedStore(null)}>Cancel</Button>
                                        <Button type="submit" disabled={isConnecting} className="cursor-pointer !bg-black hover:!bg-slate-800 !text-white gap-2 border-none shadow-lg shadow-black/20">
                                            {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            {isConnecting ? "Sending..." : "Send Request"}
                                        </Button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )
                }
            </div >

            {/* DOCK NAVIGATION */}
            < div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col justify-center pointer-events-none" >
                <div className="pointer-events-auto">
                    <Dock direction="vertical" panelHeight={60} magnification={70} className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl dark:bg-white/80">
                        <DockItem onClick={() => setActiveTab("dashboard")}>
                            <DockLabel>Dashboard</DockLabel>
                            <DockIcon>
                                <LayoutGrid className={`w-6 h-6 transition-colors ${activeTab === 'dashboard' ? 'text-slate-900 fill-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`} />
                            </DockIcon>
                        </DockItem>

                        <DockItem onClick={() => setActiveTab("marketplace")}>
                            <DockLabel>Marketplace</DockLabel>
                            <DockIcon>
                                <ShoppingBag className={`w-6 h-6 transition-colors ${activeTab === 'marketplace' ? 'text-emerald-600 fill-emerald-600/10' : 'text-slate-400 hover:text-slate-600'}`} />
                            </DockIcon>
                        </DockItem>

                        <DockItem onClick={() => setActiveTab("my-stores")}>
                            <DockLabel>My Stores</DockLabel>
                            <DockIcon>
                                <StoreIcon className={`w-6 h-6 transition-colors ${activeTab === 'my-stores' ? 'text-blue-600 fill-blue-600/10' : 'text-slate-400 hover:text-slate-600'}`} />
                            </DockIcon>
                        </DockItem>

                        <DockItem onClick={() => setActiveTab("requests")}>
                            <DockLabel>Requests</DockLabel>
                            <DockIcon>
                                <Inbox className={`w-6 h-6 transition-colors ${activeTab === 'requests' ? 'text-amber-500 fill-amber-500/10' : 'text-slate-400 hover:text-slate-600'}`} />
                            </DockIcon>
                        </DockItem>

                        <DockItem onClick={() => setActiveTab("orders")}>
                            <DockLabel>Orders</DockLabel>
                            <DockIcon>
                                {/* Show dot if there are pending orders */}
                                <div className="relative">
                                    <Package className={`w-6 h-6 transition-colors ${activeTab === 'orders' ? 'text-indigo-500 fill-indigo-500/10' : 'text-slate-400 hover:text-slate-600'}`} />
                                    {requests.some(r => r.payload?.type === 'REORDER' && r.status === 'PENDING') && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                                    )}
                                </div>
                            </DockIcon>
                        </DockItem>

                        <DockItem onClick={() => setActiveTab("history")}>
                            <DockLabel>History</DockLabel>
                            <DockIcon>
                                <History className={`w-6 h-6 transition-colors ${activeTab === 'history' ? 'text-cyan-500 fill-cyan-500/10' : 'text-slate-400 hover:text-slate-600'}`} />
                            </DockIcon>
                        </DockItem>

                        <DockItem onClick={() => setActiveTab("profile")}>
                            <DockLabel>Profile</DockLabel>
                            <DockIcon>
                                <User className={`w-6 h-6 transition-colors ${activeTab === 'profile' ? 'text-violet-600 fill-violet-600/10' : 'text-slate-400 hover:text-slate-600'}`} />
                            </DockIcon>
                        </DockItem>

                        <DockItem onClick={() => setActiveTab("upload")}>
                            <DockLabel>Upload</DockLabel>
                            <DockIcon>
                                <Upload className={`w-6 h-6 transition-colors ${activeTab === 'upload' ? 'text-blue-500 fill-blue-500/10' : 'text-slate-400 hover:text-slate-600'}`} />
                            </DockIcon>
                        </DockItem>
                    </Dock>
                </div>
            </div >

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {
                    showLogoutConfirm && (
                        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden border border-slate-100"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <LogOut className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Logout</h3>
                                    <p className="text-slate-500 text-sm mb-6">
                                        Are you sure you want to end your session? You will need to sign in again to access your dashboard.
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowLogoutConfirm(false)}
                                            className="flex-1 cursor-pointer !border-black !text-black hover:!bg-slate-50 !bg-white"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={confirmLogout}
                                            className="flex-1 cursor-pointer !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20"
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
            {/* Fulfill Modal */}
            <AnimatePresence>
                {
                    fulfillModalOpen && requestToFulfill && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                            >
                                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {requestToFulfill.payload?.type === 'RETURN' ? 'Process Return' : 'Fulfill Reorder'} #{requestToFulfill.id.slice(0, 6)}
                                        </h2>
                                        <p className="text-sm text-slate-500">Review items and enter batch details. You can adjust quantities.</p>
                                    </div>
                                    <button onClick={() => setFulfillModalOpen(false)} className="p-2 cursor-pointer !bg-black hover:!bg-slate-800 rounded-full transition-colors shadow-md shadow-black/10">
                                        <X className="w-5 h-5 !text-white" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {fulfillItems.map((item, idx) => {
                                        const originalItem = requestToFulfill?.payload?.items?.[idx];
                                        const requestedQty = originalItem?.quantity || 0;
                                        const isPartial = item.quantity < requestedQty;

                                        return (
                                            <div key={idx} className={`p-4 rounded-lg border ${isPartial ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                                                <div className="flex justify-between mb-4">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800">{item.medicineName}</h4>
                                                        <p className="text-xs text-slate-500">Requested Qty: <span className="font-bold">{requestedQty}</span></p>
                                                    </div>
                                                    {isPartial && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded h-fit">Partial Fill</span>}
                                                </div>

                                                {requestToFulfill?.payload?.type === 'RETURN' ? (
                                                    <div className="text-sm text-slate-600 italic">
                                                        Verify receipt of <span className="font-bold text-slate-900">{item.quantity}</span> units.
                                                        <div className="mt-1 text-xs text-slate-400">Batch: {item.batchNumber || "N/A"}</div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 block mb-1">Sending Qty</label>
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => {
                                                                    const newItems = [...fulfillItems];
                                                                    newItems[idx].quantity = parseInt(e.target.value) || 0;
                                                                    setFulfillItems(newItems);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 block mb-1">Batch #</label>
                                                            <input
                                                                type="text"
                                                                value={item.batchNumber}
                                                                onChange={(e) => {
                                                                    const newItems = [...fulfillItems];
                                                                    newItems[idx].batchNumber = e.target.value;
                                                                    setFulfillItems(newItems);
                                                                }}
                                                                placeholder="e.g. B123"
                                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 block mb-1">Expiry</label>
                                                            <input
                                                                type="date"
                                                                value={item.expiryDate}
                                                                onChange={(e) => {
                                                                    const newItems = [...fulfillItems];
                                                                    newItems[idx].expiryDate = e.target.value;
                                                                    setFulfillItems(newItems);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 block mb-1">Price</label>
                                                            <input
                                                                type="number"
                                                                value={item.purchasePrice}
                                                                onChange={(e) => {
                                                                    const newItems = [...fulfillItems];
                                                                    newItems[idx].purchasePrice = parseFloat(e.target.value) || 0;
                                                                    setFulfillItems(newItems);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-slate-500 block mb-1">MRP</label>
                                                            <input
                                                                type="number"
                                                                value={item.mrp}
                                                                onChange={(e) => {
                                                                    const newItems = [...fulfillItems];
                                                                    newItems[idx].mrp = parseFloat(e.target.value) || 0;
                                                                    setFulfillItems(newItems);
                                                                }}
                                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                                    <Button variant="outline" className="cursor-pointer !border-black !text-black hover:!bg-slate-50 !bg-white" onClick={() => setFulfillModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleSubmitFulfillment} disabled={actionLoading === "FULFILL"} className={`cursor-pointer min-w-[150px] !text-white border-none shadow-lg shadow-black/20 ${requestToFulfill?.payload?.type === 'RETURN' ? '!bg-red-600 hover:!bg-red-700' : '!bg-black hover:!bg-slate-800'}`}>
                                        {actionLoading === "FULFILL" ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {requestToFulfill?.payload?.type === 'RETURN' ? 'Confirm Return Processed' : 'Confirm & Send Items'}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Action Result Modal */}
            <AnimatePresence>
                {actionResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${actionResult.type === 'success' ? 'bg-black text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {actionResult.type === 'success' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {actionResult.title}
                            </h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                {actionResult.message}
                            </p>

                            <Button
                                onClick={() => setActionResult(null)}
                                className="w-full h-12 cursor-pointer rounded-xl font-bold !bg-black !text-white hover:!bg-slate-800"
                            >
                                Done
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Upload Result Modal */}
            <AnimatePresence>
                {uploadResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden text-center"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${uploadResult.success ? 'bg-black text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {uploadResult.success ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{uploadResult.message}</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                {uploadResult.subtext}
                            </p>
                            <Button
                                onClick={() => setUploadResult(null)}
                                className="w-full h-12 cursor-pointer rounded-xl font-bold !bg-black !text-white hover:!bg-slate-800 shadow-lg shadow-black/20"
                            >
                                {uploadResult.success ? 'Done' : 'Close'}
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Profile Result Modal */}
            <AnimatePresence>
                {profileResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden text-center"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${profileResult.success ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                                {profileResult.success ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{profileResult.message}</h3>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                {profileResult.subtext}
                            </p>
                            <Button
                                onClick={() => setProfileResult(null)}
                                className="w-full h-12 cursor-pointer rounded-xl font-bold !bg-black !text-white hover:!bg-slate-800 shadow-lg shadow-black/20"
                            >
                                {profileResult.success ? 'Continue' : 'Close'}
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Disconnect Store Confirmation Modal */}
            <AnimatePresence>
                {disconnectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                    <StoreIcon className="w-6 h-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Disconnect Store?</h3>
                                <p className="text-slate-500 text-sm mb-6">
                                    Are you sure you want to disconnect from this store? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setDisconnectModalOpen(false);
                                            setStoreToDisconnect(null);
                                        }}
                                        className="flex-1 cursor-pointer !border-black !text-black hover:!bg-slate-50 !bg-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={confirmDisconnect}
                                        className="flex-1 cursor-pointer !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20"
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Reject Request Confirmation Modal */}
            <AnimatePresence>
                {rejectModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden border border-slate-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-800">Reject Request</h3>
                                <button
                                    onClick={() => setRejectModalOpen(false)}
                                    className="p-2 cursor-pointer !bg-black hover:!bg-slate-800 rounded-full transition-colors shadow-md shadow-black/10"
                                >
                                    <X className="w-5 h-5 !text-white" />
                                </button>
                            </div>

                            <p className="text-slate-500 text-sm mb-4">
                                Are you sure you want to reject this request? You can optionally provide a reason.
                            </p>

                            <textarea
                                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 outline-none resize-none bg-slate-50 mb-6"
                                rows={3}
                                placeholder="Reason for rejection (optional)..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />

                            <div className="flex gap-3 w-full">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setRejectModalOpen(false);
                                        setRequestToReject(null);
                                    }}
                                    className="flex-1 cursor-pointer !border-black !text-black hover:!bg-slate-50 !bg-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitRejection}
                                    disabled={!!actionLoading}
                                    className="flex-1 cursor-pointer !bg-black hover:!bg-slate-800 !text-white border-none shadow-lg shadow-black/20"
                                >
                                    {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Reject
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Action Result / General Alert Modal */}
            <AnimatePresence>
                {actionResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center"
                        >
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${actionResult.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {actionResult.type === 'success' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{actionResult.title}</h3>
                            <p className="text-slate-500 mb-6">{actionResult.message}</p>
                            <Button
                                onClick={() => setActionResult(null)}
                                className="w-full h-12 cursor-pointer rounded-xl !bg-black !text-white hover:!bg-slate-800 font-bold"
                            >
                                Close
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>

    );
};

export default SupplierDashboard;