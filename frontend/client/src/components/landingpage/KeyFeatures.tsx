import { StickyScroll } from "../ui/sticky-scroll-reveal";
import { CardBody, CardContainer, CardItem } from "../ui/3d-card";

const content = [
  {
    title: "Real-Time Inventory Tracking",
    description:
      "Track every medicine movement instantly with barcode scanning and RFID technology. Get accurate stock levels across all locations in real-time. Our system ensures you never lose sight of your inventory, providing peace of mind and operational efficiency.",
    content: (
      <CardContainer containerClassName="h-full w-full !py-0" className="h-full w-full py-0 block">
        <CardBody className="bg-white/5 relative group/card w-full h-full rounded-2xl border-white/10 border hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
          <CardItem translateZ="50" className="w-full h-full absolute inset-0">
            <div className="h-full w-full flex items-center justify-center text-white relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                alt="Inventory Tracking"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />
            </div>
          </CardItem>

          <CardItem translateZ="80" className="absolute bottom-10 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Track every medicine movement instantly with barcode scanning and RFID technology. Get accurate stock levels across all locations in real-time.
            </p>
          </CardItem>
        </CardBody>
      </CardContainer>
    ),
  },
  {
    title: "Smart Alerts & Notifications",
    description:
      "Automatic notifications when stock falls below critical levels, medicines are expiring, or when it's time to reorder. Stay ahead of supply chain issues and prevent stockouts before they affect your patients.",
    content: (
      <CardContainer containerClassName="h-full w-full !py-0" className="h-full w-full py-0 block">
        <CardBody className="bg-white/5 relative group/card w-full h-full rounded-2xl border-white/10 border hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
          <CardItem translateZ="50" className="w-full h-full absolute inset-0">
            <div className="h-full w-full flex items-center justify-center text-white relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=2070&auto=format&fit=crop"
                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                alt="Smart Alerts"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />
            </div>
          </CardItem>
          <CardItem translateZ="80" className="absolute bottom-10 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Alerts</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Automatic notifications when stock falls below critical levels. Stay ahead of supply chain issues and prevent stockouts before they affect your patients.
            </p>
          </CardItem>
        </CardBody>
      </CardContainer>
    ),
  },
  {
    title: "Advanced Analytics",
    description:
      "Comprehensive reports and insights on inventory patterns, sales trends, and stock turnover. Make data-driven decisions to optimize your purchasing and reduce waste. Visualize your pharmacy's performance like never before.",
    content: (
      <CardContainer containerClassName="h-full w-full !py-0" className="h-full w-full py-0 block">
        <CardBody className="bg-white/5 relative group/card w-full h-full rounded-2xl border-white/10 border hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
          <CardItem translateZ="50" className="w-full h-full absolute inset-0">
            <div className="h-full w-full flex items-center justify-center text-white relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                alt="Analytics"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />
            </div>
          </CardItem>
          <CardItem translateZ="80" className="absolute bottom-10 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Advanced Analytics</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              comprehensive reports and insights on inventory patterns. Make data-driven decisions to optimize your purchasing and reduce waste.
            </p>
          </CardItem>
        </CardBody>
      </CardContainer>
    ),
  },
  {
    title: "HIPAA Compliant & Secure",
    description:
      "Enterprise-grade security with encryption, regular backups, and compliance with healthcare regulations. Your data (and your patients' data) is safe, protected, and private at all times.",
    content: (
      <CardContainer containerClassName="h-full w-full !py-0" className="h-full w-full py-0 block">
        <CardBody className="bg-white/5 relative group/card w-full h-full rounded-2xl border-white/10 border hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
          <CardItem translateZ="50" className="w-full h-full absolute inset-0">
            <div className="h-full w-full flex items-center justify-center text-white relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                alt="Security"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />
            </div>
          </CardItem>
          <CardItem translateZ="80" className="absolute bottom-10 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Secure & Compliant</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Enterprise-grade security with encryption and regular backups. Your data is safe, protected, and private at all times.
            </p>
          </CardItem>
        </CardBody>
      </CardContainer>
    ),
  },
  {
    title: "Lightning Fast Performance",
    description:
      "Built for speed with instant search, quick barcode scanning, and seamless multi-user access. Designed to keep up with the fast-paced environment of modern pharmacies without slowing you down.",
    content: (
      <CardContainer containerClassName="h-full w-full !py-0" className="h-full w-full py-0 block">
        <CardBody className="bg-white/5 relative group/card w-full h-full rounded-2xl border-white/10 border hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
          <CardItem translateZ="50" className="w-full h-full absolute inset-0">
            <div className="h-full w-full flex items-center justify-center text-white relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop"
                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                alt="Performance"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />
            </div>
          </CardItem>
          <CardItem translateZ="80" className="absolute bottom-10 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Built for speed with instant search and quick barcode scanning. Designed to keep up with the fast-paced environment of modern pharmacies.
            </p>
          </CardItem>
        </CardBody>
      </CardContainer>
    ),
  },
  {
    title: "Multi-Location Support",
    description:
      "Manage inventory across multiple pharmacy locations from a single dashboard. Transfer stock between locations easily and get a unified view of your entire organization's inventory health.",
    content: (
      <CardContainer containerClassName="h-full w-full !py-0" className="h-full w-full py-0 block">
        <CardBody className="bg-white/5 relative group/card w-full h-full rounded-2xl border-white/10 border hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
          <CardItem translateZ="50" className="w-full h-full absolute inset-0">
            <div className="h-full w-full flex items-center justify-center text-white relative overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop"
                className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                alt="Multi-Location"
              />
              <div className="absolute inset-0 bg-black/20 group-hover/card:bg-black/40 transition-colors" />
            </div>
          </CardItem>
          <CardItem translateZ="80" className="absolute bottom-10 left-8 right-8 p-6 bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Multi-Location</h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Manage inventory across multiple pharmacy locations from a single dashboard. Transfer stock between locations easily.
            </p>
          </CardItem>
        </CardBody>
      </CardContainer>
    ),
  },
];

const KeyFeatures = () => {
  return (
    <section id="features" className="pt-24 pb-0 relative bg-background-page">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-border to-transparent" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-0 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-0 w-96 h-96 bg-brand-highlight/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
            Everything you need to manage inventory
          </h2>
          <p className="text-xl text-brand-text-muted max-w-2xl mx-auto">
            Powerful features designed for modern pharmacies
          </p>
        </div>

        <StickyScroll content={content} />
      </div>
    </section>
  );
};

export default KeyFeatures;
