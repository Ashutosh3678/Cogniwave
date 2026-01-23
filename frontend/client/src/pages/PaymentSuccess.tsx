import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const txnid = searchParams.get('txnid');

    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            
            <Card className="w-full max-w-lg border-zinc-800 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                
                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white tracking-tight">Payment Successful!</CardTitle>
                    <CardDescription className="text-zinc-400 text-lg mt-2">
                        Your transaction has been completed successfully.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 px-8">
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500">Transaction ID</span>
                            <span className="text-zinc-200 font-mono bg-zinc-800 px-2 py-0.5 rounded text-xs">{txnid}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500">Status</span>
                            <span className="text-green-500 font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                Confirmed
                            </span>
                        </div>
                    </div>

                    <div className="text-center text-zinc-500 text-sm italic">
                        A confirmation email has been sent to your registered address.
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 px-8 pb-8">
                    <Button asChild className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-semibold">
                        <Link to="/dashboard" className="flex items-center justify-center gap-2">
                            Go to Dashboard
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" className="w-full border-zinc-800 text-zinc-400 hover:text-white h-12">
                        Ask your Store Manager for reciept
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentSuccess;
