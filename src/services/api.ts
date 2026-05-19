export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface HijriDate {
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
  weekday: { en: string; ar: string };
}

export interface AladhanResponse {
  timings: PrayerTimes;
  date: {
    hijri: HijriDate;
    gregorian: { date: string; weekday: { en: string } };
  };
}

const BASE_URL = 'https://api.aladhan.com/v1';

export const fetchPrayerTimes = async (
  latitude: number,
  longitude: number
): Promise<AladhanResponse | null> => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const url = `${BASE_URL}/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=5&school=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let json: { data: AladhanResponse };
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error('Network response was not ok');
      json = await response.json();
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }

    return json.data as AladhanResponse;
  } catch (error) {
    console.warn('Prayer times fetch failed:', error);
    return null;
  }
};

export const fetchHijriDate = async (): Promise<HijriDate | null> => {
  try {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const url = `${BASE_URL}/gToH/${day}-${month}-${year}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Failed to fetch Hijri date');
    const json = await response.json();
    return json.data.hijri as HijriDate;
  } catch (error) {
    console.warn('Hijri date fetch failed:', error);
    return null;
  }
};

export const fetchMonthCalendar = async (
  latitude: number,
  longitude: number,
  month: number,
  year: number,
  _hijri = false
): Promise<AladhanResponse[]> => {
  try {
    const url = `${BASE_URL}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=5`;
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Calendar fetch failed');
    const json = await response.json();
    return (json.data as AladhanResponse[]) || [];
  } catch (error) {
    console.warn('Calendar fetch failed:', error);
    return [];
  }
};

// Claude AI integration
export const askClaude = async (question: string): Promise<string> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:
          'أنت مساعد إسلامي عالم بالفقه والحديث والتفسير. تجيب على الأسئلة الدينية بأدلة من القرآن الكريم والسنة النبوية الشريفة. أجب باللغة العربية دائماً. اجعل إجاباتك مختصرة ومفيدة وموثوقة.',
        messages: [{ role: 'user', content: question }],
      }),
    });
    const data = await response.json();
    return data.content?.[0]?.text || 'عذراً، لم أتمكن من الإجابة الآن.';
  } catch {
    return 'عذراً، حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.';
  }
};