import React, { useState, useEffect, useCallback } from 'react';
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
  ASHARA_DAY_TASKS,
  IslamicEvent,
} from '../constants/islamicData';
import { toArabicNum } from '../utils/helpers';
import { getEventChecks, toggleEventCheck } from '../services/storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function EventsScreen() {
  const [expandedId, setExpandedId] = useState<string | null>('arafa');
  const [checks, setChecks] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    loadAllChecks();
  }, []);

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

  const getDoneCount = (eventId: string, total: number) => {
    const c = checks[eventId] || {};
    return Object.values(c).filter(Boolean).length;
  };

  // Today is Arafa (9 Dhul Hijjah) - show special banner
  const arafaEvent = ISLAMIC_EVENTS.find((e) => e.id === 'arafa')!;
  const asharaEvent = ISLAMIC_EVENTS.find((e) => e.id === 'ashara_dhul_hijjah')!;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <Text style={styles.screenTitle}>المناسبات الإسلامية</Text>

      {/* Arafa Special Banner - TODAY */}
      <View style={styles.todayBanner}>
        <Text style={styles.todayBannerEmoji}>🌄</Text>
        <Text style={styles.todayBannerTitle}>يوم عرفة — اليوم</Text>
        <Text style={styles.todayBannerSub}>
          يوم تُرفع الأيادي تضرعًا وتُكفَّر السنوات. استغل كل لحظة.
        </Text>
        <TouchableOpacity
          style={styles.todayBannerBtn}
          onPress={() => toggleExpand('arafa')}
        >
          <Text style={styles.todayBannerBtnText}>
            {expandedId === 'arafa' ? 'إخفاء الخطة' : '📋 خطة يوم عرفة الكاملة'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Arafa Full Day Plan */}
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
              «خير الدعاء دعاء يوم عرفة، وخير ما قلت أنا والنبيون من قبلي: لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير»
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
                  const key = `arafa_${pi}_${ti}`;
                  const done = checks['arafa']?.[key];
                  return (
                    <TouchableOpacity
                      key={ti}
                      style={styles.taskItem}
                      onPress={() => handleToggle('arafa', parseInt(`${pi}0${ti}`))}
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

      {/* Ashara Dhul Hijjah Tracker */}
      <EventCard
        event={asharaEvent}
        expanded={expandedId === asharaEvent.id}
        onToggle={() => toggleExpand(asharaEvent.id)}
        checks={checks[asharaEvent.id] || {}}
        onCheck={(i) => handleToggle(asharaEvent.id, i)}
        doneCount={getDoneCount(asharaEvent.id, asharaEvent.amaal.length)}
        daysLeft={0}
        showAshara
      />

      {/* All Other Events */}
      {ISLAMIC_EVENTS.filter(
        (e) => e.id !== 'arafa' && e.id !== 'ashara_dhul_hijjah'
      ).map((event) => {
        const daysLeft = event.hijriMonth === 11 && event.hijriDay === 10 ? 1
          : event.hijriMonth === 11 && event.hijriDay === 1 ? 0
          : Math.abs(event.hijriMonth * 29 + event.hijriDay - (11 * 29 + 9));

        return (
          <EventCard
            key={event.id}
            event={event}
            expanded={expandedId === event.id}
            onToggle={() => toggleExpand(event.id)}
            checks={checks[event.id] || {}}
            onCheck={(i) => handleToggle(event.id, i)}
            doneCount={getDoneCount(event.id, event.amaal.length)}
            daysLeft={daysLeft}
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
  showAshara?: boolean;
}

function EventCard({
  event, expanded, onToggle, checks, onCheck, doneCount, daysLeft, showAshara
}: EventCardProps) {
  const total = event.amaal.length;
  const progress = total > 0 ? doneCount / total : 0;

  return (
    <View style={styles.eventCard}>
      <TouchableOpacity style={styles.eventCardHeader} onPress={onToggle}>
        <View style={[styles.eventIcon, styles[`icon_${event.color}` as keyof typeof styles]]}>
          <Text style={styles.eventIconText}>{event.icon}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>
            {toArabicNum(event.hijriDay)} {/* month name */}
            {doneCount > 0 && ` · ${toArabicNum(doneCount)}/${toArabicNum(total)} مهام`}
          </Text>
          {total > 0 && (
            <View style={styles.miniProgressOuter}>
              <View style={[styles.miniProgressInner, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>
        <View style={[styles.daysLeftBadge, daysLeft === 0 && styles.daysLeftToday]}>
          <Text style={styles.daysLeftText}>{daysLeft === 0 ? '⬤ اليوم' : `${toArabicNum(daysLeft)} يوم`}</Text>
        </View>
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
              <TouchableOpacity key={i} style={styles.taskItem} onPress={() => onCheck(i)}>
                <View style={[styles.taskCheck, done && styles.taskCheckDone]}>
                  {done && <Text style={styles.taskCheckMark}>✓</Text>}
                </View>
                <Text style={[styles.taskText, done && styles.taskTextDone]}>{amaal}</Text>
              </TouchableOpacity>
            );
          })}
          {showAshara && (
            <View style={styles.asharaNote}>
              <Text style={styles.asharaNoteText}>
                💡 تتبع العشر يومًا بيوم — ضع علامة على كل عمل تؤديه كل يوم
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },
  screenTitle: { fontFamily: FONTS.amiriBold, fontSize: 22, color: COLORS.goldLight, padding: SPACING.lg, paddingBottom: SPACING.sm },
  todayBanner: {
    margin: SPACING.lg, marginTop: 0,
    backgroundColor: 'rgba(201,146,46,0.1)',
    borderWidth: 1, borderColor: 'rgba(201,146,46,0.35)',
    borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center',
  },
  todayBannerEmoji: { fontSize: 40, marginBottom: 8 },
  todayBannerTitle: { fontFamily: FONTS.amiriBold, fontSize: 24, color: COLORS.goldLight, marginBottom: 6 },
  todayBannerSub: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream3, textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  todayBannerBtn: { backgroundColor: COLORS.gold, borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 10 },
  todayBannerBtnText: { fontFamily: FONTS.cairoBold, fontSize: 14, color: COLORS.deep },
  dayPlanContainer: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  periodCard: { backgroundColor: COLORS.deep2, borderRadius: RADIUS.md, marginBottom: SPACING.sm, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(201,146,46,0.1)' },
  periodHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, backgroundColor: 'rgba(201,146,46,0.07)', borderBottomWidth: 1, borderBottomColor: 'rgba(201,146,46,0.12)' },
  periodIcon: { fontSize: 22 },
  periodName: { fontFamily: FONTS.amiriBold, fontSize: 16, color: COLORS.goldLight },
  periodTime: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted },
  periodTasks: { padding: SPACING.md, gap: SPACING.sm },
  hadithBox: { backgroundColor: 'rgba(201,146,46,0.05)', borderRightWidth: 3, borderRightColor: COLORS.gold, padding: SPACING.md, borderRadius: RADIUS.sm, marginBottom: SPACING.sm },
  hadithText: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream3, lineHeight: 26 },
  hadithRef: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted, marginTop: 4 },
  eventCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md, backgroundColor: COLORS.deep2, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.12)', overflow: 'hidden' },
  eventCardHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  eventIcon: { width: 48, height: 48, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  icon_gold: { backgroundColor: 'rgba(201,146,46,0.15)' },
  icon_green: { backgroundColor: 'rgba(46,107,79,0.2)' },
  icon_blue: { backgroundColor: 'rgba(30,80,140,0.2)' },
  eventIconText: { fontSize: 22 },
  eventMeta: { flex: 1 },
  eventTitle: { fontFamily: FONTS.amiriBold, fontSize: 18, color: COLORS.cream },
  eventDate: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted, marginTop: 2 },
  miniProgressOuter: { height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  miniProgressInner: { height: 3, backgroundColor: COLORS.green3, borderRadius: 2 },
  daysLeftBadge: { backgroundColor: 'rgba(201,146,46,0.1)', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  daysLeftToday: { backgroundColor: 'rgba(46,107,79,0.2)' },
  daysLeftText: { fontFamily: FONTS.cairoBold, fontSize: 11, color: COLORS.goldLight },
  eventBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm },
  eventSig: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream3, lineHeight: 24 },
  amaalTitle: { fontFamily: FONTS.cairoBold, fontSize: 13, color: COLORS.muted, marginTop: SPACING.sm },
  taskItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.deep3, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md },
  taskCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(201,146,46,0.35)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  taskCheckDone: { backgroundColor: COLORS.green2, borderColor: COLORS.green3 },
  taskCheckMark: { fontSize: 12, color: 'white' },
  taskText: { fontFamily: FONTS.cairo, fontSize: 13, color: COLORS.cream2, flex: 1 },
  taskTextDone: { color: COLORS.muted, textDecorationLine: 'line-through' },
  asharaNote: { backgroundColor: 'rgba(46,107,79,0.1)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(76,175,133,0.2)' },
  asharaNoteText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.green3, lineHeight: 20 },
});
