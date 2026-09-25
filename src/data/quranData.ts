export interface QuranWord {
  text: string;
  startRatio?: number;
  endRatio?: number;
}

export interface QuranSegment {
  id: number;
  verseRef: string;
  arabic: string;
  transliteration: string;
  translation: string;
  startTime: number;
  endTime: number;
  words: {
    ar: string;
    tr: string;
  }[];
}

export interface QuranCollection {
  id: string;
  title: string;
  arabicTitle: string;
  audioUrl?: string;
  description: string;
  segments: QuranSegment[];
}

export const AYAT_AL_KURSI_SEGMENTS: QuranSegment[] = [
  {
    id: 0,
    verseRef: "Opening",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    transliteration: "Bismillāhir-Raḥmānir-Raḥīm",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    startTime: 0.0,
    endTime: 4.6,
    words: [
      { ar: "بِسْمِ", tr: "In the name of" },
      { ar: "اللَّهِ", tr: "Allah" },
      { ar: "الرَّحْمَٰنِ", tr: "the Entirely Merciful" },
      { ar: "الرَّحِيمِ", tr: "the Especially Merciful" }
    ]
  },
  {
    id: 1,
    verseRef: "Al-Baqarah 2:255 • Part 1",
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ",
    transliteration: "Allāhu lā ilāha illā Huwal-Ḥayyul-Qayyūm",
    translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence.",
    startTime: 4.6,
    endTime: 10.8,
    words: [
      { ar: "اللَّهُ", tr: "Allah" },
      { ar: "لَا إِلَٰهَ", tr: "no deity" },
      { ar: "إِلَّا هُوَ", tr: "except Him" },
      { ar: "الْحَيُّ", tr: "the Ever-Living" },
      { ar: "الْقَيُّومُ", tr: "the Sustainer" }
    ]
  },
  {
    id: 2,
    verseRef: "Al-Baqarah 2:255 • Part 2",
    arabic: "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ",
    transliteration: "Lā ta'khudhuhū sinatuw-walā nawm",
    translation: "Neither drowsiness overtakes Him nor sleep.",
    startTime: 10.8,
    endTime: 15.6,
    words: [
      { ar: "لَا تَأْخُذُهُ", tr: "Neither overtakes Him" },
      { ar: "سِنَةٌ", tr: "drowsiness" },
      { ar: "وَلَا", tr: "nor" },
      { ar: "نَوْمٌ", tr: "sleep" }
    ]
  },
  {
    id: 3,
    verseRef: "Al-Baqarah 2:255 • Part 3",
    arabic: "لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ",
    transliteration: "Lahū mā fis-samāwāti wamā fil-arḍ",
    translation: "To Him belongs whatever is in the heavens and whatever is on the earth.",
    startTime: 15.6,
    endTime: 22.0,
    words: [
      { ar: "لَّهُ مَا فِي", tr: "To Him belongs whatever is in" },
      { ar: "السَّمَاوَاتِ", tr: "the heavens" },
      { ar: "وَمَا فِي", tr: "and whatever is in" },
      { ar: "الْأَرْضِ", tr: "the earth" }
    ]
  },
  {
    id: 4,
    verseRef: "Al-Baqarah 2:255 • Part 4",
    arabic: "مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ",
    transliteration: "Man dhal-ladhī yashfa‘u ‘indahū illā bi-idhnih",
    translation: "Who is it that can intercede with Him except by His permission?",
    startTime: 22.0,
    endTime: 28.6,
    words: [
      { ar: "مَن ذَا الَّذِي", tr: "Who is it that" },
      { ar: "يَشْفَعُ", tr: "can intercede" },
      { ar: "عِندَهُ", tr: "with Him" },
      { ar: "إِلَّا بِإِذْنِهِ", tr: "except by His permission" }
    ]
  },
  {
    id: 5,
    verseRef: "Al-Baqarah 2:255 • Part 5",
    arabic: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ",
    transliteration: "Ya‘lamu mā bayna aydīhim wamā khalfahum",
    translation: "He knows what is before them and what will be after them.",
    startTime: 28.6,
    endTime: 34.6,
    words: [
      { ar: "يَعْلَمُ", tr: "He knows" },
      { ar: "مَا بَيْنَ أَيْدِيهِمْ", tr: "what is before them" },
      { ar: "وَمَا", tr: "and what" },
      { ar: "خَلْفَهُمْ", tr: "is after them" }
    ]
  },
  {
    id: 6,
    verseRef: "Al-Baqarah 2:255 • Part 6",
    arabic: "وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ",
    transliteration: "Walā yuḥīṭūna bishay'im-min ‘ilmihī illā bimā shā'",
    translation: "And they encompass not a thing of His knowledge except for what He wills.",
    startTime: 34.6,
    endTime: 41.6,
    words: [
      { ar: "وَلَا يُحِيطُونَ", tr: "And they encompass not" },
      { ar: "بِشَيْءٍ", tr: "a thing" },
      { ar: "مِّنْ عِلْمِهِ", tr: "of His knowledge" },
      { ar: "إِلَّا بِمَا شَاءَ", tr: "except what He wills" }
    ]
  },
  {
    id: 7,
    verseRef: "Al-Baqarah 2:255 • Part 7",
    arabic: "وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ",
    transliteration: "Wasi‘a kursiyyuhus-samāwāti wal-arḍ",
    translation: "His Kursi extends over the heavens and the earth.",
    startTime: 41.6,
    endTime: 47.2,
    words: [
      { ar: "وَسِعَ", tr: "Extends" },
      { ar: "كُرْسِيُّهُ", tr: "His Kursi" },
      { ar: "السَّمَاوَاتِ", tr: "the heavens" },
      { ar: "وَالْأَرْضَ", tr: "and the earth" }
    ]
  },
  {
    id: 8,
    verseRef: "Al-Baqarah 2:255 • Part 8",
    arabic: "وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    transliteration: "Walā ya'ūduhū ḥifẓuhumā wahwal-‘Aliyyul-‘Aẓīm",
    translation: "And their preservation tires Him not. And He is the Most High, the Most Great.",
    startTime: 47.2,
    endTime: 53.96,
    words: [
      { ar: "وَلَا يَئُودُهُ", tr: "And tires Him not" },
      { ar: "حِفْظُهُمَا", tr: "preservation of them" },
      { ar: "وَهُوَ", tr: "and He is" },
      { ar: "الْعَلِيُّ", tr: "the Most High" },
      { ar: "الْعَظِيمُ", tr: "the Most Great" }
    ]
  }
];

