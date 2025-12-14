'use client';

import { useState } from 'react';
import axios from 'axios';

interface GooglePayButtonProps {
  orderId: string;
  amount: number;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

export default function GooglePayButton({ orderId, amount, onSuccess, onError }: GooglePayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGooglePay = async () => {
    try {
      setIsProcessing(true);

      // Call backend to process Google Pay
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/google-pay`, {
        orderId,
        amount,
      });

      if (response.data.success) {
        onSuccess(response.data);
      } else {
        onError(response.data.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Google Pay error:', error);
      onError(error.response?.data?.error || 'Google Pay payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleGooglePay}
      disabled={isProcessing}
      className="w-full bg-white border-2 border-gray-300 text-gray-800 rounded-lg px-6 py-4 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      style={{ 
        fontSize: '17px',
        fontFamily: 'Google Sans, Roboto, Arial, sans-serif'
      }}
    >
      {isProcessing ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <>
          <svg width="41" height="17" viewBox="0 0 41 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.526 8.896c-.017 2.668 2.372 3.983 4.188 4.833 1.863.872 2.49 1.43 2.482 2.207-.015 1.19-1.46 1.713-2.813 1.733-2.358.04-3.728-.62-4.818-1.116l-.847 3.868c1.094.49 3.12.918 5.22.936 4.932 0 8.16-2.378 8.177-6.062.018-4.685-6.638-4.945-6.595-7.038.016-.635.636-1.313 1.997-1.486.673-.087 2.53-.154 4.636.794l.826-3.765c-1.132-.402-2.59-.787-4.402-.787-4.642 0-7.906 2.409-7.932 5.862l-.12.02zm19.068-5.635c-.902 0-1.664.515-2.005 1.306l-7.07 16.473h4.93l.98-2.65h6.026l.57 2.65h4.345l-3.793-17.78h-3.983zm.687 4.729l1.347 6.308h-3.898l2.551-6.308zM15.43 3.061L11.12 21.04h4.695L20.124 3.06H15.43zm-6.644 0l-4.87 12.135-.518-2.595-.002-.007C2.724 9.937.89 7.12.89 7.12L5.284 21.04h4.973l7.397-17.98H12.68l.106.002z" fill="#5F6368"/>
            <path d="M3.395 3.06H.02L0 3.252c5.87 1.466 9.76 5.006 11.368 9.259l-1.64-7.98C9.503 3.54 8.76 3.094 7.846 3.06H3.395z" fill="#5F6368"/>
          </svg>
          <span className="font-medium">Pay</span>
        </>
      )}
    </button>
  );
}
