'use client';

import { useRouter } from 'next/navigation';

export default function StaffInstallPage() {
  const router = useRouter();
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches);

  if (isStandalone) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">App Already Installed!</h1>
          <p className="text-gray-600 mb-6">You're using the installed version</p>
          <button
            onClick={() => router.push('/staff/orders')}
            className="btn-primary w-full"
          >
            Go to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Install REVIVE Staff App</h1>
          <p className="text-gray-600">Manage orders faster from your home screen</p>
        </div>

        {isIOS ? (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold">Installation Steps for iPhone/iPad</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-2">Tap the Share button</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                    </svg>
                    <span>Located at the bottom of Safari browser</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-2">Scroll and tap "Add to Home Screen"</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    <span>Look for the plus icon</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-2">Tap "Add" to confirm</p>
                  <p className="text-sm text-gray-600">The app will appear on your home screen</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-900">
                <strong>Note:</strong> You must use Safari browser on iOS to install the app.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold">Installation Steps for Android</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-2">Tap the menu button (⋮)</p>
                  <p className="text-sm text-gray-600">Located at top-right of Chrome browser</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-2">Tap "Install app" or "Add to Home screen"</p>
                  <p className="text-sm text-gray-600">Chrome will show an install prompt</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-2">Tap "Install" to confirm</p>
                  <p className="text-sm text-gray-600">The app icon will appear on your home screen</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/staff/login')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
