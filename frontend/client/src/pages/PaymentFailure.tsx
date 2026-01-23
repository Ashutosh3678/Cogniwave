import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, MessageSquare, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const PaymentFailure: React.FC = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error') || 'The transaction could not be processed.';
    const txnid = searchParams.get('txnid');

    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 pointer-events-none" />
            
            <Card className="w-full max-w-lg border-zinc-800 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white tracking-tight">Payment Failed</CardTitle>
                    <CardDescription className="text-zinc-400 text-lg mt-2">
                        We encountered an issue with your payment.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-8">
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-3">
                        <p className="text-red-400 text-center text-sm font-medium">
                            {decodeURIComponent(error)}
                        </p>
                        {txnid && (
                            <div className="pt-2 mt-2 border-t border-red-500/10 flex justify-between items-center text-xs">
                                <span className="text-zinc-500 uppercase tracking-widest">Reference</span>
                                <span className="text-zinc-300 font-mono">{txnid}</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest text-center">Possible Reasons</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                            <div className="p-2 bg-zinc-900 rounded-lg text-center">Insufficient Funds</div>
                            <div className="p-2 bg-zinc-900 rounded-lg text-center">Bank Rejection</div>
                            <div className="p-2 bg-zinc-900 rounded-lg text-center">Network Timeout</div>
                            <div className="p-2 bg-zinc-900 rounded-lg text-center">Invalid Details</div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 px-8 pb-8">
                    <Button asChild className="w-full bg-blue-600 text-white hover:bg-blue-700 h-12 text-base font-semibold">
                        <Link to="/dashboard" className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white h-11 text-xs">
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Back
                        </Button>
                        <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white h-11 text-xs text-nowrap">
                            <MessageSquare className="w-3.5 h-3.5 mr-1 text-nowrap" />
                            Support
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentFailure;
