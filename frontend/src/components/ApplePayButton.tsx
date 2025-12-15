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
      className="apple-pay-button w-full bg-black text-white rounded-lg px-6 py-4 font-medium flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isProcessing ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </div>
      ) : (
        <>
          <svg width="50" height="20" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.583 3.958c.542 0 1.229-.354 1.646-.854.375-.458.646-1.083.646-1.708 0-.083-.009-.167-.025-.208-.625.021-1.375.417-1.813.938-.354.396-.687 1.021-.687 1.646 0 .092.017.183.025.208.042.009.109.017.208.017zm.063 1.042c-.917 0-1.646.542-2.063.542-.458 0-1.104-.521-1.854-.521-1.396 0-2.688.812-3.375 2.083-.958 1.646-1.271 4.729.188 7.5.771 1.479 1.75 3.125 3.021 3.146h.021c.688 0 .896-.458 1.854-.458h.021c.917 0 1.104.458 1.854.458h.021c1.271-.021 2.188-1.542 2.958-3.021.625-1.104.854-1.625 1.313-2.854-3.438-1.313-4-6.417-.875-7.938-1.021-1.313-2.563-1.938-4.084-1.938zM20.313 1.25c2.375 0 4.042 1.625 4.042 3.979 0 2.354-1.708 3.979-4.104 3.979h-2.646v4.104h-1.896V1.25h4.604zm-2.708 6.271h2.146c1.646 0 2.583-.875 2.583-2.292 0-1.417-.938-2.292-2.583-2.292h-2.146v4.584zm7.875 1.604c0-1.563 1.188-2.563 3.292-2.688l2.396-.146v-.688c0-.958-.646-1.521-1.729-1.521-1.021 0-1.646.5-1.771 1.271h-1.729c.063-1.5 1.396-2.833 3.542-2.833 2.083 0 3.521 1.146 3.521 2.896v6.021h-1.729v-1.438h-.042c-.542.979-1.646 1.604-2.875 1.604-1.771 0-2.875-1.063-2.875-2.479zm5.688-.729v-.688l-2.146.125c-1.083.083-1.688.563-1.688 1.313 0 .771.667 1.271 1.625 1.271 1.271.001 2.209-.854 2.209-2.021zm3.313 6.937V13.75h1.688v.5c0 .896.375 1.333 1.188 1.333.229 0 .458-.021.604-.042v1.438c-.167.042-.5.063-.813.063-1.708 0-2.667-.771-2.667-2.729zm3.563-7.708c0-2.188 1.271-3.563 3.229-3.563 1.188 0 2.167.604 2.667 1.521h.042V.146h1.771v13.188h-1.729v-1.438h-.042c-.521.938-1.521 1.604-2.729 1.604-1.958 0-3.209-1.375-3.209-3.563zm1.854 0c0 1.438.729 2.333 1.938 2.333s1.938-.875 1.938-2.313c0-1.438-.729-2.333-1.938-2.333s-1.938.896-1.938 2.313zm8.563 3.813c0-1.021.792-1.604 2.188-1.708l2.313-.146v-.667c0-.875-.583-1.375-1.563-1.375-.875 0-1.458.396-1.604 1.021h-1.646c.104-1.375 1.375-2.5 3.292-2.5 1.917 0 3.229 1.021 3.229 2.604v5.646h-1.646v-1.375h-.042c-.521.938-1.521 1.5-2.604 1.5-1.521 0-2.917-.896-2.917-2.5zm4.5-.729v-.646l-2.063.125c-.938.063-1.438.438-1.438 1.083 0 .646.583 1.063 1.375 1.063 1.125 0 2.126-.625 2.126-1.625zm3.313 5.729c.125.979.979 1.604 2.188 1.604 1.479 0 2.313-.729 2.313-2.083v-1.375h-.042c-.479.896-1.479 1.5-2.625 1.5-1.917 0-3.167-1.417-3.167-3.604 0-2.208 1.271-3.625 3.167-3.625 1.167 0 2.146.604 2.625 1.479h.042V7.271h1.667v6.958c0 2.063-1.375 3.458-4 3.458-2.146 0-3.542-1.021-3.688-2.521h1.521zm4.5-5.313c0-1.396-.729-2.271-1.917-2.271s-1.896.854-1.896 2.271c0 1.417.708 2.271 1.896 2.271s1.917-.854 1.917-2.271z" fill="white"/>
          </svg>
        </>
      )}
    </button>
  );
}
