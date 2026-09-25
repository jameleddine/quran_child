import React from 'react';
import {
  Palette,
  Sun,
  Sparkles,
  Image as ImageIcon,
  Type,
  Layout,
  Eye,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface VideoSettingsPanelProps {
  theme: 'mediterranean' | 'golden_noor' | 'madinah' | 'night_stars';
  onThemeChange: (theme: 'mediterranean' | 'golden_noor' | 'madinah' | 'night_stars') => void;
  showLightRays: boolean;
  onToggleLightRays: () => void;
  showParticles: boolean;
  onToggleParticles: () => void;
  captionPosition: 'top' | 'middle' | 'bottom';
  onCaptionPositionChange: (pos: 'top' | 'middle' | 'bottom') => void;
  captionStyle: 'gold_glow' | 'minimal_white' | 'calligraphy_card' | 'neon_emerald';
  onCaptionStyleChange: (style: 'gold_glow' | 'minimal_white' | 'calligraphy_card' | 'neon_emerald') => void;
  showTransliteration: boolean;
  onToggleTransliteration: () => void;
  showTranslation: boolean;
  onToggleTranslation: () => void;
  showShortsGuides: boolean;
  onToggleShortsGuides: () => void;
  customImageSrc: string | null;
  onCustomImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetCustomImage: () => void;
  photoMotion?: boolean;
  onTogglePhotoMotion?: () => void;
  photoColorGrade?: 'none' | 'warm_sun' | 'soft_glow';
  onColorGradeChange?: (grade: 'none' | 'warm_sun' | 'soft_glow') => void;
}

export const VideoSettingsPanel: React.FC<VideoSettingsPanelProps> = ({
  theme,
  onThemeChange,
  showLightRays,
  onToggleLightRays,
  showParticles,
  onToggleParticles,
  captionPosition,
  onCaptionPositionChange,
  captionStyle,
  onCaptionStyleChange,
  showTransliteration,
  onToggleTransliteration,
  showTranslation,
  onToggleTranslation,
  showShortsGuides,
  onToggleShortsGuides,
  customImageSrc,
  onCustomImageUpload,
  onResetCustomImage,
  photoMotion = true,
  onTogglePhotoMotion,
  photoColorGrade = 'none',
  onColorGradeChange,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100">Visuals & Short Video Settings</h3>
            <p className="text-xs text-slate-400">Customize boy portrait, visual effects & typography</p>
          </div>
        </div>
      </div>

      {/* 1. Boy Photo / Avatar Upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            Boy Photo / Visual Source
          </label>
          {customImageSrc && (
            <button
              onClick={onResetCustomImage}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Animated Tunisian Boy
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <label className={`flex-1 border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
            customImageSrc
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-slate-700 hover:border-amber-500/60 bg-slate-800/40 hover:bg-slate-800/70'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={onCustomImageUpload}
              className="hidden"
            />
            <div className="text-xs font-semibold text-slate-200">
              {customImageSrc ? '✓ Custom Photo Loaded (Clean & Unaltered)' : 'Upload / Drop Boy Photo (image.png)'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {customImageSrc
                ? 'Facial avatar animations removed — your photo stays 100% natural, crisp & authentic'
                : 'Click or drag & drop image to set as video background'}
            </div>
          </label>
        </div>

        {/* Photo Controls when custom image is uploaded */}
        {customImageSrc && (
          <div className="mt-3 p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Camera Motion:</span>
              <button
                onClick={onTogglePhotoMotion}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  photoMotion
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-700 text-slate-400 border-slate-600'
                }`}
              >
                {photoMotion ? 'Subtle Slow Zoom (Shorts Style)' : 'Completely Static Photo'}
              </button>
            </div>

            {onColorGradeChange && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-300 font-medium">Lighting Grade:</span>
                <div className="flex gap-1.5">
                  {[
                    { id: 'none', label: 'Original' },
                    { id: 'warm_sun', label: 'Warm Sun' },
                    { id: 'soft_glow', label: 'Soft Glow' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => onColorGradeChange(g.id as any)}
                      className={`px-2 py-0.5 rounded text-[11px] border transition-all ${
                        photoColorGrade === g.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Visual Theme */}
      <div>
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
          <Palette className="w-4 h-4 text-sky-400" />
          Environment & Ambience Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'mediterranean', label: 'Tunisian Courtyard', desc: 'Azure door & bougainvillea' },
            { id: 'golden_noor', label: 'Golden Noor Glow', desc: 'Warm divine gold sanctuary' },
            { id: 'night_stars', label: 'Celestial Night', desc: 'Peaceful deep twilight' },
            { id: 'madinah', label: 'Madinah Twilight', desc: 'Soft spiritual pastels' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id as any)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                theme === t.id
                  ? 'bg-sky-500/15 border-sky-500/60 text-sky-200'
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs font-semibold">{t.label}</div>
              <div className="text-[10px] text-slate-400">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Visual FX Toggles */}
      <div>
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Spiritual Visual Effects
        </label>
        <div className="flex gap-2">
          <button
            onClick={onToggleLightRays}
            className={`flex-1 p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              showLightRays
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Divine Light Rays</span>
          </button>
          <button
            onClick={onToggleParticles}
            className={`flex-1 p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              showParticles
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Floating Noor Particles</span>
          </button>
        </div>
      </div>

      {/* 4. Subtitle Typography & Position */}
      <div>
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
          <Type className="w-4 h-4 text-emerald-400" />
          Quran Subtitles & Captions
        </label>
        
        {/* Style Selector */}
        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
          {[
            { id: 'gold_glow', label: 'Golden Glow (Shorts Standard)' },
            { id: 'calligraphy_card', label: 'Calligraphy Card' },
            { id: 'minimal_white', label: 'Minimalist Frost' },
            { id: 'neon_emerald', label: 'Emerald Sanctuary' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => onCaptionStyleChange(s.id as any)}
              className={`p-2 rounded-lg border text-left text-xs transition-all ${
                captionStyle === s.id
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Position Selector */}
        <div className="flex gap-2 mb-2.5">
          {[
            { id: 'top', label: 'Top' },
            { id: 'middle', label: 'Middle' },
            { id: 'bottom', label: 'Lower Third (Recommended)' },
          ].map((pos) => (
            <button
              key={pos.id}
              onClick={() => onCaptionPositionChange(pos.id as any)}
              className={`flex-1 py-1.5 rounded-lg border text-xs transition-all ${
                captionPosition === pos.id
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {/* Toggle Language Lines */}
        <div className="flex gap-2">
          <button
            onClick={onToggleTransliteration}
            className={`flex-1 py-1.5 px-2 rounded-lg border text-xs transition-all ${
              showTransliteration
                ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            {showTransliteration ? '✓ Transliteration' : '+ Transliteration'}
          </button>
          <button
            onClick={onToggleTranslation}
            className={`flex-1 py-1.5 px-2 rounded-lg border text-xs transition-all ${
              showTranslation
                ? 'bg-slate-800 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/60 text-slate-500 border-slate-800'
            }`}
          >
            {showTranslation ? '✓ English Translation' : '+ English Translation'}
          </button>
        </div>
      </div>

      {/* 5. Safe Zones Guide Overlay */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-300">YouTube Shorts & TikTok Safety Guides</span>
        </div>
        <button
          onClick={onToggleShortsGuides}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
            showShortsGuides
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showShortsGuides ? 'Guides Active' : 'Show UI Guides'}</span>
        </button>
      </div>
    </div>
  );
};
