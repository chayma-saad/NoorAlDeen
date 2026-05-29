import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { FONTS, SPACING, RADIUS, ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

function toRad(deg: number) { return (deg * Math.PI) / 180; }
function toDeg(rad: number) { return (rad * 180) / Math.PI; }

function calcQibla(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(MECCA_LAT);
  const Δλ = toRad(MECCA_LNG - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export default function QiblaScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [qibla, setQibla] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsCompassPermission, setNeedsCompassPermission] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    getLocation();
    return () => cleanupRef.current?.();
  }, []);

  const getLocation = async () => {
    setLoading(true);
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('نحتاج إذن الموقع لحساب اتجاه القبلة');
      setLoading(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setQibla(calcQibla(loc.coords.latitude, loc.coords.longitude));
    } catch {
      setError('تعذر تحديد موقعك');
      setLoading(false);
      return;
    }

    setLoading(false);
    startCompass();
  };

  const startCompass = () => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') return;

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setNeedsCompassPermission(true);
      return;
    }

    attachCompassListener();
  };

  const requestCompassPermission = async () => {
    try {
      const result = await (DeviceOrientationEvent as any).requestPermission();
      if (result === 'granted') {
        setNeedsCompassPermission(false);
        attachCompassListener();
      } else {
        setError('لم يتم منح إذن البوصلة');
      }
    } catch {
      setError('تعذر الوصول إلى البوصلة');
    }
  };

  const attachCompassListener = () => {
    const handler = (e: DeviceOrientationEvent) => {
      const compassHeading =
        (e as any).webkitCompassHeading ??
        (e.alpha !== null ? (360 - e.alpha) % 360 : 0);
      setHeading(compassHeading);
    };

    window.addEventListener('deviceorientationabsolute', handler as EventListener, true);
    window.addEventListener('deviceorientation', handler as EventListener, true);

    cleanupRef.current = () => {
      window.removeEventListener('deviceorientationabsolute', handler as EventListener, true);
      window.removeEventListener('deviceorientation', handler as EventListener, true);
    };
  };

  const needleAngle = qibla !== null ? qibla - heading : 0;
  const normalised = ((needleAngle % 360) + 360) % 360;
  const aligned = normalised < 10 || normalised > 350;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} size="large" />
        <Text style={styles.loadingText}>جارٍ تحديد موقعك...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={getLocation}>
          <Text style={styles.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerDecor}>✦ القبلة ✦</Text>
        <Text style={styles.headerSub}>اتجاه الكعبة المشرفة</Text>
      </View>

      {/* Compass */}
      <View style={styles.compassWrapper}>
        <View style={styles.compassOuter}>
          <Text style={[styles.cardinal, styles.cardinalN]}>ش</Text>
          <Text style={[styles.cardinal, styles.cardinalS]}>ج</Text>
          <Text style={[styles.cardinal, styles.cardinalE]}>ق</Text>
          <Text style={[styles.cardinal, styles.cardinalW]}>غ</Text>

          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <View
              key={deg}
              style={[
                styles.tick,
                { transform: [{ rotate: `${deg}deg` }] },
              ]}
            />
          ))}

          <View style={styles.compassInner}>
            <View
              style={[
                styles.needleWrap,
                { transform: [{ rotate: `${needleAngle}deg` }] },
              ]}
            >
              <View style={[styles.needleHalf, styles.needleTop]} />
              <View style={[styles.needleHalf, styles.needleBottom]} />
            </View>

            <View style={styles.centreDot}>
              <Text style={styles.kaabaEmoji}>🕋</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusBadge, aligned && styles.statusAligned]}>
          <Text style={[styles.statusText, aligned && styles.statusTextAligned]}>
            {aligned
              ? '✓ أنت تواجه القبلة'
              : `اتجاه القبلة: ${Math.round(qibla!)}°`}
          </Text>
        </View>

        {needsCompassPermission ? (
          <TouchableOpacity style={styles.compassBtn} onPress={requestCompassPermission}>
            <Text style={styles.compassBtnText}>🧭 تفعيل البوصلة</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.hint}>وجّه هاتفك حتى تشير الإبرة الذهبية للأعلى</Text>
        )}
      </View>

      {/* Distance to Mecca info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          الكعبة المشرفة · مكة المكرمة
        </Text>
        <Text style={styles.infoSub}>
          الإبرة الذهبية تشير نحو القبلة دائماً
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.deep },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.deep },

  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerDecor: {
    fontFamily: FONTS.amiriBold,
    fontSize: 22,
    color: colors.goldLight,
    letterSpacing: 2,
    marginBottom: 6,
  },
  headerSub: {
    fontFamily: FONTS.cairo,
    fontSize: 13,
    color: colors.muted,
  },

  compassWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  compassOuter: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.deep2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardinal: {
    position: 'absolute',
    fontFamily: FONTS.cairoBold,
    fontSize: 15,
    color: colors.goldLight,
  },
  cardinalN: { top: 12 },
  cardinalS: { bottom: 12 },
  cardinalE: { right: 12 },
  cardinalW: { left: 12 },
  tick: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 2,
    height: 14,
    backgroundColor: 'rgba(201,146,46,0.3)',
    marginLeft: -1,
    transformOrigin: 'bottom center',
  },

  compassInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(201,146,46,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  needleWrap: {
    position: 'absolute',
    width: 10,
    height: 160,
    alignItems: 'center',
  },
  needleHalf: {
    width: 10,
    height: 80,
    borderRadius: 5,
  },
  needleTop: {
    backgroundColor: colors.gold,
  },
  needleBottom: {
    backgroundColor: 'rgba(201,146,46,0.25)',
  },

  centreDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.deep,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaabaEmoji: { fontSize: 20 },

  statusBadge: {
    backgroundColor: colors.deep2,
    borderRadius: RADIUS.full,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(201,146,46,0.3)',
  },
  statusAligned: {
    borderColor: colors.green3,
    backgroundColor: 'rgba(60,168,124,0.1)',
  },
  statusText: {
    fontFamily: FONTS.cairoSemiBold,
    fontSize: 14,
    color: colors.goldLight,
  },
  statusTextAligned: { color: colors.green3 },

  compassBtn: {
    backgroundColor: colors.gold,
    borderRadius: RADIUS.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  compassBtnText: {
    fontFamily: FONTS.cairoBold,
    fontSize: 15,
    color: colors.deep,
  },

  hint: {
    fontFamily: FONTS.cairo,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  infoCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    backgroundColor: colors.deep2,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,146,46,0.1)',
  },
  infoText: {
    fontFamily: FONTS.amiri,
    fontSize: 16,
    color: colors.cream2,
    marginBottom: 4,
  },
  infoSub: {
    fontFamily: FONTS.cairo,
    fontSize: 11,
    color: colors.muted,
  },

  loadingText: {
    fontFamily: FONTS.cairo,
    color: colors.muted,
    marginTop: 14,
    fontSize: 14,
  },
  errorText: {
    fontFamily: FONTS.cairo,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  retryBtn: {
    backgroundColor: colors.gold,
    borderRadius: RADIUS.full,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: {
    fontFamily: FONTS.cairoBold,
    fontSize: 13,
    color: colors.deep,
  },
});
