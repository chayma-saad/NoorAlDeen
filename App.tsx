import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, I18nManager, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
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
import { requestNotificationPermission } from './src/services/notifications';
import { updateStreak } from './src/services/storage';

// Force RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

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

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && appReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appReady]);

  if (!fontsLoaded || !appReady) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashText}>نور الدين</Text>
        <Text style={styles.splashSub}>✦ جارٍ التحميل ✦</Text>
      </View>
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
