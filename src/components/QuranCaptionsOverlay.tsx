import React from 'react';
import { QuranSegment } from '../data/quranData';

interface QuranCaptionsOverlayProps {
  currentSegment: QuranSegment | null;
  currentTime: number;
  captionPosition: 'top' | 'middle' | 'bottom';
  showTransliteration: boolean;
  showTranslation: boolean;
  captionStyle: 'gold_glow' | 'minimal_white' | 'calligraphy_card' | 'neon_emerald';
  showShortsGuides: boolean;
}

export const QuranCaptionsOverlay: React.FC<QuranCaptionsOverlayProps> = ({
  currentSegment,
  currentTime,
  captionPosition = 'bottom',
  showTransliteration = true,
  showTranslation = true,
  captionStyle = 'gold_glow',
  showShortsGuides = false,
}) => {
  if (!currentSegment) return null;

  // Calculate word active highlight within current segment
  const segmentDuration = currentSegment.endTime - currentSegment.startTime;
  const elapsedInSegment = Math.max(0, currentTime - currentSegment.startTime);
  const progressRatio = segmentDuration > 0 ? elapsedInSegment / segmentDuration : 0;

  const totalWords = currentSegment.words.length;
  const activeWordIndex = Math.min(
    totalWords - 1,
    Math.max(0, Math.floor(progressRatio * totalWords))
  );

  // Position styles
  const positionClasses = {
    top: 'top-16 justify-start',
    middle: 'top-1/2 -translate-y-1/2 justify-center',
    bottom: 'bottom-24 justify-end',
  }[captionPosition];

  // Theme styling
  const styleConfig = {
    gold_glow: {
      card: 'bg-black/40 backdrop-blur-md border border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.25)]',
      arabicActive: 'text-amber-300 drop-shadow-[0_0_16px_rgba(245,158,11,0.9)] scale-105',
      arabicNormal: 'text-amber-100/90',
      badge: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 text-amber-300 border-amber-500/40',
      subText: 'text-amber-100/80',
    },
    minimal_white: {
      card: 'bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl',
      arabicActive: 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] scale-105',
      arabicNormal: 'text-white/80',
      badge: 'bg-white/10 text-white border-white/20',
      subText: 'text-white/80',
    },
    calligraphy_card: {
      card: 'bg-gradient-to-b from-slate-900/90 to-black/95 backdrop-blur-lg border border-amber-400/40 shadow-[0_10px_40px_rgba(0,0,0,0.8)]',
      arabicActive: 'text-yellow-300 drop-shadow-[0_0_20px_rgba(253,224,71,0.95)] scale-105',
      arabicNormal: 'text-stone-200',
      badge: 'bg-amber-400/20 text-amber-200 border-amber-400/50',
      subText: 'text-stone-300',
    },
    neon_emerald: {
      card: 'bg-emerald-950/60 backdrop-blur-md border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.3)]',
      arabicActive: 'text-emerald-300 drop-shadow-[0_0_16px_rgba(52,211,153,0.9)] scale-105',
      arabicNormal: 'text-emerald-100/90',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      subText: 'text-emerald-100/80',
    },
  }[captionStyle];

  return (
    <div
      className={`absolute inset-x-0 ${positionClasses} px-4 z-20 pointer-events-none flex flex-col items-center transition-all duration-300`}
    >
      {/* Surah & Ayah Badge */}
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase border mb-2 shadow-sm ${styleConfig.badge}`}
      >
        {currentSegment.verseRef || 'القرآن الكريم'}
      </div>

      {/* Main Subtitle Box */}
      <div
        className={`max-w-[92%] w-full rounded-2xl p-4 text-center transition-all duration-200 ${styleConfig.card}`}
      >
        {/* Arabic Quran Text with Word-by-Word Highlighting */}
        <div
          dir="rtl"
          className="font-arabic text-2xl sm:text-3xl md:text-3xl leading-relaxed tracking-wide font-bold flex flex-wrap justify-center items-center gap-x-2 gap-y-1 my-1"
        >
          {currentSegment.words.map((word, idx) => {
            const isWordActive = idx === activeWordIndex;
            return (
              <span
                key={idx}
                className={`transition-all duration-200 inline-block transform ${
                  isWordActive ? styleConfig.arabicActive : styleConfig.arabicNormal
                }`}
              >
                {word.ar}
              </span>
            );
          })}
        </div>

        {/* Phonetic Transliteration */}
        {showTransliteration && (
          <div className="mt-2 text-xs sm:text-sm font-medium tracking-wide italic text-amber-200/90 line-clamp-2">
            {currentSegment.transliteration}
          </div>
        )}

        {/* English Translation */}
        {showTranslation && (
          <div className={`mt-1.5 text-xs sm:text-xs tracking-normal leading-snug ${styleConfig.subText} line-clamp-2`}>
            &ldquo;{currentSegment.translation}&rdquo;
          </div>
        )}
      </div>

      {/* YouTube Shorts / TikTok UI Safety Zones Overlay */}
      {showShortsGuides && (
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-red-500/40 rounded-2xl">
          {/* Right side interaction buttons guide */}
          <div className="absolute right-2 bottom-20 w-12 h-64 border border-blue-400/50 bg-blue-500/10 rounded flex flex-col items-center justify-around text-[10px] text-blue-200 font-mono">
            <span>Like</span>
            <span>Comment</span>
            <span>Share</span>
            <span>Remix</span>
          </div>
          {/* Bottom title & sound guide */}
          <div className="absolute bottom-2 left-2 right-16 h-16 border border-emerald-400/50 bg-emerald-500/10 rounded flex items-center px-2 text-[10px] text-emerald-200 font-mono">
            YouTube Shorts Title & Channel Area
          </div>
        </div>
      )}
    </div>
  );
};
