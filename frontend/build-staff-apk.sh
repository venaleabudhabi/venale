#!/bin/bash

# REVIVE Staff App - APK Builder
# This script helps you build an Android APK for the staff orders page

echo "🚀 REVIVE Staff App - APK Builder"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Step 1: Installing Capacitor..."
npm install --save @capacitor/core @capacitor/cli @capacitor/android

echo ""
echo "🔧 Step 2: Initializing Capacitor..."
npx cap init "REVIVE Staff" "com.revive.staff" --web-dir=out

echo ""
echo "📱 Step 3: Adding Android platform..."
npx cap add android

echo ""
echo "🏗️  Step 4: Building Next.js app..."
npm run build

echo ""
echo "📋 Step 5: Syncing with Android..."
npx cap sync android

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 Next steps:"
echo "1. Install Android Studio: https://developer.android.com/studio"
echo "2. Open the Android project:"
echo "   npx cap open android"
echo "3. In Android Studio:"
echo "   - Build > Generate Signed Bundle / APK"
echo "   - Select APK"
echo "   - Follow the wizard to sign and build"
echo ""
echo "🚀 Quick build (unsigned APK for testing):"
echo "   cd android && ./gradlew assembleDebug"
echo "   APK will be at: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
