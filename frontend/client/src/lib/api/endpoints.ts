import { client } from "./client";
import axios from "axios";
import type { User, AuthResponse, Store, Supplier, SupplierRequest, AdminStats } from "../types";


// --- Auth ---
export const authApi = {
    register: (data: { username: string; email: string; password: string }) =>
        client.post("/auth/register", data),

    signin: (data: { email: string; password: string }) =>
        client.post<AuthResponse>("/auth/signin", data),

    verifyOtp: (data: { email: string; otp: string }) =>
        client.post("/auth/verify-otp", data),

    resendOtp: (data: { email: string }) =>
        client.post("/auth/resend-otp", data),
};

// --- Store ---
export const storeApi = {
    create: (data: { name: string; slug: string; timezone?: string; currency?: string }) =>
        client.post<{ success: boolean; effectiveStore: Store }>("/store/create", data),
};

// --- Dashboard ---
export const dashboardApi = {
    getStore: () => client.get<{ success: boolean; data: { user: User; store: Store; roles: string[] } }>("api/v1/dashboard/store"),
    getBootstrap: (params?: any) => client.get<{ success: boolean; data: any }>("api/v1/dashboard/bootstrap", { params }),
    getFeaturedMedicine: () => client.get<{ success: boolean; data: { medicine: any } }>("api/v1/dashboard/featured-medicine"),
    checkSlugAvailability: (slug: string) => client.get<{ success: boolean; data: { available: boolean } }>(`api/v1/dashboard/check-slug/${slug}`),

    // Supplier Requests (Store Owner View)
    getSupplierRequests: () => client.get<{ success: boolean; data: SupplierRequest[] }>("api/v1/dashboard/supplier-requests"),
    acceptSupplierRequest: (id: string) => client.post<{ success: boolean; message: string }>(`api/v1/dashboard/${id}/accept`),
    rejectSupplierRequest: (id: string) => client.post<{ success: boolean; message: string }>(`api/v1/dashboard/${id}/reject`),
    createSupplierRequest: (data: { supplierId: string; message?: string }) => client.post<{ success: boolean; data: SupplierRequest }>("api/v1/dashboard/supplier-requests", data),
    disconnectSupplier: (supplierId: string) => client.delete<{ success: boolean; message: string }>(`api/v1/dashboard/suppliers/${supplierId}`),
    suppliersDirectory: (q?: string) => client.get<{ success: boolean; data: { suppliers: any[] } }>("api/v1/dashboard/suppliers-directory", { params: { q } }),
    getInventory: (params?: { q?: string; limit?: number; filter?: string; return?: boolean }) => client.get<{ success: boolean; data: { inventory: any[] } }>("api/v1/dashboard/inventory", { params }),
    getReorderSuggestions: () => client.get<{ success: boolean; data: { suggestions: any[] } }>("api/v1/dashboard/reorder-suggestions"),
    getReturnSuggestions: () => client.get<{ success: boolean; data: { returns: any[] } }>("api/v1/dashboard/return-suggestions"),
    reorder: (data: { supplierId: string; items: any[]; note?: string; type?: "REORDER" | "RETURN" }) => client.post<{ success: boolean; data: { request: SupplierRequest } }>("api/v1/dashboard/reorder", data),
    createReturn: (data: { supplierId: string; items: any[]; note?: string }) => client.post<{ success: boolean; data: { request: SupplierRequest } }>("api/v1/dashboard/return", data),
    searchMedicines: (q: string) => client.get<{ success: boolean; data: { medicines: any[] } }>("api/v1/dashboard/medicines/search", { params: { q } }),
    checkoutSale: (items: { medicineId: string; qty: number }[], paymentMethod?: string) => client.post("api/v1/dashboard/sales/checkout", { items, paymentMethod }, { responseType: 'blob' }),
    getReceipts: () => client.get<{ success: boolean; data: { receipts: any[] } }>("api/v1/dashboard/receipts"),
    getReceiptPDF: (id: string) => client.get(`api/v1/dashboard/receipts/${id}/pdf`, { responseType: 'blob' }),
    sendReceiptEmail: (id: string, email: string) => client.post(`api/v1/dashboard/receipts/${id}/email`, { email, saleId: id }),
    getInventoryForecast: (data: { store_id: string; medicine_id: string; horizon_days: number[] }) =>
        axios.post("https://anandvelpuri-zenith.hf.space/forecast/inventory", data, { headers: { 'Content-Type': 'application/json' } }),
};

