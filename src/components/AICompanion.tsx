import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { FONTS, SPACING, RADIUS, ThemeColors } from '../constants/theme';
import { askClaude } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  'ما فضل يوم عرفة؟',
  'ما أفضل الأدعية يوم عرفة؟',
  'ما حكم صيام أيام البيض؟',
  'ما فضل الأشهر الحرم؟',
  'ما فضل قيام الليل في العشر الأواخر؟',
  'ما المقصود بالأشهر الحرم؟',
  'كيف أستغل عشر ذي الحجة؟',
];

export default function AICompanion() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      text: 'السلام عليكم ورحمة الله وبركاته 🌙\n\nأنا مساعدك الديني. يمكنك سؤالي عن فضل الأيام، الأدعية، الأحكام الشرعية، أو أي سؤال ديني.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const reply = await askClaude(question);
    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', text: reply };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <>
      {/* Floating Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
          <Text style={styles.fabIcon}>🤖</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Chat Modal */}
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.modal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.modalHeaderCenter}>
              <Text style={styles.modalTitle}>المساعد الديني</Text>
              <Text style={styles.modalSub}>مدعوم بالذكاء الاصطناعي</Text>
            </View>
            <View style={styles.aiDot}>
              <View style={styles.aiDotInner} />
            </View>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 20, gap: SPACING.md }}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                {msg.role === 'assistant' && (
                  <Text style={styles.assistantLabel}>🤖 المساعد الديني</Text>
                )}
                <Text style={[styles.messageText, msg.role === 'user' && styles.userText]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator color={colors.gold} size="small" />
                <Text style={styles.loadingText}>جارٍ التفكير...</Text>
              </View>
            )}
          </ScrollView>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
              contentContainerStyle={{ paddingHorizontal: SPACING.lg, gap: 8 }}
            >
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <TouchableOpacity key={i} style={styles.suggestionPill} onPress={() => sendMessage(q)}>
                  <Text style={styles.suggestionText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="اسأل سؤالاً دينياً..."
              placeholderTextColor={colors.muted}
              multiline
              textAlign="right"
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <Text style={styles.sendBtnText}>إرسال</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  fabContainer: { position: 'absolute', bottom: 90, left: 20, zIndex: 999 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: colors.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabIcon: { fontSize: 24 },
  modal: { flex: 1, backgroundColor: colors.deep },
  modalHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(201,146,46,0.2)', backgroundColor: colors.deep2 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgTint, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: colors.muted, fontSize: 14 },
  modalHeaderCenter: { flex: 1, alignItems: 'center' },
  modalTitle: { fontFamily: FONTS.amiriBold, fontSize: 20, color: colors.goldLight },
  modalSub: { fontFamily: FONTS.cairo, fontSize: 11, color: colors.muted },
  aiDot: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  aiDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green3 },
  messageList: { flex: 1 },
  messageBubble: { borderRadius: RADIUS.md, padding: SPACING.md, maxWidth: '88%' },
  assistantBubble: { backgroundColor: colors.deep2, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(201,146,46,0.15)' },
  userBubble: { backgroundColor: colors.green, alignSelf: 'flex-end' },
  assistantLabel: { fontFamily: FONTS.cairo, fontSize: 10, color: colors.gold, marginBottom: 4 },
  messageText: { fontFamily: FONTS.amiri, fontSize: 15, color: colors.cream2, lineHeight: 26 },
  userText: { color: 'white' },
  loadingText: { fontFamily: FONTS.cairo, fontSize: 12, color: colors.muted, marginTop: 4 },
  suggestionsScroll: { maxHeight: 50, marginBottom: SPACING.sm },
  suggestionPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: colors.deep2, borderWidth: 1, borderColor: 'rgba(201,146,46,0.25)' },
  suggestionText: { fontFamily: FONTS.amiri, fontSize: 13, color: colors.cream3 },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: 'rgba(201,146,46,0.15)', backgroundColor: colors.deep2 },
  input: { flex: 1, backgroundColor: colors.deep3, borderRadius: RADIUS.md, padding: SPACING.md, color: colors.cream, fontFamily: FONTS.cairo, fontSize: 14, minHeight: 44, maxHeight: 120, borderWidth: 1, borderColor: 'rgba(201,146,46,0.2)' },
  sendBtn: { backgroundColor: colors.gold, borderRadius: RADIUS.md, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { fontFamily: FONTS.cairoBold, fontSize: 13, color: colors.deep },
});
