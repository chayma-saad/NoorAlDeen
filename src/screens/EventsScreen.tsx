import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import {
  ISLAMIC_EVENTS,
  ARAFA_DAY_PLAN,
  IslamicEvent,
} from '../constants/islamicData';
import { toArabicNum } from '../utils/helpers';
import { getEventChecks, toggleEventCheck } from '../services/storage';
import { fetchHijriDate } from '../services/api';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Estimate days between current Hijri date and a target event (0-indexed months)
function daysUntilEvent(
  currentDay: number,
  currentMonth: number, // 0-indexed
  targetDay: number,
  targetMonth: number  // 0-indexed
): number {
  // Average Hijri year ≈ 354.37 days, month ≈ 29.53 days
  const MONTH = 29.53;
  const YEAR = 354;

  const currentPos = currentMonth * MONTH + currentDay;
  const targetPos = targetMonth * MONTH + targetDay;
  let diff = targetPos - currentPos;
  if (diff < 0) diff += YEAR;
  return Math.round(diff);
}

export default function EventsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});
  const [hijriDay, setHijriDay] = useState(0);
  const [hijriMonth, setHijriMonth] = useState(0); // 0-indexed

  useEffect(() => {
    loadAllChecks();
    loadHijriDate();
  }, []);

  const loadHijriDate = async () => {
    try {
      const h = await fetchHijriDate();
      if (h) {
        setHijriDay(parseInt(h.day, 10));
        setHijriMonth(h.month.number - 1); // API is 1-based → 0-based
      }
    } catch {}
  };

  const loadAllChecks = async () => {
    const allChecks: Record<string, Record<string, boolean>> = {};
    for (const ev of ISLAMIC_EVENTS) {
      allChecks[ev.id] = await getEventChecks(ev.id);
    }
    setChecks(allChecks);
  };

  const handleToggle = async (eventId: string, taskIndex: number) => {
    const newVal = await toggleEventCheck(eventId, taskIndex);
    setChecks((prev) => ({
      ...prev,
      [eventId]: { ...prev[eventId], [String(taskIndex)]: newVal },
    }));
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const getDoneCount = (eventId: string) => {
    const c = checks[eventId] || {};
    return Object.values(c).filter(Boolean).length;
  };

  // Which event is happening today or soonest?
  const todayEvent = ISLAMIC_EVENTS.find(
    (e) => e.hijriDay === hijriDay && e.hijriMonth === hijriMonth
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerDecor}>✦ ✦ ✦</Text>
        <Text style={styles.headerTitle}>المناسبات الإسلامية</Text>
        <Text style={styles.headerSub}>تقويم السنة الهجرية</Text>
      </View>

      {/* Today's event banner */}
      {todayEvent && (
        <View style={styles.todayBanner}>
          <Text style={styles.todayIcon}>{todayEvent.icon}</Text>
          <View style={styles.todayTextBlock}>
            <Text style={styles.todayLabel}>اليوم ·</Text>
            <Text style={styles.todayTitle}>{todayEvent.title}</Text>
          </View>
          <TouchableOpacity
            style={styles.todayBtn}
            onPress={() => toggleExpand(todayEvent.id)}
          >
            <Text style={styles.todayBtnText}>
              {expandedId === todayEvent.id ? 'إخفاء' : 'خطة اليوم'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Arafa special full-day plan */}
      {expandedId === 'arafa' && (
        <View style={styles.dayPlanContainer}>
          <View style={styles.hadithBox}>
            <Text style={styles.hadithText}>
              «صيام يوم عرفة أحتسب على الله أن يكفر السنة التي قبله والسنة التي بعده»
            </Text>
            <Text style={styles.hadithRef}>رواه مسلم</Text>
          </View>
          <View style={styles.hadithBox}>
            <Text style={styles.hadithText}>
              «خير الدعاء دعاء يوم عرفة، وخير ما قلت أنا والنبيون من قبلي: لا إله إلا الله وحده لا شريك له»
            </Text>
            <Text style={styles.hadithRef}>رواه الترمذي</Text>
          </View>
          {ARAFA_DAY_PLAN.map((period, pi) => (
            <View key={pi} style={styles.periodCard}>
              <View style={styles.periodHeader}>
                <Text style={styles.periodIcon}>{period.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.periodName}>{period.period}</Text>
                  <Text style={styles.periodTime}>{period.timeRange}</Text>
                </View>
              </View>
              <View style={styles.periodTasks}>
                {period.tasks.map((task, ti) => {
                  // Consistent unique key: period-index * 100 + task-index
                  const taskIdx = pi * 100 + ti;
                  const done = checks['arafa']?.[String(taskIdx)];
                  return (
                    <TouchableOpacity
                      key={ti}
                      style={[styles.taskItem, done && styles.taskItemDone]}
                      onPress={() => handleToggle('arafa', taskIdx)}
                    >
                      <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                        {done && <Text style={styles.taskCheckMark}>✓</Text>}
                      </View>
                      <Text style={[styles.taskText, done && styles.taskTextDone]}>{task}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* All events */}
      {ISLAMIC_EVENTS.map((event) => {
        const daysLeft = hijriMonth > 0 || hijriDay > 0
          ? daysUntilEvent(hijriDay, hijriMonth, event.hijriDay, event.hijriMonth)
          : -1;
        const isToday = daysLeft === 0;

        return (
          <EventCard
            key={event.id}
            event={event}
            expanded={expandedId === event.id}
            onToggle={() => toggleExpand(event.id)}
            checks={checks[event.id] || {}}
            onCheck={(i) => handleToggle(event.id, i)}
            doneCount={getDoneCount(event.id)}
            daysLeft={daysLeft}
            isToday={isToday}
          />
        );
      })}
    </ScrollView>
  );
}

interface EventCardProps {
  event: IslamicEvent;
  expanded: boolean;
  onToggle: () => void;
  checks: Record<string, boolean>;
  onCheck: (index: number) => void;
  doneCount: number;
  daysLeft: number;
  isToday: boolean;
}

function EventCard({
  event, expanded, onToggle, checks, onCheck, doneCount, daysLeft, isToday,
}: EventCardProps) {
  const total = event.amaal.length;
  const progress = total > 0 ? doneCount / total : 0;

  const accentColor = event.color === 'green' ? COLORS.green3
    : event.color === 'blue' ? COLORS.blue3
    : COLORS.gold;

  return (
    <View style={[styles.eventCard, isToday && { borderColor: accentColor }]}>
      <TouchableOpacity style={styles.eventCardHeader} onPress={onToggle} activeOpacity={0.8}>
        <View style={[styles.eventIcon, { backgroundColor: `${accentColor}22` }]}>
          <Text style={styles.eventIconText}>{event.icon}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {toArabicNum(event.hijriDay)} · الشهر {toArabicNum(event.hijriMonth + 1)}
          </Text>
          {total > 0 && doneCount > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressOuter}>
                <View style={[styles.progressInner, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
              </View>
              <Text style={[styles.progressLabel, { color: accentColor }]}>
                {toArabicNum(doneCount)}/{toArabicNum(total)}
              </Text>
            </View>
          )}
        </View>
        {daysLeft >= 0 && (
          <View style={[styles.badge, isToday && { backgroundColor: `${accentColor}33` }]}>
            <Text style={[styles.badgeText, { color: isToday ? accentColor : COLORS.cream3 }]}>
              {isToday ? 'اليوم' : `${toArabicNum(daysLeft)} يوم`}
            </Text>
          </View>
        )}
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.eventBody}>
          <Text style={styles.eventSig}>{event.significance}</Text>
          {event.hadith ? (
            <View style={styles.hadithBox}>
              <Text style={styles.hadithText}>«{event.hadith}»</Text>
              <Text style={styles.hadithRef}>{event.hadithRef}</Text>
            </View>
          ) : null}
          <Text style={styles.amaalTitle}>الأعمال المستحبة:</Text>
          {event.amaal.map((amaal, i) => {
            const done = checks[String(i)];
            return (
              <TouchableOpacity
                key={i}
                style={[styles.taskItem, done && styles.taskItemDone]}
                onPress={() => onCheck(i)}
              >
                <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                  {done && <Text style={styles.taskCheckMark}>✓</Text>}
                </View>
                <Text style={[styles.taskText, done && styles.taskTextDone]}>{amaal}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },

  header: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg },
  headerDecor: { fontSize: 12, color: COLORS.gold, letterSpacing: 8, marginBottom: 6 },
  headerTitle: { fontFamily: FONTS.amiriBold, fontSize: 26, color: COLORS.goldLight, marginBottom: 4 },
  headerSub: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.muted },

  todayBanner: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.deep2,
    borderRadius: RADIUS.lg, padding: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    borderWidth: 1, borderColor: COLORS.gold,
  },
  todayIcon: { fontSize: 30 },
  todayTextBlock: { flex: 1 },
  todayLabel: { fontFamily: FONTS.cairo, fontSize: 10, color: COLORS.gold },
  todayTitle: { fontFamily: FONTS.amiriBold, fontSize: 16, color: COLORS.goldLight },
  todayBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 7 },
  todayBtnText: { fontFamily: FONTS.cairoBold, fontSize: 12, color: COLORS.deep },

  dayPlanContainer: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },

  hadithBox: {
    backgroundColor: 'rgba(201,146,46,0.06)',
    borderRightWidth: 3, borderRightColor: COLORS.gold,
    padding: SPACING.md, borderRadius: RADIUS.sm, marginBottom: SPACING.sm,
  },
  hadithText: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream3, lineHeight: 26 },
  hadithRef: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted, marginTop: 4 },

  periodCard: {
    backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)', overflow: 'hidden',
  },
  periodHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, backgroundColor: 'rgba(201,146,46,0.07)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,146,46,0.12)',
  },
  periodIcon: { fontSize: 22 },
  periodName: { fontFamily: FONTS.amiriBold, fontSize: 15, color: COLORS.goldLight },
  periodTime: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted },
  periodTasks: { padding: SPACING.md, gap: SPACING.sm },

  eventCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.deep2, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)', overflow: 'hidden',
  },
  eventCardHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  eventIcon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  eventIconText: { fontSize: 22 },
  eventMeta: { flex: 1 },
  eventTitle: { fontFamily: FONTS.amiriBold, fontSize: 16, color: COLORS.cream },
  eventDate: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  progressOuter: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' },
  progressInner: { height: 3, borderRadius: 2 },
  progressLabel: { fontFamily: FONTS.cairo, fontSize: 10 },

  badge: {
    backgroundColor: 'rgba(201,146,46,0.08)', borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { fontFamily: FONTS.cairoBold, fontSize: 11 },
  chevron: { color: COLORS.muted, fontSize: 11, marginLeft: 2 },

  eventBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm },
  eventSig: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream3, lineHeight: 26 },
  amaalTitle: { fontFamily: FONTS.cairoBold, fontSize: 12, color: COLORS.muted, marginTop: SPACING.sm },

  taskItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.sm, backgroundColor: COLORS.deep3,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md,
  },
  taskItemDone: { opacity: 0.6 },
  taskCheck: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: 'rgba(201,146,46,0.35)', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  taskCheckDone: { backgroundColor: COLORS.green2, borderColor: COLORS.green3 },
  taskCheckMark: { fontSize: 12, color: 'white' },
  taskText: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.cream2, flex: 1 },
  taskTextDone: { color: COLORS.muted, textDecorationLine: 'line-through' },
});
