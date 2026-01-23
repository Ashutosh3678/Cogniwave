import { Star } from "lucide-react";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";

const reviews = [
  {
    name: "Dr. Sarah Johnson",
    role: "Pharmacy Manager, HealthPlus",
    body: "SynapStore has transformed our inventory management. We've reduced stockouts by 75% and improved our order accuracy to 99.9%.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Michael Chen",
    role: "Owner, Downtown Pharmacy",
    body: "The real-time tracking and automated alerts have saved us countless hours. Our team is more efficient and our customers are happier.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Priya Patel",
    role: "Pharmacist, MediCare",
    body: "Integration with our existing systems was seamless. The support team was incredibly helpful throughout the process.",
    rating: 4,
    img: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Robert Wilson",
    role: "Operations Director, PharmaChain",
    body: "The analytics dashboard provides insights we never had before. We've optimized our inventory levels and reduced waste significantly.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    name: "Emily Davis",
    role: "Supply Chain Lead, CureAll",
    body: "Automated PO generation is a game changer. I used to spend hours on spreadsheets, now it takes minues.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    name: "James Rodriguez",
    role: "Tech Lead, QuickMeds",
    body: "API reliability is top notch. We scaled from 10 to 50 locations without a single hiccup in data sync.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    name: "Anita Gupta",
    role: "Inventory Analyst, WellBeing",
    body: "The FEFO tracking has saved us thousands in expired stock losses. It pays for itself.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/women/90.jpg",
  },
  {
    name: "David Kim",
    role: "Regional Manager, CarePoint",
    body: "God's eye view indeed. I can manage 15 stores from my iPad while traveling.",
    rating: 4,
    img: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Lisa Wong",
    role: "Pharma Tech, CityMeds",
    body: "Scanning new shipments is so fast now. The auto-categorization saves me hours every week.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "Marcus Reid",
    role: "Owner, Reid's Pharmacy",
    body: "The investment paid off in month one. Simply avoiding expired stock losses covered the subscription.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    name: "Nina Patel",
    role: "Procurement, HealthFirst",
    body: "Multi-vendor management is finally centralized. I can track supplier performance effortlessly.",
    rating: 4,
    img: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    name: "Tom Baker",
    role: "IT Director, MedSystems",
    body: "Security and uptime were my biggest concerns, but SynapStore has been rock solid since day one.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/men/55.jpg",
  },
  {
    name: "Sophie Clark",
    role: "Pharmacy Lead, GreenCross",
    body: "Patients noticed we never run out of their regulars anymore. That trust is invaluable.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/women/50.jpg",
  },
  {
    name: "Omar Farooq",
    role: "Operations, QuickChemist",
    body: "The mobile interface is intuitive. Even our older staff picked it up in a single afternoon.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/men/60.jpg",
  },
  {
    name: "Rachel Green",
    role: "Store Associate, PrimeCare",
    body: "Inventory counts used to be a nightmare weekend shift. Now we do rolling counts daily in minutes.",
    rating: 5,
    img: "https://randomuser.me/api/portraits/women/28.jpg",
  },
];

const ReviewCard = ({
  img,
  name,
  role,
  body,
  rating,
}: {
  img: string;
  name: string;
  role: string;
  body: string;
  rating: number;
}) => {
  return (
    <div className="h-full bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm border border-white/40 overflow-hidden flex flex-col ring-1 ring-white/50 w-full md:w-[350px]">
      <div className="p-6 flex-1">
        <div className="flex items-center gap-3 mb-4">
          <img
            className="w-12 h-12 rounded-full object-cover border-2 border-white/60 shadow-sm"
            src={img}
            alt={name}
          />
          <div>
            <h4 className="font-medium text-brand-text">{name}</h4>
            <p className="text-sm text-brand-text-muted">{role}</p>
          </div>
        </div>

        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? "text-brand-highlight fill-current" : "text-brand-border"
                }`}
            />
          ))}
        </div>

        <blockquote className="text-brand-text-muted text-sm leading-relaxed">
          "{body}"
        </blockquote>
      </div>

      <div className="px-6 py-4 bg-white/40 border-t border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-pale flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-primary"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span className="text-sm text-brand-text-muted">Verified User</span>
          </div>
          <div className="text-xs text-brand-text-muted/60">Recently</div>
        </div>
      </div>
    </div>
  );
};

export function Testimonials() {
  return (
    <section className="py-12 bg-background-page relative overflow-hidden" id="testimonials">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-brand-primary/5 rounded-full blur-[80px]" />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Pharmacy Professionals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of pharmacies that have transformed their inventory
            management with SynapStore
          </p>
        </div>

        <div className="relative">
          <ThreeDMarquee
            className="h-[400px]"
            items={reviews.map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))} />
        </div>

      </div>
    </section>
  );
}

export default Testimonials;
