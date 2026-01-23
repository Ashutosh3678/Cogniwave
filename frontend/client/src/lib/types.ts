export interface User {
    id: string;
    username: string;
    email: string;
    globalRole?: string | null;
    imageUrl?: string | null;
    isverified?: boolean;
    isActive?: boolean;
    createdAt?: string;
}

export interface Store {
    id: string;
    name: string;
    slug: string;
    timezone?: string | null;
    currency?: string | null;
    settings?: any;
    roles?: string[];
    isActive?: boolean;
    createdAt?: string;
    users?: Array<{ userId: string; user?: { email: string } }>;
}

export interface AuthResponse {
    token: string;
    user: User;
    effectiveStore: Store | null;
    needsStoreSetup?: boolean;
    needsStoreSelection?: boolean;
    stores?: Array<{ role: string; store: Store }>;
}

export interface Medicine {
    id: string;
    brandName: string;
    genericName?: string | null;
    sku?: string | null;
    category?: string | null;
    strength?: string | null;
    dosageForm?: string | null;
    uom?: string | null;
    isActive: boolean;
    // Extras for frontend
    price?: number;
    stock?: number;
}

export interface InventoryBatch {
    id: string;
    medicineId: string;
    batchNumber: string;
    qtyAvailable: number;
    expiryDate?: string | null;
    receivedAt?: string | null;
    medicine?: Medicine;
}

export interface SaleItem {
    id: string;
    medicineId: string;
    qty: number;
    unitPrice?: number;
    lineTotal?: number;
    medicine?: Medicine;
}

export interface Sale {
    id: string;
    totalValue: number;
    subtotal?: number;
    tax?: number;
    discounts?: number;
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod?: string;
    createdAt: string;
    items: SaleItem[];
    createdBy?: { id: string; username: string };
}

export interface Supplier {
    id: string;
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string | null;
    userId?: string | null;
    isActive?: boolean;
    user?: { id: string; email: string; username: string };
    defaultLeadTime?: number;
    defaultMOQ?: number;
}

// Mock types for missing features
export type MockMedicineCreate = Omit<Medicine, "id" | "isActive"> & { price: number };
export type MockBatchCreate = { medicineId: string; batchNumber: string; expiry: string; qty: number; cost: number };

export interface SupplierRequest {
    id: string;
    supplierId: string;
    storeId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "FULFILLED";
    message?: string;
    createdAt: string;
    updatedAt: string;
    supplier?: Supplier;
    store?: Store;
    createdById?: string;
    payload?: any;
}

export interface AdminStats {
    counts: {
        users: number;
        stores: number;
        medicines: number;
        batches: number;
        reorders: number;
        uploads: number;
    };
    recentActivity: any[];
}

export interface UploadSupplierParams {
    storeSlug: string;
    supplierId?: string;
    file: File;
}

export interface SupplierUploadResponse {
    upload_id: string;
    status: string;
    message: string;
    details?: any;
}
