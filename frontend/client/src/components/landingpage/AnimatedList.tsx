import React, { useState, useEffect } from "react";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ShoppingCart,
  Zap,
  Upload,
  FileSpreadsheet,
  Receipt,
  Download,
  Bell,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Data ---
const notifications = [
  {
    name: "Low Stock Alert",
    description: "Paracetamol 500mg - Only 12 units remaining",
    time: "2m ago",
    icon: AlertTriangle,
    color: "bg-red-500",
    textColor: "text-red-500",
    badge: "Urgent",
  },
  {
    name: "Expiry Warning",
    description: "Amoxicillin capsules expiring in 15 days",
    time: "5m ago",
    icon: Clock,
    color: "bg-amber-500",
    textColor: "text-amber-500",
    badge: "Action Required",
  },
  {
    name: "Order Received",
    description: "New shipment of 150 items processed",
    time: "8m ago",
    icon: Package,
    color: "bg-black",
    textColor: "text-emerald-500",
    badge: "Success",
  },
  {
    name: "Sales Transaction",
    description: "₹2,450 sale completed - 8 items sold",
    time: "12m ago",
    icon: ShoppingCart,
    color: "bg-teal-600",
    textColor: "text-teal-600",
    badge: "Completed",
  },
  {
    name: "Auto-Reorder",
    description: "Metformin tablets reordered automatically",
    time: "15m ago",
    icon: Zap,
    color: "bg-cyan-500",
    textColor: "text-cyan-500",
    badge: "Automated",
  },
  {
    name: "Inventory Sync",
    description: "Stock levels synced across 3 locations",
    time: "18m ago",
    icon: CheckCircle2,
    color: "bg-black",
    textColor: "text-emerald-600",
    badge: "Synced",
  },
];

const uploadSteps = [
  { label: "Uploading file", icon: Upload },
  { label: "Parsing data", icon: FileSpreadsheet },
  { label: "Validating entries", icon: CheckCircle2 },
  { label: "Syncing inventory", icon: Package },
  { label: "Finalizing", icon: Download },
];

const receiptItems = [
  { name: "Paracetamol 500mg", qty: 2, price: 45 },
  { name: "Amoxicillin Cap", qty: 1, price: 180 },
  { name: "Vitamin D3", qty: 3, price: 240 },
  { name: "Cetirizine 10mg", qty: 2, price: 30 },
  { name: "N95 Masks", qty: 5, price: 50 },
  { name: "Hand Sanitizer", qty: 1, price: 120 },
  { name: "Cough Syrup", qty: 1, price: 85 },
  { name: "Surgical Gloves", qty: 2, price: 150 },
  { name: "Alcohol Swabs", qty: 10, price: 5 },
  { name: "Bandages", qty: 5, price: 20 },
  { name: "Digital Thermometer", qty: 1, price: 280 },
  { name: "Face Shield", qty: 2, price: 95 },
  { name: "Multivitamins", qty: 1, price: 450 },
];

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-xl", className)}>
    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 opacity-50" />
    <div className="relative z-10 h-full p-6">{children}</div>
  </div>
);

const ExcelUploadCard = () => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStep(Math.floor((progress / 100) * uploadSteps.length));
  }, [progress]);

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-2xl text-emerald-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Bulk Import</h3>
            <p className="text-sm text-slate-500">Inventory_Data.csv</p>
          </div>
        </div>
        <div className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
          {progress}%
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {uploadSteps.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={i} className="flex items-center gap-4">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300",
                  isDone ? "bg-black text-white" : isActive ? "bg-black text-emerald-600" : "bg-slate-100 text-slate-400"
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  isActive || isDone ? "text-slate-800" : "text-slate-400"
                )}
              >
                {s.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="ml-auto w-2 h-2 bg-black rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-black rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Card>
  );
};

const NotificationCard = () => {
  // Initialize with stable uniqueIds
  const [items, setItems] = useState(() =>
    notifications.slice(0, 4).map((item, i) => ({
      ...item,
      uniqueId: `${item.name}-${i}-${Date.now()}`
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const newNotification = notifications[Math.floor(Math.random() * notifications.length)];
        const uniqueKey = `${newNotification.name}-${Date.now()}`;

        // Remove first, add new to end to simulate stream
        if (next.length >= 5) next.shift();
        next.push({ ...newNotification, uniqueId: uniqueKey });
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-full bg-slate-50/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <Bell className="w-5 h-5 text-slate-600" />
        </div>
        <h3 className="font-bold text-slate-900">Live Updates</h3>
      </div>

      <div className="space-y-3 overflow-hidden relative h-[400px]">
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none" />

        <AnimatePresence mode="popLayout">
          {items.map((item: any) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              key={item.uniqueId}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  item.color,
                  "text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
                  <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug truncate">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};

const RevenueCard = () => {
  const total = receiptItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  return (
    <Card className="flex flex-col justify-between overflow-visible">
      {/* Floating Receipt Effect */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mx-auto w-full max-w-[280px]"
      >
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-sm">Receipt</span>
          </div>
          <span className="text-xs opacity-70">#INV-8493</span>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            {receiptItems.map((item, i) => (
              <div key={i} className="flex justify-between text-xs text-slate-600">
                <span>{item.name} <span className="text-slate-400">x{item.qty}</span></span>
                <span className="font-medium text-slate-900">₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-slate-100" />
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900">Total Paid</span>
            <span className="text-lg font-bold text-emerald-600">₹{total}</span>
          </div>
        </div>
        {/* Torn paper effect bottom */}
        <div className="h-3 bg-white w-full" style={{ maskImage: "radial-gradient(circle at 10px bottom, transparent 6px, black 0)", maskSize: "20px 10px", maskRepeat: "repeat-x", maskPosition: "bottom" }} />
      </motion.div>

      {/* Background Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
          <div className="text-2xl font-bold text-slate-900">₹14.2k</div>
          <div className="text-xs text-slate-500">Daily Revenue</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <ShoppingCart className="w-5 h-5 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-slate-900">849</div>
          <div className="text-xs text-slate-500">Transactions</div>
        </div>
      </div>
    </Card>
  );
};

export default function AnimatedInventoryShowcase() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">

        <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4 fill-amber-400 text-amber-500" />
            Live System Demo
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            Watch your pharmacy <span className="text-emerald-600">come alive</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the power of real-time synchronization. From bulk uploads to instant sales tracking, everything happens in the blink of an eye.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[600px]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <ExcelUploadCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="h-full"
          >
            <NotificationCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="h-full"
          >
            <RevenueCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
