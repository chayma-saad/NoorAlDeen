# نور الدين — Noor Al-Deen 🌙

A full-featured Islamic daily companion app built with Expo React Native.

---

## Features

- 🕌 **Prayer Times** — Real GPS-based prayer times via Aladhan API with live countdown, push notifications, Sunnah rakaat tracker
- 📅 **Hijri Calendar** — Full Hijri calendar with Islamic events, أيام البيض, الأشهر الحرم highlights
- ⭐ **Islamic Events Planner** — Full day planners for يوم عرفة, عشر ذي الحجة, عيد الأضحى, عاشوراء and more with checklists
- 📿 **Dhikr Counter** — Tap counter with haptic feedback for سبحان الله, الحمد لله, الله أكبر and more
- 📖 **Quran Tracker** — 30-Juz grid, portion tracker, daily reading goals
- 🤖 **AI Islamic Companion** — Powered by Claude AI for religious Q&A in Arabic

---

## Setup

### 1. Install dependencies

```bash
cd NoorAlDeen
npm install
```

### 2. Add your Anthropic API Key

In `src/services/api.ts`, the `askClaude` function calls the Anthropic API.

For security, add your key via environment variable:
- Create a `.env` file:
  ```
  ANTHROPIC_API_KEY=sk-ant-your-key-here
  ```
- Update `api.ts` to use:
  ```ts
  'anthropic-api-key': process.env.ANTHROPIC_API_KEY || '',
  ```

### 3. Run the app

```bash
# Start Expo
npx expo start

# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## Project Structure

```
NoorAlDeen/
├── App.tsx                          # Root entry point
├── src/
│   ├── constants/
│   │   ├── theme.ts                 # Colors, fonts, spacing
│   │   └── islamicData.ts           # Events, dhikr, Quran data
│   ├── screens/
│   │   ├── PrayerTimesScreen.tsx    # Prayer times + notifications
│   │   ├── CalendarScreen.tsx       # Hijri calendar
│   │   ├── EventsScreen.tsx         # Islamic events + planners
│   │   ├── DhikrScreen.tsx          # Dhikr counter + adhkar
│   │   └── QuranScreen.tsx          # Quran tracker
│   ├── components/
│   │   └── AICompanion.tsx          # Floating AI chat button
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Bottom tab navigator
│   ├── hooks/
│   │   └── usePrayerTimes.ts        # Prayer times hook
│   ├── services/
│   │   ├── api.ts                   # Aladhan API + Claude AI
│   │   ├── storage.ts               # AsyncStorage persistence
│   │   └── notifications.ts         # Expo push notifications
│   └── utils/
│       └── helpers.ts               # Arabic numerals, date utils
```

---

## APIs Used

- **Aladhan API** — Free, no key needed — `https://api.aladhan.com`
- **Anthropic Claude API** — Requires API key — `https://api.anthropic.com`
- **Expo Location** — For GPS-based prayer times
- **Expo Notifications** — For Adhan push notifications

---

## Design

- 🌑 Dark theme — Deep navy background
- 🟡 Gold accents — `#C9922E`
- 🟢 Green highlights — `#2E6B4F`
- 🔤 Arabic fonts — Amiri (serif) + Cairo (sans-serif)
- 📱 Full RTL layout

---

بارك الله فيك ونفع بهذا التطبيق 🤲
