import React, { useState } from 'react';
import { paymentApi } from '../../lib/api/endpoints';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface PharmacyPaymentProps {
    amount: number;
    email: string;
    name: string;
    phone: string;
    orderId: string;
    payuData?: any;
    onSuccess?: () => void;
    onFailure?: (error: string) => void;
}

const PharmacyPayment: React.FC<PharmacyPaymentProps> = ({
    amount,
    email,
    name,
    phone,
    orderId,
    payuData
}) => {
    const [loading, setLoading] = useState(false);
    const [submissionFields, setSubmissionFields] = useState<Record<string, string> | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);

    React.useEffect(() => {
        if (payuData && !loading && !submissionFields) {
            handlePayment();
        }
    }, [payuData]);

    React.useEffect(() => {
        if (submissionFields && formRef.current) {
            console.log("Preparing PayU submission. Synchronizing DOM...");
            const timer = setTimeout(() => {
                // Request animation frame ensures the browser has painted the 
                // new hidden inputs into the DOM before we trigger the submit.
                requestAnimationFrame(() => {
                    if (formRef.current) {
                        console.log("Submitting form now.");
                        formRef.current.submit();
                        // Since it opens in a new tab, reset the loading state here 
                        // so the user can retry if the popup was blocked.
                        setTimeout(() => setLoading(false), 2000);
                    }
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [submissionFields]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            let currentPayuData = payuData;
            
            if (!currentPayuData) {
                const response = await paymentApi.initiate({
                    amount,
                    email,
                    name,
                    phone,
                    orderId
                });

                if (response.data.success) {
                    currentPayuData = response.data.data;
                } else {
                    throw new Error("Failed to initiate payment");
                }
            }

            if (currentPayuData) {
                // Ensure non-empty mandatory fields (Fallbacks handled by backend now)
                const phoneValue = currentPayuData.phone || "9999999999";
                const firstnameValue = currentPayuData.firstname;

                // All fields required by PayU
                const fields: Record<string, string> = {
                    key: String(currentPayuData.key),
                    txnid: String(currentPayuData.txnid),
                    amount: String(currentPayuData.amount),
                    productinfo: String(currentPayuData.productinfo),
                    firstname: String(firstnameValue),
                    email: String(currentPayuData.email),
                    phone: String(phoneValue),
                    surl: String(currentPayuData.surl),
                    furl: String(currentPayuData.furl),
                    hash: String(currentPayuData.hash),
                    udf1: String(currentPayuData.udf1 || ""),
                    udf2: String(currentPayuData.udf2 || ""),
                    udf3: String(currentPayuData.udf3 || ""),
                    udf4: String(currentPayuData.udf4 || ""),
                    udf5: String(currentPayuData.udf5 || ""),
                    udf6: "",
                    udf7: "",
                    udf8: "",
                    udf9: "",
                    udf10: "",
                    action_url: currentPayuData.action_url
                };

                setSubmissionFields(fields);
            }

        } catch (error: any) {
            console.error("Payment initiation failed", error);
            alert("Something went wrong initializing payment. Please try again.");
            setLoading(false);
        }
    };

    
    return (
        <div className="relative">
            {/* Hidden form for PayU submission */}
            {submissionFields && submissionFields.action_url && (
                <form 
                    ref={formRef} 
                    action={submissionFields.action_url} 
                    method="POST" 
                    target="_blank"
                    encType="application/x-www-form-urlencoded"
                    style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0.01, pointerEvents: 'none', overflow: 'hidden' }}
                >
                    {Object.entries(submissionFields).map(([name, value]) => {
                        if (name === 'action_url') return null;
                        return <input key={name} type="hidden" name={name} value={value} />;
                    })}
                </form>
            )}

            <Card className="w-full max-w-md mx-auto overflow-hidden border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-white">Pharmacy Checkout</CardTitle>
                <CardDescription className="text-zinc-400">
                    Complete your transaction securely via PayU
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <span className="text-zinc-400">Total Amount</span>
                    <span className="text-xl font-bold text-white">₹{Number(amount).toFixed(2)}</span>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Order ID:</span>
                        <span className="text-zinc-300">{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-zinc-500">Customer:</span>
                        <span className="text-zinc-300">{name}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handlePayment} 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-medium transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Opening Secure Link...
                        </>
                    ) : (
                        'Pay Now (Opens Secure Tab)'
                    )}
                </Button>
            </CardFooter>
        </Card>
        </div>
    );
};

export default PharmacyPayment;
