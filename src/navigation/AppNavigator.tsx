import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS } from '../constants/theme';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import EventsScreen from '../screens/EventsScreen';
import DhikrScreen from '../screens/DhikrScreen';
import QuranScreen from '../screens/QuranScreen';
import HeartMapScreen from '../screens/HeartMapScreen';
import DuaaScreen from '../screens/DuaaScreen';
import QiblaScreen from '../screens/QiblaScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Prayers',  icon: '🕌', label: 'الصلاة',   component: PrayerTimesScreen },
  { name: 'Calendar', icon: '🗓',  label: 'التقويم',  component: CalendarScreen },
  { name: 'Events',   icon: '✨',  label: 'مناسبات',  component: EventsScreen },
  { name: 'Dhikr',    icon: '📿',  label: 'الأذكار',  component: DhikrScreen },
  { name: 'Quran',    icon: '📖',  label: 'القرآن',   component: QuranScreen },
  { name: 'Heart',    icon: '🫀',  label: 'القلب',    component: HeartMapScreen },
  { name: 'Duaa',     icon: '🤲',  label: 'أدعية',    component: DuaaScreen },
  { name: 'Qibla',    icon: '🧭',  label: 'القبلة',   component: QiblaScreen },
];

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
      {focused && <View style={styles.focusPill} />}
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={tab.icon} label={tab.label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.deep2,
    borderTopColor: 'rgba(201,146,46,0.15)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 80 : 68,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    paddingTop: 0,
    // Subtle inner shadow effect
    shadowColor: COLORS.goldLight,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 14,
    gap: 2,
    minWidth: 42,
    position: 'relative',
  },
  tabItemFocused: {},
  focusPill: {
    position: 'absolute',
    top: -2,
    left: '10%',
    right: '10%',
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
  },
  tabIcon: {
    fontSize: 21,
    opacity: 0.55,
  },
  tabIconFocused: {
    opacity: 1,
    fontSize: 22,
  },
  tabLabel: {
    fontFamily: FONTS.cairo,
    fontSize: 9,
    color: COLORS.muted,
    textAlign: 'center',
  },
  tabLabelFocused: {
    color: COLORS.goldLight,
    fontFamily: FONTS.cairoBold,
    fontSize: 10,
  },
});
