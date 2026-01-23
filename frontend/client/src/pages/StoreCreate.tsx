import { LogOut, Loader2, Building2, Truck, Rocket, ArrowRight, Check, AlertCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authState } from "../state/auth";

import { dashboardApi, storeApi } from "../lib/api/endpoints";



import { DottedSurface } from "../components/ui/dotted-surface";
import { motion, AnimatePresence } from "framer-motion";

const defaultTimezone = "Asia/Kolkata";
const defaultCurrency = "INR";

const StoreCreate = () => {
  const [auth, setAuth] = useRecoilState(authState);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone] = useState(defaultTimezone);
  const [currency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] =
    useState<"STORE_OWNER" | "SUPPLIER" | null>(null);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    // Check if role updated while on this screen
    const checkRole = async () => {
      try {
        const res = await dashboardApi.getStore();
        if (res.data.success) {
          const fetchedUser = res.data.data.user;
          if (auth.user && fetchedUser.globalRole !== auth.user.globalRole) {
            setAuth((prev: any) => ({
              ...prev,
              globalRole: fetchedUser.globalRole,
              user: { ...prev.user, globalRole: fetchedUser.globalRole }
            }));
            if (fetchedUser.globalRole === "SUPPLIER") {
              alert("Access Updated: Congrats you are now a SUPPLIER!");
            }
          }
        }
      } catch (e: any) {
        if (e.code === "no_store_found" && e.details?.user?.globalRole) {
          const fetchedRole = e.details.user.globalRole;
          if (auth.user && fetchedRole !== auth.user.globalRole) {
            setAuth((prev: any) => ({
              ...prev,
              globalRole: fetchedRole,
              user: { ...prev.user, globalRole: fetchedRole }
            }));
            if (fetchedRole === "SUPPLIER") {
              alert("Access Updated: Congrats you are now a SUPPLIER!");
              navigate("/supplier/dashboard", { replace: true });
            }
          }
        }
      }
    };
    if (auth.token) checkRole();
  }, [auth.token, auth.user, navigate, setAuth]);

  useEffect(() => {
    if (!auth.needsStoreSetup && auth.effectiveStore) {
      navigate("/dashboard", { replace: true });
    }
  }, [auth.needsStoreSetup, auth.effectiveStore, navigate]);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slugStatus === 'idle') {
      setSlug(slugify(value));
    }
  };

  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugStatus('idle');
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus('checking');
      try {
        const res = await dashboardApi.checkSlugAvailability(slugify(slug));
        if (res.data.success) {
          setSlugStatus(res.data.data.available ? 'available' : 'taken');
        }
      } catch (err) {
        setSlugStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleLogout = () => {
    setAuth({
      token: null,
      user: null,
      effectiveStore: null,
      needsStoreSetup: false,
      needsStoreSelection: false,
      suppliers: [],
      supplierId: null,
      globalRole: null,
    });
    navigate("/login");
  };

  const createStore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!auth.token) {
      setError("Session expired. Please sign in again.");
      navigate("/login");
      return;
    }

    if (!name.trim()) {
      setError("Store name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Store slug is required.");
      return;
    }

    if (slugStatus === 'taken') {
      setError("Store slug is already in use.");
      return;
    }

    try {
      setLoading(true);

      const res = await storeApi.create({
        name: name.trim(),
        slug: slugify(slug),
        timezone,
        currency,
      });

      if (res.data.success) {
        setAuth({
          ...auth,
          globalRole: "STORE_OWNER",
          user: auth.user ? { ...auth.user, globalRole: "STORE_OWNER" } : null,
          effectiveStore: res.data.effectiveStore,
          needsStoreSetup: false,
        });

        setSuccess("Store created successfully. Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard", { replace: true }), 500);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not create store. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 font-sans relative overflow-hidden">
      <DottedSurface className="z-0 opacity-60" />

      {/* Logout Button - Top Right Fixed */}
      <button
        onClick={handleLogout}
        className="absolute top-8 right-8 z-20 bg-[#45a089] hover:bg-[#347966] hover:scale-105 active:scale-95 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#45a089]/20 transition-all duration-300"
      >
        <span>Logout</span>
        <LogOut className="w-3 h-3" />
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 relative z-10 min-h-[500px]">

        {/* Left Panel: Information */}
        <div className="p-10 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white via-slate-50/30 to-white">
          <div className="mb-8">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 shadow-sm ring-1 ring-emerald-100/50">
              <Rocket className="w-6 h-6 text-[#45a089]" />
            </div>

            <p className="text-[#45a089] text-[10px] font-extrabold tracking-[0.2em] uppercase mb-3 opacity-90">
              ONBOARDING
            </p>

            <h1 className="text-[32px] leading-tight font-bold text-slate-900 mb-4 tracking-tight">
              Create your <span className="text-[#45a089]">first store</span>
            </h1>

            <p className="text-slate-500 text-xs leading-relaxed max-w-xs font-medium">
              We noticed you don't have an active store yet. Set up your first store to start managing inventory, suppliers, and orders from a single unified dashboard.
            </p>
          </div>

          <div className="space-y-3 max-w-xs">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="w-6 h-6 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center text-[10px] font-bold shrink-0 shadow-inner">1</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-600 leading-snug">Store owner role is assigned automatically to your account.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="w-6 h-6 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center text-[10px] font-bold shrink-0 shadow-inner">2</span>
              <div>
                <p className="text-[11px] font-semibold text-slate-600 leading-snug">You can update timezone and currency settings anytime later.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Actions/Form */}
        <div className="p-10 md:p-12 border-l border-slate-100/50 flex flex-col justify-center bg-white/50 relative overflow-hidden">
          
          {/* Status Messages */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 absolute top-8 left-10 right-10 z-30"
              >
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-600 font-medium flex items-center gap-2 shadow-sm">
                    <Check className="w-4 h-4" />
                    {success}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {selectedRole === null ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">How do you want to get started?</h2>
                  <p className="text-slate-500 text-sm">Choose your path to begin your SynapStore journey.</p>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => setSelectedRole("STORE_OWNER")}
                    className="group w-full p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-[#45a089] hover:bg-slate-50 transition-all duration-300 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#45a089] shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#45a089] transition-colors">I want to be a Store Owner</h3>
                      <p className="text-slate-500 text-xs mt-0.5 font-medium group-hover:text-slate-600">Manage inventory, sales, staff and scale your business</p>
                    </div>
                    <div className="pr-2">
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#45a089] transition-colors" />
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedRole("SUPPLIER")}
                    className="group w-full p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-[#45a089] hover:bg-slate-50 transition-all duration-300 text-left flex items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <Truck className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#45a089] transition-colors">I want to be a Supplier</h3>
                      <p className="text-slate-500 text-xs mt-0.5 font-medium group-hover:text-slate-600">Supply premium products to stores in our global network</p>
                    </div>
                    <div className="pr-2">
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#45a089] transition-colors" />
                    </div>
                  </button>
                </div>
              </motion.div>
            ) : selectedRole === "SUPPLIER" ? (
              <motion.div
                key="supplier"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center py-6"
              >
                <div className="w-24 h-24 bg-[#f0fdf4] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-emerald-100/50">
                  <Truck className="w-12 h-12 text-[#45a089]" />
                </div>
                <h2 className="text-[28px] font-bold text-slate-900 mb-3 tracking-tight">Become a Supplier</h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto font-medium">
                  We are manually onboarding premium suppliers to ensure quality. Please contact our support team to get verified and listed in our global directory.
                </p>
                <div className="p-6 bg-slate-50/80 rounded-[2rem] mb-8 border border-slate-100/60 backdrop-blur-sm">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">Official Channel</p>
                  <a href="mailto:contact@synapstore.me" className="text-xl text-[#45a089] font-black hover:underline hover:opacity-80 transition-all">
                    contact@synapstore.me
                  </a>
                </div>
                <button
                  onClick={() => setSelectedRole(null)}
                  className="text-slate-500 hover:text-slate-900 text-xs font-black transition-all flex items-center justify-center gap-2 mx-auto uppercase tracking-widest bg-white px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm active:scale-95"
                >
                  ← Back to selection
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="owner"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={createStore} className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[28px] font-bold text-slate-900 tracking-tight">
                      Store Details
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#45a089] bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all border border-slate-100 hover:border-emerald-200"
                    >
                      Back
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full px-5 py-3.5 bg-white border-2 border-slate-100 rounded-2xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#45a089] focus:ring-4 focus:ring-[#45a089]/10 transition-all text-sm font-bold shadow-sm group-hover:border-slate-200"
                        placeholder="e.g. Sunrise Pharmacy"
                        disabled={loading}
                        autoFocus
                      />
                    </div>

                    <div className="group">
                      <div className="flex justify-start gap-2 mb-1.5 ml-1">
                        <label className="text-slate-700 text-[10px] font-black uppercase tracking-widest">
                          Store Slug
                        </label>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter py-0.5 bg-slate-50 px-1.5 rounded border border-slate-100">URL Safe</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          className={`w-full px-5 py-3.5 bg-slate-50/50 border-2 rounded-2xl text-slate-800 placeholder:text-slate-300 focus:outline-none transition-all font-mono text-xs shadow-inner pr-12 ${
                            slugStatus === 'available' ? 'border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400' :
                            slugStatus === 'taken' ? 'border-red-200 focus:ring-4 focus:ring-red-500/10 focus:border-red-400' :
                            'border-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 focus:bg-white'
                          }`}
                          placeholder="e.g. sunrise-pharmacy"
                          disabled={loading}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                          {slugStatus === 'checking' && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                          {slugStatus === 'available' && <div className="bg-emerald-100 p-1 rounded-full"><Check className="w-3 h-3 text-emerald-600" /></div>}
                          {slugStatus === 'taken' && <div className="bg-red-100 p-1 rounded-full"><AlertCircle className="w-3 h-3 text-red-600" /></div>}
                        </div>
                      </div>
                      <AnimatePresence>
                        {slugStatus === 'taken' && (
                          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold mt-2 ml-1">This slug is already taken. Try another one.</motion.p>
                        )}
                        {slugStatus === 'available' && (
                          <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-emerald-600 font-bold mt-2 ml-1 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Perfect! This unique slug is available.</motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">
                          Timezone
                        </label>
                        <div className="w-full px-5 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-slate-500 text-xs font-bold flex items-center justify-between shadow-sm">
                          {timezone || "Asia/Kolkata"}
                          <div className="w-2 h-2 rounded-full bg-slate-200" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-700 text-[10px] font-black uppercase tracking-widest mb-1.5 ml-1">
                          Currency
                        </label>
                        <div className="w-full px-5 py-3.5 bg-slate-50/80 border-2 border-slate-100 rounded-2xl text-slate-500 text-xs font-bold flex items-center justify-between shadow-sm">
                          {currency} (₹)
                          <div className="w-2 h-2 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || slugStatus === 'checking' || slugStatus === 'taken' || !name.trim() || !slug.trim()}
                      className="w-full !bg-black !text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      {loading ? (
                        <Loader2 className="animate-spin w-5 h-5 relative z-10" />
                      ) : (
                        <>
                          <span className="relative z-10">Launch Store</span>
                          <Rocket className="w-4 h-4 group-hover:rotate-12 transition-transform relative z-10" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-5 font-medium leading-relaxed">
                      By launching this store, you agree to our <span className="text-slate-600 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-600 underline cursor-pointer">Data Privacy Policy</span>.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StoreCreate;