export const PRESET_QURAN_COLLECTIONS: QuranCollection[] = [
  {
    id: 'ayat_alkursi',
    title: 'Ayat al-Kursi (The Throne Verse)',
    arabicTitle: 'آية الكرسي • ٢:٢٥٥',
    audioUrl: '/audio/ayat_alkursi_child.wav',
    description: 'Surah Al-Baqarah 2:255 • The supreme protector verse',
    segments: AYAT_AL_KURSI_SEGMENTS,
  },
  {
    id: 'surah_ikhlas',
    title: 'Surah Al-Ikhlas (Purity of Faith)',
    arabicTitle: 'سورة الإخلاص • ١١٢',
    audioUrl: '/audio/surah_ikhlas.mp3',
    description: 'Equivalent to one-third of the Holy Quran in reward',
    segments: [
      {
        id: 0,
        verseRef: "112:0",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        transliteration: "Bismillāhir-Raḥmānir-Raḥīm",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        startTime: 0.0,
        endTime: 4.2,
        words: [
          { ar: "بِسْمِ", tr: "In the name of" },
          { ar: "اللَّهِ", tr: "Allah" },
          { ar: "الرَّحْمَٰنِ", tr: "the Most Gracious" },
          { ar: "الرَّحِيمِ", tr: "the Most Merciful" }
        ]
      },
      {
        id: 1,
        verseRef: "112:1",
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        transliteration: "Qul huwa Allāhu aḥad",
        translation: "Say: He is Allah, [who is] One,",
        startTime: 4.2,
        endTime: 8.5,
        words: [
          { ar: "قُلْ", tr: "Say" },
          { ar: "هُوَ", tr: "He is" },
          { ar: "اللَّهُ", tr: "Allah" },
          { ar: "أَحَدٌ", tr: "One" }
        ]
      },
      {
        id: 2,
        verseRef: "112:2",
        arabic: "اللَّهُ الصَّمَدُ",
        transliteration: "Allāhuṣ-Ṣamad",
        translation: "Allah, the Eternal Refuge.",
        startTime: 8.5,
        endTime: 12.5,
        words: [
          { ar: "اللَّهُ", tr: "Allah" },
          { ar: "الصَّمَدُ", tr: "the Eternal Refuge" }
        ]
      },
      {
        id: 3,
        verseRef: "112:3",
        arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        transliteration: "Lam yalid walam yūlad",
        translation: "He neither begets nor is born,",
        startTime: 12.5,
        endTime: 16.8,
        words: [
          { ar: "لَمْ يَلِدْ", tr: "He neither begets" },
          { ar: "وَلَمْ", tr: "nor" },
          { ar: "يُولَدْ", tr: "is He born" }
        ]
      },
      {
        id: 4,
        verseRef: "112:4",
        arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
        transliteration: "Walam yakul-lahū kufuwan aḥad",
        translation: "Nor is there to Him any equivalent.",
        startTime: 16.8,
        endTime: 21.7,
        words: [
          { ar: "وَلَمْ يَكُن", tr: "Nor is there" },
          { ar: "لَّهُ", tr: "to Him" },
          { ar: "كُفُوًا", tr: "equivalent" },
          { ar: "أَحَدٌ", tr: "anyone" }
        ]
      }
    ]
  },
  {
    id: 'surah_fatiha',
    title: 'Surah Al-Fatiha (The Opening)',
    arabicTitle: 'سورة الفاتحة • ١',
    audioUrl: '/audio/surah_fatiha.mp3',
    description: 'The seven oft-repeated verses recited in every prayer',
    segments: [
      {
        id: 0,
        verseRef: "1:1",
        arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        transliteration: "Bismillāhir-Raḥmānir-Raḥīm",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        startTime: 0.0,
        endTime: 5.5,
        words: [{ ar: "بِسْمِ", tr: "In name of" }, { ar: "اللَّهِ", tr: "Allah" }, { ar: "الرَّحْمَٰنِ", tr: "Gracious" }, { ar: "الرَّحِيمِ", tr: "Merciful" }]
      },
      {
        id: 1,
        verseRef: "1:2",
        arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        transliteration: "Al-ḥamdu lillāhi rabbil-‘ālamīn",
        translation: "All praise is due to Allah, Lord of the worlds.",
        startTime: 5.5,
        endTime: 12.0,
        words: [{ ar: "الْحَمْدُ", tr: "All praise" }, { ar: "لِلَّهِ", tr: "is for Allah" }, { ar: "رَبِّ", tr: "Lord of" }, { ar: "الْعَالَمِينَ", tr: "the worlds" }]
      },
      {
        id: 2,
        verseRef: "1:3",
        arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
        transliteration: "Ar-Raḥmānir-Raḥīm",
        translation: "The Entirely Merciful, the Especially Merciful.",
        startTime: 12.0,
        endTime: 17.5,
        words: [{ ar: "الرَّحْمَٰنِ", tr: "The Entirely Merciful" }, { ar: "الرَّحِيمِ", tr: "the Especially Merciful" }]
      },
      {
        id: 3,
        verseRef: "1:4",
        arabic: "مَالِكِ يَوْمِ الدِّينِ",
        transliteration: "Māliki yawmid-dīn",
        translation: "Sovereign of the Day of Recompense.",
        startTime: 17.5,
        endTime: 23.5,
        words: [{ ar: "مَالِكِ", tr: "Master of" }, { ar: "يَوْمِ", tr: "the Day of" }, { ar: "الدِّينِ", tr: "Judgment" }]
      },
      {
        id: 4,
        verseRef: "1:5",
        arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        transliteration: "Iyyāka na‘budu wa-iyyāka nasta‘īn",
        translation: "It is You we worship and You we ask for help.",
        startTime: 23.5,
        endTime: 30.5,
        words: [{ ar: "إِيَّاكَ", tr: "You alone" }, { ar: "نَعْبُدُ", tr: "we worship" }, { ar: "وَإِيَّاكَ", tr: "and You alone" }, { ar: "نَسْتَعِينُ", tr: "we ask for help" }]
      },
      {
        id: 5,
        verseRef: "1:6",
        arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        transliteration: "Ihdinaṣ-ṣirāṭal-mustaqīm",
        translation: "Guide us to the straight path.",
        startTime: 30.5,
        endTime: 38.0,
        words: [{ ar: "اهْدِنَا", tr: "Guide us" }, { ar: "الصِّرَاطَ", tr: "to the path" }, { ar: "الْمُسْتَقِيمَ", tr: "the straight" }]
      },
      {
        id: 6,
        verseRef: "1:7",
        arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
        transliteration: "Ṣirāṭal-ladhīna an‘amta ‘alayhim ghayril-maghḍūbi ‘alayhim walāḍ-ḍāllīn",
        translation: "The path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.",
        startTime: 38.0,
        endTime: 51.9,
        words: [{ ar: "صِرَاطَ الَّذِينَ", tr: "The path of those" }, { ar: "أَنْعَمْتَ عَلَيْهِمْ", tr: "You favored" }, { ar: "غَيْرِ الْمَغْضُوبِ", tr: "not of anger" }, { ar: "وَلَا الضَّالِّينَ", tr: "nor the astray" }]
      }
    ]
  },
  {
    id: 'surah_kawthar',
    title: 'Surah Al-Kawthar (Abundance)',
    arabicTitle: 'سورة الكوثر • ١٠٨',
    audioUrl: '/audio/surah_kawthar.mp3',
    description: 'The shortest and most comforting Surah in the Holy Quran',
    segments: [
      {
        id: 0,
        verseRef: "108:1",
        arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ",
        transliteration: "Innā a‘ṭaynākal-kawthar",
        translation: "Indeed, We have granted you abundance.",
        startTime: 0.0,
        endTime: 7.5,
        words: [{ ar: "إِنَّا", tr: "Indeed, We" }, { ar: "أَعْطَيْنَاكَ", tr: "have granted you" }, { ar: "الْكَوْثَرَ", tr: "the abundance" }]
      },
      {
        id: 1,
        verseRef: "108:2",
        arabic: "فَصَلِّ لِرَبِّكَ وَانْحَرْ",
        transliteration: "Faṣalli lirabbika wanḥar",
        translation: "So pray to your Lord and sacrifice.",
        startTime: 7.5,
        endTime: 15.5,
        words: [{ ar: "فَصَلِّ", tr: "So pray" }, { ar: "لِرَبِّكَ", tr: "to your Lord" }, { ar: "وَانْحَرْ", tr: "and sacrifice" }]
      },
      {
        id: 2,
        verseRef: "108:3",
        arabic: "إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ",
        transliteration: "Inna shāni'aka huwal-abtar",
        translation: "Indeed, your enemy is the one cut off.",
        startTime: 15.5,
        endTime: 24.5,
        words: [{ ar: "إِنَّ شَانِئَكَ", tr: "Indeed your enemy" }, { ar: "هُوَ", tr: "is" }, { ar: "الْأَبْتَرُ", tr: "the one cut off" }]
      }
    ]
  }
];

