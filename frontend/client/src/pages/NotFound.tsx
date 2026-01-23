
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
             <div className="text-center">
                <h1 className="text-9xl font-bold text-gray-200">404</h1>
                <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
                <p className="text-gray-600 mt-2 mb-8">
                    The page <code>{location.pathname}</code> does not exist or you do not have permission to view it.
                </p>
                <Link 
                    to="/" 
                    className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition shadow-lg shadow-slate-900/30"
                >
                    Return Home
                </Link>
             </div>
        </div>
    );
};

export default NotFound;
