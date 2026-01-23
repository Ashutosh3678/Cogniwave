
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useSetRecoilState } from "recoil";
import { authState } from "../state/auth";

const UserDashboard = () => {
    const { user } = useAuthContext();
    const setAuth = useSetRecoilState(authState);
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("synapstore:auth");
        localStorage.removeItem("auth:encUser");
        setAuth({
            token: null,
            user: null,
            effectiveStore: null,
            needsStoreSetup: false,
            needsStoreSelection: false,
            suppliers: [],
            supplierId: null,
        });
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center border-b border-slate-700 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Account</h1>
                        <p className="text-slate-400">Welcome, {user?.username || user?.email}</p>
                    </div>
                    <button 
                        onClick={logout}
                        className="px-4 py-2 border border-slate-600 rounded hover:bg-slate-800 transition"
                    >
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-lg font-semibold mb-2">Profile Details</h2>
                        <div className="space-y-2 text-sm text-slate-300">
                            <p><span className="text-slate-500">Email:</span> {user?.email}</p>
                            <p><span className="text-slate-500">User ID:</span> {user?.id}</p>
                            <p><span className="text-slate-500">Role:</span> {user?.globalRole || "Regular User"}</p>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-lg font-semibold mb-4">Actions</h2>
                        <p className="text-sm text-slate-400 mb-4">
                            You currently do not have a store set up.
                        </p>
                        <button
                            onClick={() => navigate("/store/create")}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        >
                            Create a Store
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
