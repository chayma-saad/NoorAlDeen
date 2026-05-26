# ركز على دينك — Focus on Your Deen

A personal Islamic companion app for spiritual growth — prayer times, Quran tracking, Dhikr counter, Duas library, and Hijri calendar. Built with Expo (React Native) and deployable as a free PWA on your iPhone via GitHub Pages.

---

## Features

| Screen | What it does |
|--------|-------------|
| **الصلاة** — Prayer Times | Live GPS-based prayer times, countdown to next prayer, Adhan notification, Sunnah tracker |
| **التقويم** — Calendar | Full Hijri calendar with Islamic events and month virtues |
| **مناسبات** — Events | Real-time countdown to every Islamic event with daily task checklists |
| **الأذكار** — Dhikr | Tasbih counter with morning/evening/post-prayer adhkar |
| **القرآن** — Quran | 30-Juz progress tracker and daily reading goals |
| **القلب** — Heart Map | Visual 114-surah map with completion tracking |
| **أدعية** — Duas | 12 emotional categories — anxiety, joy, marriage, قضاء الحاجة, forgiveness, and more |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54 (React Native 0.81) |
| Language | TypeScript (strict) |
| Navigation | React Navigation v6 (bottom tabs) |
| Storage | AsyncStorage (persists locally on device) |
| APIs | Aladhan API (prayer times + Hijri date) · Anthropic Claude API (AI companion) |
| Fonts | Amiri · Cairo (Google Fonts via Expo) |
| Audio | expo-audio |
| Notifications | expo-notifications |
| Location | expo-location |

---

## Project Structure

```
focus_on_ur_deen/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Auto-builds & deploys PWA to GitHub Pages on every push
│
├── assets/
│   ├── icon.png                ← App icon (used on home screen)
│   └── sounds/
│       ├── adhan.mp3           ← Prayer call audio
│       └── ringtone.mp3
│
├── src/
│   ├── components/
│   │   ├── AICompanion.tsx     ← Floating Claude AI chat button
│   │   └── PrayerCallScreen.tsx← Full-screen overlay when prayer time arrives
│   │
│   ├── constants/
│   │   ├── islamicData.ts      ← All Islamic events, Duas, Dhikr, Quran structure
│   │   └── theme.ts            ← Color palette, fonts, spacing, shadows
│   │
│   ├── hooks/
│   │   └── usePrayerTimes.ts   ← Fetches prayer times, calculates countdown, schedules notifications
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx    ← Bottom tab navigator (7 tabs)
│   │
│   ├── screens/
│   │   ├── PrayerTimesScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── EventsScreen.tsx
│   │   ├── DhikrScreen.tsx
│   │   ├── DuaaScreen.tsx
│   │   ├── QuranScreen.tsx
│   │   └── HeartMapScreen.tsx
│   │
│   ├── services/
│   │   ├── api.ts              ← Aladhan API + Anthropic Claude API calls
│   │   ├── notifications.ts    ← Schedule/cancel daily prayer notifications
│   │   └── storage.ts          ← AsyncStorage wrappers (checks, dhikr counts, streaks)
│   │
│   └── utils/
│       └── helpers.ts          ← Date/time formatting, Arabic numerals, Hijri helpers
│
├── App.tsx                     ← Root — fonts, RTL setup, notification listeners, splash
├── app.json                    ← Expo config (name, icons, permissions, PWA manifest, EAS)
├── eas.json                    ← EAS Build profiles (if ever building native)
├── package.json
└── tsconfig.json
```

---

## One-Time Setup

### Prerequisites

Make sure you have these installed on your PC:

| Tool | Install |
|------|---------|
| Node.js 20+ | https://nodejs.org |
| Git | https://git-scm.com |

### 1 — Clone the repo

```bash
git clone https://github.com/chaymasd/focus_on_ur_deen.git
cd focus_on_ur_deen
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Rename GitHub repo (one time, in browser)

1. Go to `https://github.com/chaymasd/NoorAlDeen`
2. Click **Settings** (top tab)
3. Scroll to **Danger Zone** at the bottom
4. Click **Rename this repository**
5. Type `focus_on_ur_deen` → click **Rename**

Then update your local remote to point to the new name:

```bash
git remote set-url origin https://github.com/chaymasd/NoorAlDeen.git
```

### 4 — Enable GitHub Pages (one time, in browser)

1. Go to your renamed repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source** select **GitHub Actions**
4. Click **Save**

Done. Every `git push` to `master` now automatically builds and publishes the web app.

---

## Running the Project

### Development mode — on your PC (hot reload, fastest)

```bash
npm start
```

Then press:
- `w` — open in web browser on your PC
- `a` — open on Android emulator (if installed)
- `i` — open on iOS simulator (Mac only)

### Web only

```bash
npx expo start --web
```

Opens at `http://localhost:8081`.

### Build the web version locally (to test before pushing)

```bash
npx expo export --platform web
# Output goes to ./dist/
```

### Deploy to GitHub Pages

Just push to master — the GitHub Action does everything automatically:

```bash
git add .
git commit -m "your message"
git push
```

Check the build at: `https://github.com/chaymasd/focus_on_ur_deen/actions`

After ~2 minutes your app is live at:
```
https://chaymasd.github.io/focus_on_ur_deen
```

---

## iPhone Setup — Free, No Apple Account Needed

This uses GitHub Pages (free hosting) + Safari "Add to Home Screen" to install the app as a real icon on your iPhone. No App Store, no Apple Developer account, no money.

### Steps (do once, after first deploy)

1. Wait for the GitHub Actions build to finish (≈ 2 min after pushing)
2. On your iPhone open **Safari** — it must be Safari, not Chrome
3. Go to:
   ```
   https://chaymasd.github.io/focus_on_ur_deen
   ```
4. Tap the **Share** icon `⬆` at the bottom of the screen
5. Scroll down in the share sheet and tap **Add to Home Screen**
6. Tap **Add** in the top right

The app icon now lives on your home screen. Tap it — it opens fullscreen with no browser bar, just like a real native app.

### What works on iPhone (PWA mode)

| Feature | Status |
|---------|--------|
| Prayer times with GPS | ✅ Full support |
| Countdown to next prayer | ✅ Full support |
| Quran tracker | ✅ Full support |
| Dhikr counter | ✅ Full support |
| Duas library (all 12 categories) | ✅ Full support |
| Hijri calendar & Events | ✅ Full support |
| Saves your data locally | ✅ Stored on your iPhone |
| Adhan audio | ✅ Plays when app is open |
| Prayer notifications | ✅ Requires iOS 16.4+ — tap Allow when Safari asks |
| Works offline after first load | ✅ Core screens cached |

> If your iPhone is below iOS 16.4, prayer notifications will not pop up in the background — everything else works fine.

### Updating the app on your iPhone

After you push new changes and the Action finishes, on iPhone:
- Open the app → pull down to refresh
- Or close it fully and reopen

---

## Environment Variables (optional)

The Claude AI companion needs an Anthropic API key. Without it, everything works except the AI chat button.

Create a file `.env.local` in the root (never commit this):

```
EXPO_PUBLIC_ANTHROPIC_KEY=sk-ant-api03-...
```

Add to `.gitignore`:
```
.env.local
```

---

## Common Commands

```bash
# Start dev server (choose platform interactively)
npm start

# Web only
npx expo start --web

# Build web for deployment
npx expo export --platform web

# Clear Expo cache when something breaks
npx expo start --clear

# Check TypeScript errors
npx tsc --noEmit

# Install a new Expo-compatible package
npx expo install package-name
```

---

*بارك الله فيك — made for personal spiritual growth*
