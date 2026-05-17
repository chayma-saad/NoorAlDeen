import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { COLORS, FONTS } from '../constants/theme';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import CalendarScreen from '../screens/CalendarScreen';
import EventsScreen from '../screens/EventsScreen';
import DhikrScreen from '../screens/DhikrScreen';
import QuranScreen from '../screens/QuranScreen';
import HeartMapScreen from '../screens/HeartMapScreen';
import DuaaScreen from '../screens/DuaaScreen';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
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
      }}
    >
      <Tab.Screen
        name="Prayers"
        component={PrayerTimesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🕌" label="الصلاة" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📅" label="التقويم" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⭐" label="المناسبات" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Dhikr"
        component={DhikrScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📿" label="الأذكار" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Quran"
        component={QuranScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📖" label="القرآن" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Heart"
        component={HeartMapScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🫀" label="القلب" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Duaa"
        component={DuaaScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🤲" label="الأدعية" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.deep2,
    borderTopColor: 'rgba(201,146,46,0.2)',
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 0,
    paddingTop: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 10,
    gap: 1,
  },
  tabItemActive: {
    backgroundColor: 'rgba(201,146,46,0.1)',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontFamily: FONTS.cairo,
    fontSize: 10,
    color: COLORS.muted,
  },
  tabLabelActive: {
    color: COLORS.goldLight,
    fontFamily: FONTS.cairoBold,
  },
});