// --- Suppliers ---
export const suppliersApi = {
    listGlobal: (q?: string) => client.get<{ success: boolean; data: { suppliers: Supplier[] } }>("api/v1/supplier-requests/global", { params: { q } }),
    createGlobal: (data: Partial<Supplier>) => client.post<{ success: boolean; data: { supplier: Supplier } }>("api/v1/supplier-requests/global", data),

    getDiscoveryStores: () => client.get<{ success: boolean; data: { stores: Store[] } }>("api/v1/supplier-requests/discovery"),
    createRequest: (data: { storeId: string; supplierId: string; message?: string }) => client.post<{ success: boolean; data: { request: SupplierRequest } }>("api/v1/supplier-requests", data),
    getDetails: (supplierId?: string) => client.get<{ success: boolean; data: { supplier: Supplier & { supplierStores?: { store: Store }[] }; requests: SupplierRequest[] } }>("api/v1/supplier-requests", { params: { supplierId } }),
    acceptRequest: (requestId: string) => client.post<{ success: boolean; message: string }>(`api/v1/supplier-requests/requests/${requestId}/accept`),
    rejectRequest: (requestId: string, reason?: string) => client.post<{ success: boolean; message: string }>(`api/v1/supplier-requests/requests/${requestId}/reject`, { reason }),
    fulfillRequest: (requestId: string, data: { items: any[] }) => client.post<{ success: boolean; data: any }>(`api/v1/supplier-requests/requests/${requestId}/fulfill`, data),
    disconnectStore: (storeId: string) => client.delete<{ success: boolean; message: string }>(`api/v1/supplier-requests/stores/${storeId}`),
};

// --- Admin ---
export const adminApi = {
    getStats: () => client.get<{ success: boolean; data: AdminStats }>("api/v1/admin/stats"),
    impersonateUser: (userId: string) => client.post<{ success: boolean; data: { token: string; user: User } }>(`api/v1/admin/users/${userId}/impersonate`),

    getStores: (params?: { q?: string; showInactive?: boolean }) => client.get<{ success: boolean; data: { stores: Store[] } }>("api/v1/admin/stores", { params }),
    suspendStore: (storeId: string, isActive: boolean) => client.patch<{ success: boolean; data: { store: Store } }>(`api/v1/admin/stores/${storeId}/suspend`, { isActive }),
    deleteStore: (storeId: string) => client.delete(`api/v1/admin/stores/${storeId}`),

    getSuppliers: (q?: string) => client.get<{ success: boolean; data: { suppliers: Supplier[] } }>("api/v1/admin/suppliers", { params: { q } }),
    suspendSupplier: (supplierId: string, isActive: boolean) => client.patch<{ success: boolean; data: { supplier: Supplier } }>(`api/v1/admin/suppliers/${supplierId}/suspend`, { isActive }),
    deleteSupplier: (supplierId: string) => client.delete(`api/v1/admin/suppliers/${supplierId}`),

    getUsers: (params?: { q?: string; showInactive?: boolean }) => client.get<{ success: boolean; data: { users: User[] } }>("api/v1/admin/users", { params }),
    convertToSupplier: (userId: string) => client.post(`api/v1/admin/users/${userId}/convert-to-supplier`),
    deleteUser: (userId: string) => client.delete(`api/v1/admin/users/${userId}`),
    suspendUser: (userId: string, isActive: boolean) => client.patch<{ success: boolean; data: { user: User } }>(`api/v1/admin/users/${userId}/suspend`, { isActive }),

    getDashboardAnalytics: () => client.get<{ success: boolean; data: any }>("api/v1/admin/dashboard/analytics"),

    sendNotification: (data: { targetRole?: string; targetUserIds?: string[]; type: "SYSTEM" | "EMAIL" | "BOTH"; subject: string; message: string }) =>
        client.post<{ success: boolean; message: string }>("api/v1/admin/notifications/send", data),

    getGraphData: () => client.get<{ success: boolean; data: any }>("api/v1/admin/graph"),
};

// --- Payments ---
export const paymentApi = {
    initiate: (data: { amount: number; email: string; name: string; phone: string; orderId: string }) =>
        client.post<{ success: boolean; data: any }>("api/v1/payments/initiate", data),
};
