import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ClipboardPaste,
  Wand2,
  Check,
  X,
  Loader2,
  ArrowRight,
  Music,
} from 'lucide-react';
import {
  QuranSegment,
  PRESET_QURAN_COLLECTIONS,
  parsePastedAyatText,
} from '../data/quranData';

interface AyatPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomAyat: (
    segments: QuranSegment[],
    title: string,
    synthesizedAudioUrl?: string
  ) => void;
}

export const AyatPasteModal: React.FC<AyatPasteModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomAyat,
}) => {
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSynthesizingTTS, setIsSynthesizingTTS] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<QuranSegment[] | null>(null);

  if (!isOpen) return null;

  // Handle local smart parse on text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPastedText(val);
    if (val.trim().length > 0) {
      const parsed = parsePastedAyatText(val, customTitle || 'Custom Ayat');
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  // AI Translate & Transliterate
  const handleAITranslate = async () => {
    if (!pastedText.trim()) return;
    setIsProcessingAI(true);
    setStatusMessage('Analyzing Arabic text & generating translations...');

    try {
      let json: any = null;
      try {
        const res = await fetch('/api/quran/parse-ayah', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: pastedText,
            customTitle: customTitle || 'Custom Quranic Ayah',
          }),
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            json = await res.json();
          }
        }
      } catch (networkErr) {
        console.warn('API endpoint unreachable, using client parser:', networkErr);
      }

      if (json && json.success && json.data?.segments && json.data.segments.length > 0) {
        // Calculate balanced timeline for the segments
        const rawSegs = json.data.segments;
        const totalDuration = Math.max(15, rawSegs.length * 6.5);
        const calibrated: QuranSegment[] = rawSegs.map((s: any, idx: number) => {
          const segDuration = totalDuration / rawSegs.length;
          return {
            id: idx,
            verseRef: s.verseRef || `${json.data.surahTitle || customTitle} • Ayah ${idx + 1}`,
            arabic: s.arabic,
            transliteration: s.transliteration || '',
            translation: s.translation || '',
            startTime: Number((idx * segDuration).toFixed(1)),
            endTime: Number(((idx + 1) * segDuration).toFixed(1)),
            words: s.words || s.arabic.split(' ').map((w: string) => ({ ar: w, tr: '' })),
          };
        });

        setParsedPreview(calibrated);
        if (json.data.surahTitle && !customTitle) {
          setCustomTitle(json.data.surahTitle);
        }
        setStatusMessage('✓ Successfully translated and divided into balanced recitation verses!');
      } else {
        // Fallback to local parsing
        const fallback = parsePastedAyatText(pastedText, customTitle || 'Custom Ayat');
        setParsedPreview(fallback);
        setStatusMessage('Parsed into verses using local timing engine.');
      }
    } catch (err: any) {
      console.warn('AI parse notice:', err);
      const fallback = parsePastedAyatText(pastedText, customTitle || 'Custom Ayat');
      setParsedPreview(fallback);
      setStatusMessage('Parsed into verses using local timing engine.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Apply with optional Gemini TTS child voice synthesis
  const handleApply = async (withChildTTS: boolean = true) => {
    const finalSegments = parsedPreview || parsePastedAyatText(pastedText, customTitle || 'Custom Ayat');
    if (!finalSegments || finalSegments.length === 0) {
      alert('Please paste at least one Arabic verse or select a preset.');
      return;
    }

    const titleToUse = customTitle || 'Custom Quran Recitation';

    if (withChildTTS) {
      setIsSynthesizingTTS(true);
      setStatusMessage('Synthesizing 6-year-old child voice recitation for your pasted Ayat...');
      try {
        let ttsData: any = null;
        try {
          const fullArabic = finalSegments.map((s) => s.arabic).join(' ۚ ');
          const ttsRes = await fetch('/api/tts/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: fullArabic,
              voiceName: 'Puck',
              childAge: 6,
              style: 'A sweet 6-year-old child reciting the Holy Quran with high-pitched youthful voice and clear peaceful tajweed',
            }),
          });

          if (ttsRes.ok) {
            const contentType = ttsRes.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              ttsData = await ttsRes.json();
            }
          }
        } catch (fetchErr) {
          console.warn('TTS request notice:', fetchErr);
        }

        if (ttsData && ttsData.success && ttsData.audioBase64) {
          const byteCharacters = atob(ttsData.audioBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: ttsData.mimeType || 'audio/wav' });
          const audioUrl = URL.createObjectURL(blob);

          onApplyCustomAyat(finalSegments, titleToUse, audioUrl);
          onClose();
          return;
        }
      } catch (err) {
        console.warn('TTS fallback notice on pasted text:', err);
      } finally {
        setIsSynthesizingTTS(false);
      }
    }

    // Apply with existing audio
    onApplyCustomAyat(finalSegments, titleToUse);
    onClose();
  };

  // Quick preset loader
  const handleLoadPreset = (collection: any) => {
    setPastedText(collection.segments.map((s: any) => s.arabic).join('\n'));
    setCustomTitle(collection.title);
    setParsedPreview(collection.segments);
    setStatusMessage(`Loaded preset: ${collection.title}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <ClipboardPaste className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Add / Paste Custom Quran Ayat</h2>
            <p className="text-xs text-slate-400">
              Paste any Arabic Quran verses to recite, animate captions & generate a 6yo child voice
            </p>
          </div>
        </div>

        {/* Quick Presets Carousel */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Quick 1-Click Popular Short Presets:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_QURAN_COLLECTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleLoadPreset(c)}
                className="p-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200 truncate">
                  {c.arabicTitle}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area for Pasting Ayat */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
              <span>Paste Quran Verses (Arabic Text with or without Tashkeel):</span>
              <span className="text-[11px] text-amber-400 font-normal">Supports full Tashkeel</span>
            </label>
            <textarea
              dir="rtl"
              rows={4}
              value={pastedText}
              onChange={handleTextChange}
              placeholder="الصق الآيات القرآنية هنا... مثال: قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
              className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl p-3.5 text-lg font-arabic font-bold text-amber-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 shadow-inner"
            />
          </div>

          {/* Surah Name / Title Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Surah / Video Title:</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Surah Al-Ikhlas (112:1-4)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAITranslate}
                disabled={isProcessingAI || !pastedText.trim()}
                className="w-full py-2 px-3 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {isProcessingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-Translating with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI Auto-Translate & Transliterate</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className="p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-amber-300">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Parsed Verses Preview */}
        {parsedPreview && parsedPreview.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Parsed Verses Preview ({parsedPreview.length} Segments):</span>
              <span className="text-[10px] text-slate-400 font-mono">
                Total Est: ~{Math.round(parsedPreview[parsedPreview.length - 1].endTime)}s
              </span>
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
              {parsedPreview.map((seg, i) => (
                <div
                  key={i}
                  className="p-2 bg-slate-800/40 rounded-lg border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-amber-300 text-[10px] flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 text-right font-arabic text-amber-200 font-bold truncate">
                    {seg.arabic}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {seg.startTime}s - {seg.endTime}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleApply(true)}
            disabled={isSynthesizingTTS || !pastedText.trim()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSynthesizingTTS ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing 6yo Child Voice... (~10s)</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                <span>Apply & Synthesize 6yo Child Voice</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleApply(false)}
            disabled={!pastedText.trim()}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all disabled:opacity-40"
          >
            Apply Text Only
          </button>
        </div>
      </div>
    </div>
  );
};
