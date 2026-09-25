import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Video,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { AYAT_AL_KURSI_SEGMENTS, QuranSegment } from '../data/quranData';

interface AudioControlsBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  audioEnergy: number;
  onOpenExporter: () => void;
  ayahTitle?: string;
  segments?: QuranSegment[];
}

export const AudioControlsBar: React.FC<AudioControlsBarProps> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  currentTime,
  duration,
  onSeek,
  audioEnergy,
  onOpenExporter,
  ayahTitle = 'Ayat al-Kursi (2:255)',
  segments = AYAT_AL_KURSI_SEGMENTS,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-2xl text-slate-100 space-y-3">
      {/* Waveform & Timeline Slider */}
      <div className="relative">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>{formatTime(currentTime)}</span>
          <span className="text-amber-400/90 font-medium truncate max-w-[160px]">{ayahTitle}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Custom Scrubber with Verse Segment Dividers */}
        <div className="relative h-4 flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 54}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none z-10"
          />

          {/* Verse Markers */}
          <div className="absolute inset-x-0 h-2 pointer-events-none flex items-center justify-between px-0.5">
            {segments.map((seg) => {
              const leftPercent = (seg.startTime / (duration || 54)) * 100;
              return (
                <div
                  key={seg.id}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute w-0.5 h-3 bg-amber-500/40 rounded-full"
                  title={seg.transliteration}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Controls Buttons */}
      <div className="flex items-center justify-between gap-3">
        {/* Restart Button */}
        <button
          onClick={onRestart}
          title="Restart Recitation"
          className="p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Central Play/Pause Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-xl ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30 scale-105'
                : 'bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25 hover:scale-105'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
            )}
          </button>
        </div>

        {/* Live Audio Energy Visualizer Bars */}
        <div className="flex items-end gap-1 h-6 px-2">
          {Array.from({ length: 6 }).map((_, i) => {
            const h = isPlaying ? Math.max(4, audioEnergy * (24 - i * 2) * (1 + Math.sin(i * 1.5))) : 4;
            return (
              <div
                key={i}
                style={{ height: `${Math.min(24, Math.max(3, h))}px` }}
                className="w-1 bg-gradient-to-t from-amber-500 to-yellow-300 rounded-full transition-all duration-75"
              />
            );
          })}
        </div>

        {/* Export for Shorts Button */}
        <button
          onClick={onOpenExporter}
          className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 hover:scale-102"
        >
          <Video className="w-4 h-4" />
          <span>Export Shorts Video</span>
        </button>
      </div>
    </div>
  );
};
