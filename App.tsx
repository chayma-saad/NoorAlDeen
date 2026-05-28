import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, I18nManager, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  Amiri_400Regular,
  Amiri_700Bold,
} from '@expo-google-fonts/amiri';
import {
  Cairo_300Light,
  Cairo_400Regular,
  Cairo_600SemiBold,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';
import { COLORS } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';
import AICompanion from './src/components/AICompanion';
import { PrayerCallScreen } from './src/components/PrayerCallScreen';
import { requestNotificationPermission } from './src/services/notifications';
import { updateStreak } from './src/services/storage';
import {
  firebaseEnabled,
  onAuthChange,
  uploadDataToCloud,
} from './src/services/firebase';
import AuthScreen from './src/screens/AuthScreen';

// ── BUG 1 FIX: await at top level is illegal in React Native.
// The Android channel setup must live inside an async function, not at module scope.
async function setupAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer-call', {
      name: 'نداء الصلاة',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'adhan.mp3',
      vibrationPattern: [0, 500, 200, 500],
      lightColor: '#C9922E',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
}

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

interface PrayerCallData {
  prayer: string;
  arabic: string;
  time: string;
}

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [callData, setCallData] = useState<PrayerCallData | null>(null);
  // null = not yet determined, false = logged out / guest, string = user uid
  const [userId, setUserId] = useState<string | false | null>(null);
  const [guestMode, setGuestMode] = useState(false);

  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Cairo_300Light,
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await setupAndroidChannel();
        await requestNotificationPermission();
        await updateStreak();
      } catch (e) {
        console.warn('App init error:', e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  // Watch Firebase auth state — only when Firebase is configured
  useEffect(() => {
    if (!firebaseEnabled) { setUserId(false); return; }
    const unsub = onAuthChange((user) => {
      if (user) {
        setUserId(user.uid);
        setGuestMode(false);
        // Sync local data to cloud whenever user is confirmed logged in
        uploadDataToCloud(user.uid).catch(() => {});
      } else {
        setUserId(false);
      }
    });
    return unsub;
  }, []);

  // ── BUG 2 FIX: Notification listeners must be inside useEffect, not at module scope.
  // They were already correct here — keeping them as-is.
  useEffect(() => {
    // App in foreground — show call screen immediately
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data as any;
      if (data?.type === 'PRAYER_CALL') {
        setCallData({
          prayer: data.prayer,
          arabic: data.prayerArabic,
          time: data.prayerTime,
        });
      }
    });

    // App in background/killed — user tapped notification
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      if (data?.type === 'PRAYER_CALL') {
        setCallData({
          prayer: data.prayer,
          arabic: data.prayerArabic,
          time: data.prayerTime,
        });
      }
    });

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && appReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appReady]);

  // Show auth screen when Firebase is enabled and user is not signed in / not in guest mode
  const showAuth = firebaseEnabled && userId === false && !guestMode;
  // Still loading auth state
  const authLoading = firebaseEnabled && userId === null && !guestMode;

  if (!fontsLoaded || !appReady || authLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashText}>ركز على دينك</Text>
        <Text style={styles.splashSub}>✦ جارٍ التحميل ✦</Text>
      </View>
    );
  }

  // Auth screen — shown when Firebase is on and user is logged out
  if (showAuth) {
    return <AuthScreen onGuest={() => setGuestMode(true)} />;
  }

  // Prayer call screen overlays everything
  if (callData) {
    return (
      <PrayerCallScreen
        prayerName={callData.prayer}
        prayerArabic={callData.arabic}
        prayerTime={callData.time}
        onDismiss={() => setCallData(null)}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.deep} />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: COLORS.gold,
            background: COLORS.deep,
            card: COLORS.deep2,
            text: COLORS.cream,
            border: 'rgba(201,146,46,0.2)',
            notification: COLORS.gold,
          },
        }}
      >
        <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
          <View style={styles.inner}>
            <AppNavigator />
            <AICompanion />
          </View>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: COLORS.deep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  splashText: {
    fontSize: 48,
    color: COLORS.goldLight,
    fontWeight: '700',
    letterSpacing: 2,
  },
  splashSub: {
    fontSize: 16,
    color: COLORS.muted,
    letterSpacing: 3,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.deep,
  },
  inner: {
    flex: 1,
    position: 'relative',
  },
});
