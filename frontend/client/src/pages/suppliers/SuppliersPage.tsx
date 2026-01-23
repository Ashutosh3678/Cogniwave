import { useState, useEffect } from "react";
import { suppliersApi } from "../../lib/api/endpoints";
import type { Supplier } from "../../lib/types";
import { Plus, MapPin, Phone } from "lucide-react";

export const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    // New Supplier Form
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newAddress, setNewAddress] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await suppliersApi.listGlobal();
            setSuppliers(res.data.data.suppliers);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName) return;
        try {
            await suppliersApi.createGlobal({
                name: newName,
                phone: newPhone,
                address: newAddress
            });
            setShowAdd(false);
            setNewName("");
            setNewPhone("");
            setNewAddress("");
            loadData();
        } catch (e) {
            alert("Failed to create supplier");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
                <button
                    onClick={() => setShowAdd(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Supplier
                </button>
            </div>

            {showAdd && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg max-w-lg mx-auto">
                    <h3 className="text-lg font-bold mb-4">New Supplier</h3>
                    <div className="space-y-3">
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Supplier Name *"
                            value={newName} onChange={e => setNewName(e.target.value)}
                        />
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Phone"
                            value={newPhone} onChange={e => setNewPhone(e.target.value)}
                        />
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Address"
                            value={newAddress} onChange={e => setNewAddress(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                        <button onClick={handleCreate} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black">Create Supplier</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suppliers.map(s => (
                    <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                {s.name.charAt(0)}
                            </div>
                            <span className="text-xs font-medium bg-black text-emerald-700 px-2 py-1 rounded-full">Active</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">{s.name}</h3>
                        <div className="space-y-2 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Phone size={14} />
                                {s.phone || "—"}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={14} />
                                {s.address || "—"}
                            </div>
                        </div>
                    </div>
                ))}
                {suppliers.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No suppliers found. Add your first one.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuppliersPage;
