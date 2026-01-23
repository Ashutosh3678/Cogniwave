import { Timeline } from "@/components/ui/timeline";
import { Package, TrendingUp, Bell } from "lucide-react";

export default function HowItWorks() {
  const data = [
    {
      title: "Connect your catalog",
      icon: <Package className="w-5 h-5 text-brand-primary" />,
      content: (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold text-brand-primary px-3 py-1 bg-brand-pale rounded-full border border-brand-primary/20">Step 01</span>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Start by effortlessly digitizing your entire pharmacy inventory. Whether you have hundreds of SKUs or thousands, our system makes onboarding a breeze.
            Simply scan barcodes using any standard scanner or your mobile device, upload existing CSV spreadsheets to migrate data in bulk, or manually add specialized items with ease.
            <br /><br />
            Our smart categorization engine automatically sorts medicines by type, therapeutic class, and storage requirements (like cold chain), saving you hours of manual tagging.
            Once connected, you can immediately set customized reorder points for every product, ensuring you never order too much or too little.
            Say goodbye to the chaos of scattered spreadsheets and welcome a centralized, digital source of truth for your stock.
          </p>
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-slate-900 mb-2 text-lg">Sync in minutes, not days</h4>
            <ul className="list-disc pl-5 space-y-2 text-slate-500">
              <li>Universal barcode scanning support</li>
              <li>One-click bulk CSV import</li>
              <li>Auto-categorization A.I.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Set your availability",
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      content: (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold text-emerald-600 px-3 py-1 bg-black rounded-full border border-emerald-200">Step 02</span>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Gain a God's-eye view of your operations. Our platform mirrors your physical shelves in real-time digital twins.
            Track exact batch numbers to manage FEFO (First-Expired, First-Out) logic automatically, preventing costly expired stock losses.
            Monitor stock positions across multiple locations or branches from a single dashboard.
            <br /><br />
            See instantly which items are your best-sellers and which are gathering dust ("dead stock").
            Visual heatmaps and live status indicators show you exactly where your capital is tied up, allowing you to optimize your shelf space and cash flow dynamically.
            It’s not just counting boxes; it’s understanding the pulse of your pharmacy business.
          </p>
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-slate-900 mb-2 text-lg">Live Operational Dashboard</h4>
            <ul className="list-disc pl-5 space-y-2 text-slate-500">
              <li>Real-time batch & expiry tracking</li>
              <li>Multi-location inventory sync</li>
              <li>Dead stock & fast-mover analysis</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Meet demand",
      icon: <Bell className="w-5 h-5 text-purple-600" />,
      content: (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold text-purple-600 px-3 py-1 bg-purple-50 rounded-full border border-purple-200">Step 03</span>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Shift from reactive firefighting to proactive growth. Our system uses historical data to predict future demand trends, alerting you *before* you run out of critical medicines.
            Receive smart purchase recommendations that you can approve in one click, generating purchase orders instantly.
            <br /><br />
            Protect your patient trust by ensuring essential meds are always in stock.
            Get notified about approaching expiries well in advance so you can discount or return them.
            Automate your procurement cycle to reduce overheads and focus on what matters most: patient care and business expansion.
          </p>
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-semibold text-slate-900 mb-2 text-lg">Intelligent Automation</h4>
            <ul className="list-disc pl-5 space-y-2 text-slate-500">
              <li>Predictive low-stock notifications</li>
              <li>Automated Purchase Order generation</li>
              <li>Patient demand forecasting</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Timeline data={data} />
    </div>
  );
}
