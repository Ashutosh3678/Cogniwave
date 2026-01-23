import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    Store
} from "lucide-react";

export const Sidebar = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const links = [
        { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
        { name: "Inventory", path: "/dashboard/inventory", icon: Package },
        { name: "Sales (POS)", path: "/dashboard/sales", icon: ShoppingCart },
        { name: "Suppliers", path: "/dashboard/suppliers", icon: Users },
    ];

    return (
        <div className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-10">
            <div className="p-6 flex items-center gap-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
                    <Store size={20} />
                </div>
                <span className="font-bold text-lg text-slate-800">SynapStore</span>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const active = isActive(link.path);
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                                    ? "bg-black text-emerald-600 font-medium"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            <link.icon size={20} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                    <Settings size={20} />
                    Settings
                </Link>
            </div>
        </div>
    );
};
