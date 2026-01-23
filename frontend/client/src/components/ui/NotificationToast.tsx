import { AnimatePresence, motion } from "framer-motion";
import { X, Bell, ExternalLink } from "lucide-react";
// React imports removed, assuming implicit React environment or not needed


export interface Notification {
  id: string;
  title: string;
  message: string;
  image?: string;
  link?: string; // or buttons
  timestamp: number;
}

interface ToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationToastContainer = ({ notifications, onDismiss }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="pointer-events-auto w-80 bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                {n.image ? (
                  <img src={n.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">{n.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{n.message}</p>
                  
                  {n.link && (
                    <a 
                      href={n.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => onDismiss(n.id)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="h-1 w-full bg-slate-50">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-indigo-500/30"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
