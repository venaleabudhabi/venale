'use client';

import { OrderStatus } from '@/lib/constants';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  timeline: {
    status: OrderStatus;
    at: Date | string;
    by?: string;
  }[];
  className?: string;
}

const STATUS_FLOW: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED'];

export default function StatusTimeline({ currentStatus, timeline, className = '' }: StatusTimelineProps) {
  const getCurrentStepIndex = () => {
    return STATUS_FLOW.indexOf(currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = currentStatus === 'CANCELLED';

  const getStepLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      PENDING: 'Order Received',
      CONFIRMED: 'Confirmed',
      PREPARING: 'Preparing',
      READY: 'Ready',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    };
    return labels[status];
  };

  if (isCancelled) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-900">Order Cancelled</p>
            <p className="text-sm text-red-700">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {STATUS_FLOW.filter((status) => status !== 'OUT_FOR_DELIVERY' || currentStepIndex >= 4).map((status, index) => {
        const stepIndex = STATUS_FLOW.indexOf(status);
        const isCompleted = stepIndex < currentStepIndex;
        const isCurrent = stepIndex === currentStepIndex;
        const isPending = stepIndex > currentStepIndex;

        return (
          <div key={status} className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-primary-600 text-white'
                    : isCurrent
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              {index < STATUS_FLOW.length - 2 && (
                <div
                  className={`w-0.5 h-12 ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-2">
              <p
                className={`font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {getStepLabel(status)}
              </p>
              {timeline.find((t) => t.status === status) && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(timeline.find((t) => t.status === status)!.at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
