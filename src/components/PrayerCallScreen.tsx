import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar, BackHandler, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

// ── BUG 3 FIX: useAudioPlayer hooks cannot be called conditionally or inside
// callbacks. They must be called at the top level of the component.
// Also expo-audio API changed — replace useAudioPlayer with Audio from expo-av
// because expo-audio's useAudioPlayer doesn't support all control methods yet.
// We use expo-av's Audio which is stable and well-tested.
import { Audio } from 'expo-av';

interface PrayerCallScreenProps {
  prayerName: string;
  prayerArabic: string;
  prayerTime: string;
  onDismiss: () => void;
}

export const PrayerCallScreen: React.FC<PrayerCallScreenProps> = ({
  prayerName,
  prayerArabic,
  prayerTime,
  onDismiss,
}) => {
  const [answered, setAnswered] = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const ringtoneRef = useRef<Audio.Sound | null>(null);
  const adhanRef    = useRef<Audio.Sound | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const ring1 = useRef(new Animated.Value(1)).current;
  const ring2 = useRef(new Animated.Value(1)).current;
  const ring3 = useRef(new Animated.Value(1)).current;

  // Block hardware back button on Android
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Start animations + haptics + ringtone
  useEffect(() => {
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1.8, duration: 1200, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,   duration: 0,    useNativeDriver: true }),
        ])
      ).start();

    pulse(ring1, 0);
    pulse(ring2, 400);
    pulse(ring3, 800);

    const hapticInterval = setInterval(() => {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    }, 2000);

    playRingtone();

    return () => {
      clearInterval(hapticInterval);
      stopAll();
    };
  }, []);

  // ── BUG 3 FIX: proper expo-av Audio usage with async/await ──
  const playRingtone = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
      });
      // ── Try to load ringtone; fall back gracefully if file missing ──
      let source: any;
      try {
        source = require('../../assets/sounds/ringtone.mp3');
      } catch {
        console.warn('ringtone.mp3 not found in assets/sounds/ — skipping audio');
        return;
      }
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: true,
        isLooping: true,
        volume: 1.0,
      });
      ringtoneRef.current = sound;
    } catch (e) {
      console.warn('Ringtone error:', e);
    }
  };

  const stopAll = async () => {
    try {
      if (ringtoneRef.current) {
        await ringtoneRef.current.stopAsync();
        await ringtoneRef.current.unloadAsync();
        ringtoneRef.current = null;
      }
    } catch {}
    try {
      if (adhanRef.current) {
        await adhanRef.current.stopAsync();
        await adhanRef.current.unloadAsync();
        adhanRef.current = null;
      }
    } catch {}
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleAnswer = async () => {
    // Stop ringtone
    try {
      if (ringtoneRef.current) {
        await ringtoneRef.current.stopAsync();
        await ringtoneRef.current.unloadAsync();
        ringtoneRef.current = null;
      }
    } catch {}

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setAnswered(true);

    // Play full adhan
    try {
      let adhanSource: any;
      try {
        adhanSource = require('../../assets/sounds/adhan.mp3');
      } catch {
        console.warn('adhan.mp3 not found in assets/sounds/ — skipping');
        adhanSource = null;
      }
      if (adhanSource) {
        const { sound } = await Audio.Sound.createAsync(adhanSource, {
          shouldPlay: true,
          isLooping: false,
          volume: 1.0,
        });
        adhanRef.current = sound;
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => {});
            adhanRef.current = null;
          }
        });
      }
    } catch (e) {
      console.warn('Adhan playback error:', e);
    }

    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
  };

  const handleDismiss = async () => {
    await stopAll();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onDismiss();
  };

  const formatTime = (s: number) => {
    const m   = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ── ANSWERED STATE ──
  if (answered) {
    return (
      <View style={styles.answeredContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.timerText}>{formatTime(elapsed)}</Text>
        <Text style={styles.prayerNameLarge}>{prayerArabic}</Text>
        <Text style={styles.adhanText}>
          {'اللهُ أَكْبَر\nاللهُ أَكْبَر\nحيّ على الصلاة\nحيّ على الفلاح'}
        </Text>
        <TouchableOpacity style={styles.hangupBtn} onPress={handleDismiss}>
          <Text style={styles.btnIcon}>📵</Text>
          <Text style={styles.hangupLabel}>إنهاء</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── RINGING STATE ──
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.incomingLabel}>نداء الصلاة</Text>

      {/* Pulse rings */}
      <View style={styles.pulseContainer}>
        {[ring1, ring2, ring3].map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                opacity: anim.interpolate({ inputRange: [1, 1.8], outputRange: [0.5, 0] }),
                transform: [{ scale: anim }],
              },
            ]}
          />
        ))}
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>🕌</Text>
        </View>
      </View>

      <Text style={styles.callerName}>{prayerArabic}</Text>
      <Text style={styles.callerSub}>{prayerName} · {prayerTime}</Text>
      <Text style={styles.hadith}>{'حيّ على الصلاة\nحيّ على الفلاح'}</Text>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDismiss}>
          <View style={[styles.circle, styles.declineCircle]}>
            <Text style={styles.btnIcon}>📵</Text>
          </View>
          <Text style={styles.btnLabel}>تجاهل</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleAnswer}>
          <View style={[styles.circle, styles.acceptCircle]}>
            <Text style={styles.btnIcon}>☎️</Text>
          </View>
          <Text style={styles.btnLabel}>الاستجابة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060d1a',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 90,
  },
  incomingLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    letterSpacing: 3,
    marginBottom: 48,
    fontFamily: 'Cairo_400Regular',
  },
  pulseContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(201,146,46,0.5)',
  },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#0d1e38',
    borderWidth: 2,
    borderColor: 'rgba(201,146,46,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  avatarIcon: { fontSize: 48 },
  callerName: {
    color: '#fff',
    fontSize: 34,
    fontFamily: 'Amiri_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  callerSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    letterSpacing: 1.5,
    marginBottom: 48,
    fontFamily: 'Cairo_400Regular',
  },
  hadith: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 32,
    fontFamily: 'Amiri_400Regular',
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 50,
    paddingBottom: 70,
  },
  actionBtn: { alignItems: 'center', gap: 10 },
  circle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineCircle: { backgroundColor: 'rgba(200,50,50,0.9)' },
  acceptCircle:  { backgroundColor: 'rgba(30,160,90,0.9)' },
  btnIcon:  { fontSize: 30 },
  btnLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: 'Cairo_400Regular' },

  // Answered
  answeredContainer: {
    flex: 1,
    backgroundColor: '#040c18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 40,
  },
  timerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    fontFamily: 'Cairo_400Regular',
    letterSpacing: 2,
  },
  prayerNameLarge: {
    color: '#fff',
    fontSize: 32,
    textAlign: 'center',
    fontFamily: 'Amiri_700Bold',
  },
  adhanText: {
    color: 'rgba(201,146,46,0.7)',
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 40,
    fontFamily: 'Amiri_400Regular',
  },
  hangupBtn: {
    marginTop: 16,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(200,50,50,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangupLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontFamily: 'Cairo_400Regular',
    marginTop: 2,
  },
});
