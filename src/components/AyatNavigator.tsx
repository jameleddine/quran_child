import React from 'react';
import { QuranSegment, PRESET_QURAN_COLLECTIONS } from '../data/quranData';
import { BookOpen, CheckCircle2, ClipboardPaste, Sparkles, ChevronDown } from 'lucide-react';

interface AyatNavigatorProps {
  segments: QuranSegment[];
  currentTitle: string;
  currentSegmentIndex: number;
  currentTime: number;
  onSeekToSegment: (segment: QuranSegment) => void;
  onOpenPasteModal: () => void;
  onSelectCollection: (collectionId: string) => void;
  currentCollectionId: string;
}

export const AyatNavigator: React.FC<AyatNavigatorProps> = ({
  segments,
  currentTitle,
  currentSegmentIndex,
  currentTime,
  onSeekToSegment,
  onOpenPasteModal,
  onSelectCollection,
  currentCollectionId,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      {/* Top Header with Title and Custom Ayat Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-slate-100">{currentTitle}</h3>
              <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                {Math.max(1, currentSegmentIndex + 1)} / {segments.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">Tap any verse to seek timeline & audio</p>
          </div>
        </div>

        {/* Action Button: Paste Other Ayat */}
        <button
          onClick={onOpenPasteModal}
          className="py-1.5 px-3 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm group"
        >
          <ClipboardPaste className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>Paste Other Ayat (+)</span>
        </button>
      </div>

      {/* Preset Quick Select Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        <span className="text-[11px] text-slate-400 shrink-0 mr-1">Presets:</span>
        {PRESET_QURAN_COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectCollection(c.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 border transition-all ${
              currentCollectionId === c.id
                ? 'bg-amber-500/25 border-amber-500/60 text-amber-200 font-semibold shadow-sm'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            {c.arabicTitle}
          </button>
        ))}
      </div>

      {/* Verses List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {segments.map((seg, idx) => {
          const isActive = idx === currentSegmentIndex;
          const isPassed = currentTime > seg.endTime;

          return (
            <div
              key={seg.id}
              onClick={() => onSeekToSegment(seg)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.01]'
                  : isPassed
                  ? 'bg-slate-800/30 border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600'
              }`}
            >
              {/* Play / Progress Indicator */}
              <div className="flex items-center gap-2.5 min-w-[64px]">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/30'
                      : isPassed
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : idx + 1}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {Math.floor(seg.startTime)}s
                </span>
              </div>

              {/* Quran Text & Meaning */}
              <div className="flex-1 text-right">
                <div
                  dir="rtl"
                  className={`font-arabic text-base sm:text-lg font-bold transition-colors ${
                    isActive ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-200'
                  }`}
                >
                  {seg.arabic}
                </div>
                {seg.transliteration && (
                  <div className="text-[11px] text-slate-400 text-left line-clamp-1 mt-0.5">
                    {seg.transliteration}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
