'use client';

import { useState } from 'react';
import axios from 'axios';

interface ApplePayButtonProps {
  orderId: string;
  amount: number;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

export default function ApplePayButton({ orderId, amount, onSuccess, onError }: ApplePayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApplePay = async () => {
    try {
      setIsProcessing(true);

      // Call backend to process Apple Pay
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payments/apple-pay`, {
        orderId,
        amount,
      });

      if (response.data.success) {
        onSuccess(response.data);
      } else {
        onError(response.data.message || 'Payment failed');
      }
    } catch (error: any) {
      console.error('Apple Pay error:', error);
      onError(error.response?.data?.error || 'Apple Pay payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleApplePay}
      disabled={isProcessing}
      className="w-full bg-black text-white rounded-lg px-6 py-4 font-medium flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ 
        fontSize: '17px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {isProcessing ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <>
          <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.11 3.55C7.11 2.17 8.27 1.07 9.73 1.07C11.19 1.07 12.35 2.17 12.35 3.55C12.35 4.93 11.19 6.03 9.73 6.03C8.27 6.03 7.11 4.93 7.11 3.55ZM4.72 9.96C4.05 8.84 3.67 7.49 3.67 6.03C3.67 2.71 6.41 0.03 9.73 0.03C13.05 0.03 15.79 2.71 15.79 6.03C15.79 7.49 15.41 8.84 14.74 9.96L19.11 14.07H16.43L13.71 11.49C12.56 12.47 11.09 13.07 9.73 13.07C8.37 13.07 6.9 12.47 5.75 11.49L3.03 14.07H0.35L4.72 9.96Z" fill="white"/>
            <path d="M22.94 1.22C23.83 0.51 24.93 0.05 26.13 0.05C28.78 0.05 30.94 2.21 30.94 4.86V14.07H28.24V4.86C28.24 3.78 27.37 2.91 26.29 2.91C25.47 2.91 24.75 3.38 24.36 4.05V14.07H21.66V4.86C21.66 3.78 20.79 2.91 19.71 2.91C18.89 2.91 18.17 3.38 17.78 4.05V14.07H15.08V0.28H17.78V1.22C18.67 0.51 19.77 0.05 20.97 0.05C22.03 0.05 22.99 0.44 23.75 1.08C23.49 0.72 23.22 0.42 22.94 1.22Z" fill="white"/>
          </svg>
          <span>Pay</span>
        </>
      )}
    </button>
  );
}
