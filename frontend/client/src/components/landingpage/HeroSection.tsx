// HeroSection.tsx
import { HeroParallax } from "@/components/ui/hero-parallax";

export const products = [
    {
        title: "Discover Suppliers",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=2069&auto=format&fit=crop",
    },
    {
        title: "Connect with Suppliers",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Accept Requests",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Real-time Tracking",
        link: "#",
        thumbnail: "/realtime-tracking.png",
    },
    {
        title: "Low Stock Alerts",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Receipt Generation",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "FEFO Logic",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1979&auto=format&fit=crop",
    },
    {
        title: "Seamless UX",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Real-time Analytics",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    },
    {
        title: "Secure Database",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Mobile Management",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Compliance Ready",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Auto-Reordering",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Forecasts & Updates",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    },
    {
        title: "Smart Pharmacy",
        link: "#",
        thumbnail:
            "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2070&auto=format&fit=crop",
    },
];

export default function HeroSection() {
    return <HeroParallax products={products} />;
}