export function parsePastedAyatText(
  rawText: string,
  customTitle: string = 'Custom Quran Ayat',
  totalEstimatedSeconds: number = 30
): QuranSegment[] {
  // Clean input
  const clean = rawText.trim();
  if (!clean) return [];

  // Split by common verse separators: newlines, ayah symbols ۝, periods, or commas
  let rawParts = clean
    .split(/[\n۝؛.]+|\s{3,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawParts.length === 0) {
    rawParts = [clean];
  }

  // Calculate proportional timestamps based on word counts
  const totalWords = rawParts.reduce((acc, part) => acc + part.split(/\s+/).length, 0);
  let accumulatedTime = 0;

  return rawParts.map((part, idx) => {
    const partWords = part.split(/\s+/).filter((w) => w.length > 0);
    const partRatio = totalWords > 0 ? partWords.length / totalWords : 1 / rawParts.length;
    const partDuration = Math.max(3.0, partRatio * totalEstimatedSeconds);

    const start = accumulatedTime;
    const end = accumulatedTime + partDuration;
    accumulatedTime = end;

    return {
      id: idx,
      verseRef: `${customTitle} • Ayah ${idx + 1}`,
      arabic: part,
      transliteration: 'Recitation in Child Voice',
      translation: 'Spiritual contemplation and remembrance of Allah.',
      startTime: Number(start.toFixed(1)),
      endTime: Number(end.toFixed(1)),
      words: partWords.map((w) => ({ ar: w, tr: '' })),
    };
  });
}

export const SHORTS_META = {
  title: "Child's Heartwarming Recitation of Ayat al-Kursi (آية الكرسي) ✨",
  description: `Surah Al-Baqarah (2:255) - The Throne Verse. Recited with the pure, peaceful voice of a 6-year-old child in traditional Tunisian attire.\n\n"اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ..."\n\nMay this recitation bring serenity, protection, and blessings to your heart. Please like, share, and subscribe for more heartwarming Quranic shorts.\n\n#AyatAlKursi #Quran #QuranShorts #ChildRecitation #Shorts #Islam #PeacefulRecitation #AyatulKursi`,
  hashtags: ["#AyatAlKursi", "#QuranShorts", "#ChildReciter", "#Islam", "#AyatulKursi", "#Shorts", "#QuranRecitation", "#Tunisia"]
};
