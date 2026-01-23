import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const faqsData = [
  {
    question: "How does SynapStore track inventory in real-time?",
    answer:
      "SynapStore uses advanced barcode scanning and RFID technology to track every medicine movement instantly. Our system updates inventory levels across all locations in real-time, ensuring you always have accurate stock information.",
  },
  {
    question:
      "Can I integrate SynapStore with my existing pharmacy management system?",
    answer:
      "Yes! SynapStore offers robust API integrations with major pharmacy management systems, POS systems, and accounting software. Our team can help you set up seamless data synchronization.",
  },
  {
    question: "What happens when stock levels get low?",
    answer:
      "SynapStore automatically sends smart alerts via email, SMS, or in-app notifications when medicines approach reorder points. You can customize alert thresholds for each product and set up automatic reorder suggestions.",
  },
  {
    question: "Is my pharmacy data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption, comply with HIPAA regulations, and maintain SOC 2 Type II certification. Your data is stored securely and backed up daily with 99.9% uptime guarantee.",
  },
  {
    question: "How long does it take to set up SynapStore?",
    answer:
      "Most pharmacies are up and running within 24-48 hours. Our onboarding team helps you import existing inventory, set up alerts, and train your staff. No technical expertise required.",
  },
  {
    question: "Can I track multiple pharmacy locations?",
    answer:
      "Yes! SynapStore supports multi-location inventory management. Track stock across all your branches, transfer medicines between locations, and get consolidated reports for your entire pharmacy network.",
  },
];

const Faq = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="relative py-24 overflow-hidden bg-background-page"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-highlight/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-pale border border-brand-primary/20 text-brand-primary-dark text-sm font-medium mb-6"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Got questions?</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-brand-text mb-4"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-brand-text-muted"
          >
            Everything you need to know about{" "}
            <span className="font-semibold text-brand-primary">SynapStore</span>
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqsData.map((faq, index) => {
            const isOpen = openFaq === index;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className={cn(
                  "group relative overflow-hidden rounded-2xl transition-all duration-300",
                  "bg-white/60 backdrop-blur-xl border hover:bg-white/80",
                  isOpen
                    ? "border-brand-primary/50 shadow-lg shadow-brand-primary/5"
                    : "border-brand-border shadow-sm hover:border-brand-primary/30"
                )}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-8 py-6 flex items-start gap-4 justify-between text-left"
                >
                  <span className={cn(
                    "text-lg font-semibold transition-colors duration-300",
                    isOpen ? "text-brand-primary-dark" : "text-brand-text"
                  )}>
                    {faq.question}
                  </span>

                  <span className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 shrink-0",
                    isOpen
                      ? "bg-brand-primary text-white border-brand-primary rotate-180"
                      : "bg-transparent text-brand-text-muted border-brand-border group-hover:border-brand-primary group-hover:text-brand-primary"
                  )}>
                    <ChevronDown className="w-5 h-5" />
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-8 pb-8 pt-0">
                        <p className="text-brand-text-muted leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
