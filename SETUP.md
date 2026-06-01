# DebtPilot — Setup Guide

## Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start the development server
npx expo start

# Run on specific platform
npx expo start --ios
npx expo start --android
```

## Project Architecture

```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (providers)
│   ├── index.tsx           # Splash screen
│   ├── onboarding.tsx      # 3-slide onboarding
│   ├── (auth)/             # Auth flow
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── otp.tsx
│   ├── (tabs)/             # Main tab navigation
│   │   ├── dashboard.tsx   # Home dashboard
│   │   ├── loans.tsx       # Loans list
│   │   ├── analytics.tsx   # Charts & analytics
│   │   └── profile.tsx     # User profile
│   ├── loan/
│   │   ├── [id].tsx        # Loan detail
│   │   └── add.tsx         # Add loan modal
│   ├── ai-insights.tsx     # AI recommendations
│   ├── reminders.tsx       # EMI reminders
│   ├── notifications.tsx   # Push notifications
│   └── settings.tsx        # App settings
├── components/ui/          # 15 reusable components
├── features/               # Feature modules
├── services/               # API & storage services
├── store/                  # Redux Toolkit slices
├── hooks/                  # Custom React hooks
├── utils/                  # Helpers & formatters
├── constants/              # Dummy data & config
├── theme/                  # Design system
├── localization/           # i18n (EN/TA/HI)
├── api/                    # Axios client + mock API
├── types/                  # TypeScript interfaces
└── animations/             # Reanimated configs
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo SDK 51 |
| Navigation | Expo Router v3 (file-based) |
| State | Redux Toolkit + React Query |
| Forms | React Hook Form + Zod |
| HTTP | Axios (with mock API) |
| Animations | Reanimated 3 + Moti |
| Charts | React Native Gifted Charts |
| i18n | i18next (EN, Tamil, Hindi) |
| Auth | Expo SecureStore + Biometric |
| UI | Glassmorphism + Neon gradients |

## Demo Credentials
- Phone: `+919876543210`
- Password: `Password123`
- OTP: any 6 digits

## Key Features
- Dark mode premium UI with glassmorphism
- 4 demo loans (Home, Car, Personal, Education)
- Financial health score with animated ring
- AI insights with 4 types (opportunity/warning/tip/achievement)
- Multi-language (English, Tamil, Hindi)
- Biometric auth ready
- Animated charts (bar + line)
- EMI reminders system
- Push notification center
