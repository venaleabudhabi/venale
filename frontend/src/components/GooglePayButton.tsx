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
      className="google-pay-button w-full bg-white border-2 border-gray-300 text-gray-800 rounded-lg px-6 py-4 font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {isProcessing ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <>
          <svg width="42" height="17" viewBox="0 0 42 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.933 8.486c0 2.575-2.007 4.476-4.585 4.476-2.577 0-4.584-1.901-4.584-4.476 0-2.589 2.007-4.49 4.584-4.49 2.578 0 4.585 1.901 4.585 4.49zm-1.975 0c0-1.643-1.191-2.77-2.61-2.77-1.419 0-2.61 1.127-2.61 2.77 0 1.629 1.191 2.756 2.61 2.756 1.419 0 2.61-1.127 2.61-2.756z" fill="#5F6368"/>
            <path d="M27.378 8.486c0 2.575-2.007 4.476-4.585 4.476-2.577 0-4.584-1.901-4.584-4.476 0-2.589 2.007-4.49 4.584-4.49 2.578 0 4.585 1.901 4.585 4.49zm-1.975 0c0-1.643-1.191-2.77-2.61-2.77-1.419 0-2.61 1.127-2.61 2.77 0 1.629 1.191 2.756 2.61 2.756 1.419 0 2.61-1.127 2.61-2.756z" fill="#5F6368"/>
            <path d="M35.524 4.237v7.888c0 3.248-1.916 4.577-4.182 4.577-2.133 0-3.413-1.43-3.897-2.603l1.722-.718c.3.718 1.036 1.564 2.175 1.564 1.424 0 2.307-.88 2.307-2.534v-.632h-.067c-.425.525-1.244 1.005-2.28 1.005-2.165 0-4.147-1.888-4.147-4.462 0-2.59 1.982-4.49 4.148-4.49 1.035 0 1.855.48 2.28 1.005h.066v-.77h1.875zm-1.736 4.263c0-1.577-1.057-2.77-2.397-2.77-1.36 0-2.502 1.193-2.502 2.77 0 1.563 1.142 2.742 2.502 2.742 1.34 0 2.397-1.18 2.397-2.742z" fill="#5F6368"/>
            <path d="M40.998 0.947v11.935H39.09V0.947z" fill="#5F6368"/>
            <path d="M8.933 6.65v5.723H6.997V1.388h5.393v1.677H8.933v1.917h3.22v1.663h-3.22z" fill="#5F6368"/>
            <g>
              <path d="M2.652 2.883L0 10.22l-.367.974L0 12.373h3.94l.546-1.522H1.914l.356-.975.382-1.03h2.24l.546-1.521H3.197l.34-.955.356-1.03h2.244L6.683 3.82H2.879l-.227.063z" fill="#4285F4"/>
              <path d="M2.652 2.883l.227-.063H6.68L4.28.005H.737L0 2.197l.344.086 2.308.6z" fill="#EA4335"/>
              <path d="M0 2.197L.367 3.17l2.285 7.05H6.99l2.347-6.4-.546-1.523L6.683 3.82l-1.146 3.442H3.293L2.652 2.883 0 2.197z" fill="#34A853"/>
              <path d="M6.99 10.22l2.347-6.4L11.684.005H7.017L4.28.005l2.403 2.815.546 1.523 1.146 3.442h2.244l.356.975.382 1.03.634 1.775.93 1.808h3.64l-.36-1.152-3.94-.001z" fill="#FBBC04"/>
            </g>
          </svg>
          <span className="font-medium">Pay</span>
        </>
      )}
    </button>
  );
}
