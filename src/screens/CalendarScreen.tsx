import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import {
  HIJRI_MONTHS,
  HARAM_MONTHS,
  MONTH_VIRTUES,
  ISLAMIC_EVENTS,
} from '../constants/islamicData';
import { fetchHijriDate } from '../services/api';
import { toArabicNum } from '../utils/helpers';

const WEEKDAYS = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'];
const DAYS_IN_MONTH = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30];
const AYYAM_BEED = [13, 14, 15];

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(11); // ذو الحجة
  const [currentYear, setCurrentYear] = useState(1446);
  const [todayDay, setTodayDay] = useState(9);
  const [todayMonth, setTodayMonth] = useState(11);
  const [selectedDay, setSelectedDay] = useState(9);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayHijri();
  }, []);

  const loadTodayHijri = async () => {
    setLoading(true);
    const hijri = await fetchHijriDate();
    if (hijri) {
      const day = parseInt(hijri.day);
      const month = hijri.month.number - 1;
      const year = parseInt(hijri.year);
      setTodayDay(day);
      setTodayMonth(month);
      setCurrentMonth(month);
      setCurrentYear(year);
      setSelectedDay(day);
    }
    setLoading(false);
  };

  const changeMonth = (dir: number) => {
    let newMonth = currentMonth + dir;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; }
    if (newMonth > 11) { newMonth = 0; newYear += 1; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDay(-1);
  };

  const eventsInMonth = ISLAMIC_EVENTS.filter((e) => e.hijriMonth === currentMonth);
  const isHaram = HARAM_MONTHS.includes(currentMonth);
  const daysInMonth = DAYS_IN_MONTH[currentMonth];

  // Simple offset calculation (approximate)
  const offset = (currentMonth * 2 + 3) % 7;

  const getEventForDay = (day: number) =>
    eventsInMonth.find((e) => e.hijriDay === day);

  const selectedEvent = selectedDay > 0 ? getEventForDay(selectedDay) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Month Navigation */}
      <View style={styles.calHeader}>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(-1)}>
          <Text style={styles.navBtnText}>▶</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.monthName}>{HIJRI_MONTHS[currentMonth]}</Text>
          <Text style={styles.yearText}>{toArabicNum(currentYear)} هـ</Text>
        </View>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeMonth(1)}>
          <Text style={styles.navBtnText}>◀</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', padding: 40 }}>
          <ActivityIndicator color={COLORS.gold} />
        </View>
      ) : (
        <>
          {/* Weekday headers */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((wd) => (
              <Text key={wd} style={styles.weekdayLabel}>{wd}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {Array.from({ length: offset }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayEmpty} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === todayDay && currentMonth === todayMonth;
              const isSelected = day === selectedDay;
              const isAyyam = AYYAM_BEED.includes(day);
              const event = getEventForDay(day);

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    isToday && styles.dayCellToday,
                    isSelected && !isToday && styles.dayCellSelected,
                    isAyyam && !isToday && styles.dayCellAyyam,
                    event && !isToday && styles.dayCellEvent,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                    {toArabicNum(day)}
                  </Text>
                  {event && (
                    <View style={[styles.eventDot, event.color === 'gold' ? styles.eventDotGold : styles.eventDotGreen]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
              <Text style={styles.legendText}>مناسبة إسلامية</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'rgba(240,201,106,0.5)' }]} />
              <Text style={styles.legendText}>أيام البيض</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.green3 }]} />
              <Text style={styles.legendText}>فضيلة</Text>
            </View>
          </View>

          {/* Selected Day Info */}
          {selectedEvent && (
            <View style={styles.selectedEventCard}>
              <Text style={styles.selectedEventIcon}>{selectedEvent.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedEventTitle}>{selectedEvent.title}</Text>
                <Text style={styles.selectedEventSig}>{selectedEvent.significance}</Text>
              </View>
            </View>
          )}

          {AYYAM_BEED.includes(selectedDay) && !selectedEvent && (
            <View style={styles.ayyamCard}>
              <Text style={styles.ayyamTitle}>🌕 يوم من أيام البيض</Text>
              <Text style={styles.ayyamText}>
                يُستحب صيام أيام البيض الثلاثة عشر والرابع عشر والخامس عشر من كل شهر هجري
              </Text>
            </View>
          )}

          {/* Month Info */}
          <View style={styles.monthInfoCard}>
            <Text style={styles.monthInfoTitle}>{HIJRI_MONTHS[currentMonth]}</Text>
            <Text style={styles.monthVirtue}>{MONTH_VIRTUES[currentMonth]}</Text>

            {isHaram && (
              <View style={styles.haramBox}>
                <Text style={styles.haramTitle}>🌙 شهر حرام</Text>
                <Text style={styles.haramText}>
                  وذو الحجة، والمُحرَّم، ورجب تسمى «الأشهر الحُرم»، وهذه الأشهر يوضع فيها القتال إلا ردًّا للعدوان، وتُضاعف فيها الحسنة كما تُضاعف السيئة.
                </Text>
              </View>
            )}

            <View style={styles.ayyamBox}>
              <Text style={styles.ayyamBoxText}>
                📅 أيام البيض: ١٣، ١٤، ١٥ — ليالٍ يكتمل فيها نور القمر. يُستحب صيامها.
              </Text>
            </View>

            {eventsInMonth.length > 0 && (
              <View style={{ marginTop: SPACING.md }}>
                <Text style={styles.eventsInMonthTitle}>مناسبات هذا الشهر:</Text>
                {eventsInMonth.map((ev) => (
                  <View key={ev.id} style={styles.evInMonthItem}>
                    <Text style={styles.evInMonthIcon}>{ev.icon}</Text>
                    <Text style={styles.evInMonthLabel}>{ev.title}</Text>
                    <Text style={styles.evInMonthDay}>{toArabicNum(ev.hijriDay)} {HIJRI_MONTHS[ev.hijriMonth]}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deep },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(201,146,46,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,146,46,0.3)' },
  navBtnText: { color: COLORS.gold, fontSize: 14 },
  monthName: { fontFamily: FONTS.amiriBold, fontSize: 24, color: COLORS.goldLight },
  yearText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.muted },
  weekdaysRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: 6 },
  weekdayLabel: { flex: 1, textAlign: 'center', fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.lg, gap: 5 },
  dayEmpty: { width: `${100 / 7}%`, aspectRatio: 1 },
  dayCell: { width: `${100 / 7 - 1}%`, aspectRatio: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayCellToday: { backgroundColor: COLORS.gold },
  dayCellSelected: { backgroundColor: 'rgba(201,146,46,0.2)', borderWidth: 1, borderColor: COLORS.gold },
  dayCellAyyam: { backgroundColor: 'rgba(240,201,106,0.1)', borderWidth: 1, borderColor: 'rgba(240,201,106,0.2)' },
  dayCellEvent: { backgroundColor: 'rgba(46,107,79,0.15)', borderWidth: 1, borderColor: 'rgba(76,175,133,0.25)' },
  dayNum: { fontFamily: FONTS.cairo, fontSize: 14, color: COLORS.cream2 },
  dayNumToday: { color: COLORS.deep, fontFamily: FONTS.cairoBold },
  eventDot: { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2 },
  eventDotGold: { backgroundColor: COLORS.gold },
  eventDotGreen: { backgroundColor: COLORS.green3 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: FONTS.cairo, fontSize: 10, color: COLORS.muted },
  selectedEventCard: { margin: SPACING.lg, backgroundColor: 'rgba(201,146,46,0.08)', borderRadius: RADIUS.md, padding: SPACING.md, flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start', borderWidth: 1, borderColor: 'rgba(201,146,46,0.25)' },
  selectedEventIcon: { fontSize: 28 },
  selectedEventTitle: { fontFamily: FONTS.amiriBold, fontSize: 18, color: COLORS.goldLight, marginBottom: 4 },
  selectedEventSig: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.cream3, lineHeight: 20 },
  ayyamCard: { margin: SPACING.lg, backgroundColor: 'rgba(240,201,106,0.07)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(240,201,106,0.2)' },
  ayyamTitle: { fontFamily: FONTS.amiriBold, fontSize: 16, color: COLORS.goldLight, marginBottom: 6 },
  ayyamText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.cream3, lineHeight: 20 },
  monthInfoCard: { margin: SPACING.lg, backgroundColor: COLORS.deep2, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(201,146,46,0.15)' },
  monthInfoTitle: { fontFamily: FONTS.amiriBold, fontSize: 20, color: COLORS.goldLight, marginBottom: 8 },
  monthVirtue: { fontFamily: FONTS.amiri, fontSize: 14, color: COLORS.cream2, lineHeight: 24 },
  haramBox: { marginTop: SPACING.md, backgroundColor: 'rgba(201,146,46,0.06)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(201,146,46,0.25)' },
  haramTitle: { fontFamily: FONTS.amiriBold, fontSize: 15, color: COLORS.goldLight, marginBottom: 6 },
  haramText: { fontFamily: FONTS.amiri, fontSize: 13, color: COLORS.cream3, lineHeight: 22 },
  ayyamBox: { marginTop: SPACING.sm, backgroundColor: 'rgba(240,201,106,0.06)', borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(240,201,106,0.15)' },
  ayyamBoxText: { fontFamily: FONTS.cairo, fontSize: 12, color: COLORS.cream3, lineHeight: 20 },
  eventsInMonthTitle: { fontFamily: FONTS.cairoBold, fontSize: 13, color: COLORS.muted, marginBottom: 8 },
  evInMonthItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  evInMonthIcon: { fontSize: 18 },
  evInMonthLabel: { fontFamily: FONTS.amiri, fontSize: 16, color: COLORS.cream, flex: 1 },
  evInMonthDay: { fontFamily: FONTS.cairo, fontSize: 11, color: COLORS.muted },
});
