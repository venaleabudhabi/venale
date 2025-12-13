# Building Android APK for REVIVE Staff App

## Quick Method - PWA Installation

The easiest way to install the staff app on Android devices:

1. **Open in Chrome/Edge on Android**
   - Navigate to: `https://your-domain.com/staff/orders`
   - Click the menu (⋮) 
   - Select "Add to Home screen"
   - The app will be installed like a native app

2. **Benefits of PWA**
   - No app store needed
   - Instant updates
   - Works offline
   - Full-screen experience

---

## Full APK Build Method

For a proper APK file that can be distributed:

### Prerequisites

1. **Install Node.js** (already installed)

2. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - Install Android SDK (API 33 or higher)
   - Install Command Line Tools

3. **Install Java JDK**
   ```bash
   brew install openjdk@17
   ```

### Build Steps

#### 1. Make the build script executable
```bash
chmod +x build-staff-apk.sh
```

#### 2. Run the build script
```bash
./build-staff-apk.sh
```

This will:
- Install Capacitor dependencies
- Initialize Capacitor for Android
- Build the Next.js app
- Sync with Android platform

#### 3. Build Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 4. Build Release APK (for production)

First, generate a keystore:
```bash
keytool -genkey -v -keystore revive-staff.keystore -alias revive -keyalg RSA -keysize 2048 -validity 10000
```

Then build:
```bash
cd android
./gradlew assembleRelease
```

Sign the APK in Android Studio or use `jarsigner`.

---

## Alternative: Using PWA Builder

For the simplest APK creation:

1. **Visit PWABuilder**
   - Go to: https://www.pwabuilder.com
   - Enter your URL: `https://your-domain.com/staff/orders`
   - Click "Start"

2. **Download APK**
   - Click "Package for Stores"
   - Select Android
   - Download the APK

3. **Install**
   - Transfer APK to Android device
   - Enable "Install from Unknown Sources"
   - Install the APK

---

## Configuration Files Created

- ✅ `staff-manifest.json` - PWA manifest for staff app
- ✅ `build-staff-apk.sh` - Automated build script
- ✅ This README guide

---

## Testing the APK

1. **Transfer APK to device**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

2. **Or use file transfer**
   - Copy APK to device via USB/Google Drive/etc
   - Open and install on Android device

---

## Updating the App

When you make changes:

1. Update the code
2. Build Next.js: `npm run build`
3. Sync Capacitor: `npx cap sync android`
4. Rebuild APK: `cd android && ./gradlew assembleDebug`

---

## Configuration for Staff App

To optimize for staff use, update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.revive.staff',
  appName: 'REVIVE Staff',
  webDir: 'out',
  server: {
    url: 'http://localhost:3000',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
```

For production, point `server.url` to your production backend.

---

## Troubleshooting

**Issue: Gradle build fails**
- Solution: Make sure JAVA_HOME is set
  ```bash
  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
  ```

**Issue: APK won't install**
- Solution: Enable "Unknown Sources" in Android settings

**Issue: App can't connect to backend**
- Solution: Update API URL in environment variables
- Make sure backend is accessible from the device

---

## Recommended Approach

For staff internal use, I recommend:

1. **PWA Installation** (easiest)
   - No app store approval needed
   - Instant updates
   - Just bookmark the URL

2. **Debug APK** (if you need offline mode)
   - Build once with the script
   - Distribute via Google Drive/USB

3. **Signed APK** (for Play Store)
   - Only if distributing publicly
   - Requires app signing and Play Console account
