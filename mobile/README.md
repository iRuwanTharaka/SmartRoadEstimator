# Smart Road Estimator — React Native (Expo)

Mobile version of the Smart Road Estimator app, converted from the React web frontend.

## Tech Stack

| Web (original) | Mobile (this project) |
|---|---|
| Vite + React | Expo SDK 52 + React Native 0.76 |
| React Router | React Navigation (Stack + Bottom Tabs) |
| Tailwind CSS | React Native StyleSheet |
| Radix UI / shadcn | Custom RN components |
| lucide-react | lucide-react-native |
| motion/react | React Native Animated API |
| recharts (PieChart) | react-native-svg (custom DonutChart) |
| expo-image-picker | expo-image-picker (real camera/gallery) |

## Project Structure

```
mobile/
├── App.tsx                        # Entry point
├── app.json                       # Expo config
├── package.json
├── tsconfig.json
├── babel.config.js
└── src/
    ├── navigation/
    │   ├── index.tsx              # Root navigator (Stack + Bottom Tabs)
    │   └── types.ts               # Navigation type definitions
    ├── components/
    │   ├── PageHeader.tsx         # Blue header with back button
    │   └── ProgressIndicator.tsx  # 5-step estimation progress bar
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx
        │   ├── SignupScreen.tsx
        │   └── ForgotPasswordScreen.tsx
        ├── main/
        │   ├── HomeScreen.tsx
        │   ├── PastProjectsScreen.tsx
        │   ├── RateManagementScreen.tsx
        │   └── MyAccountScreen.tsx
        └── estimation/
            ├── Step1ProjectDetailsScreen.tsx
            ├── Step2ImageCaptureScreen.tsx
            ├── Step3AIAnalysisScreen.tsx
            ├── Step4ManualVerificationScreen.tsx
            ├── Step5CostEstimationScreen.tsx
            └── BOQExportScreen.tsx
```

## Setup & Running

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode + iOS Simulator (macOS only)
- For Android: Android Studio + Android Emulator, or a physical device with Expo Go

### Install

```bash
cd "d:/Project Sample/Version 1/mobile"
npm install
```

### Run

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

Scan the QR code with the **Expo Go** app on your phone to run on a real device.

## Screens

| Screen | Route Name |
|---|---|
| Login | `Login` |
| Sign Up | `Signup` |
| Forgot Password | `ForgotPassword` |
| Home (Dashboard) | `MainTabs → Home` |
| Past Projects | `MainTabs → PastProjects` |
| Rate Management | `MainTabs → RateManagement` |
| My Account | `MainTabs → Account` |
| Step 1 — Project Details | `Step1` |
| Step 2 — Image Capture | `Step2` |
| Step 3 — AI Analysis | `Step3` |
| Step 4 — Manual Verification | `Step4` |
| Step 5 — Cost Estimation | `Step5` |
| BOQ Export | `BOQ` |

## Notes

- **Camera & Gallery**: Step 2 uses `expo-image-picker` for real device camera/gallery access.
- **Pie Chart**: Implemented as a custom SVG donut chart using `react-native-svg` (replaces `recharts`).
- **Animations**: Login entrance + AI analysis spinner use React Native's `Animated` API (replaces `motion/react`).
- **Safe Area**: All screens respect device safe area insets via `react-native-safe-area-context`.
