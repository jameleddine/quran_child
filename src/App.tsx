import React, { useState, useRef } from 'react';
import {
  Video,
  Sparkles,
  BookOpen,
  Volume2,
  Sliders,
  Share2,
  Heart,
  MessageCircle,
  Copy,
  Check,
  Info,
  Maximize2,
  Download,
  ClipboardPaste,
} from 'lucide-react';
import { BoyAvatarCanvas } from './components/BoyAvatarCanvas';
import { QuranCaptionsOverlay } from './components/QuranCaptionsOverlay';
import { AudioControlsBar } from './components/AudioControlsBar';
import { AudioVoiceSelector } from './components/AudioVoiceSelector';
import { VideoSettingsPanel } from './components/VideoSettingsPanel';
import { AyatNavigator } from './components/AyatNavigator';
import { ShortsVideoExporter } from './components/ShortsVideoExporter';
import { AyatPasteModal } from './components/AyatPasteModal';
import { useQuranAudio } from './hooks/useQuranAudio';
import { SHORTS_META, QuranSegment, PRESET_QURAN_COLLECTIONS, AYAT_AL_KURSI_SEGMENTS } from './data/quranData';

export default function App() {
  const {
    isPlaying,
    currentTime,
    duration,
    audioEnergy,
    currentSegment,
    currentSegmentIndex,
    segments,
    setSegments,
    audioSource,
    playbackRate,
    play,
    pause,
    togglePlay,
    seek,
    setRate,
    loadAudioSource,
    audioElementRef,
    audioContextRef,
    mediaStreamDestinationRef,
  } = useQuranAudio('/audio/ayat_alkursi_child.wav', AYAT_AL_KURSI_SEGMENTS);

  // Quran Collection & Title states
  const [currentAyahTitle, setCurrentAyahTitle] = useState('Ayat al-Kursi (2:255)');
  const [currentCollectionId, setCurrentCollectionId] = useState('ayat_alkursi');
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);

  // Visual customizer states
  const [theme, setTheme] = useState<'mediterranean' | 'golden_noor' | 'madinah' | 'night_stars'>('mediterranean');
  const [showLightRays, setShowLightRays] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [captionPosition, setCaptionPosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [captionStyle, setCaptionStyle] = useState<'gold_glow' | 'minimal_white' | 'calligraphy_card' | 'neon_emerald'>('gold_glow');
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showShortsGuides, setShowShortsGuides] = useState(false);
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [photoMotion, setPhotoMotion] = useState(true);
  const [photoColorGrade, setPhotoColorGrade] = useState<'none' | 'warm_sun' | 'soft_glow'>('none');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  // Studio tabs
  const [activeTab, setActiveTab] = useState<'verses' | 'voice' | 'visuals' | 'metadata'>('verses');
  
  // Exporter modal
  const [isExporterOpen, setIsExporterOpen] = useState(false);
  const [burnCaptions, setBurnCaptions] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);

  // Metadata copy notification
  const [copiedTitle, setCopiedTitle] = useState(false);

  // Custom photo upload handler
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(true);
  };

  const handleDragLeave = () => {
    setIsDraggingPhoto(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetCustomImage = () => {
    setCustomImageSrc(null);
  };

  const handleSeekToSegment = (seg: QuranSegment) => {
    seek(seg.startTime);
    if (!isPlaying) play();
  };

  // Handler for custom pasted Ayat
  const handleApplyCustomAyat = (
    newSegs: QuranSegment[],
    title: string,
    synthesizedAudioUrl?: string
  ) => {
    setSegments(newSegs);
    setCurrentAyahTitle(title);
    setCurrentCollectionId('custom');
    if (synthesizedAudioUrl) {
      loadAudioSource(synthesizedAudioUrl, newSegs[newSegs.length - 1].endTime);
    }
    seek(0);
  };

  // Handler for choosing a preset collection
  const handleSelectCollection = async (collectionId: string) => {
    const found = PRESET_QURAN_COLLECTIONS.find((c) => c.id === collectionId);
    if (!found) return;

    setSegments(found.segments);
    setCurrentAyahTitle(found.title);
    setCurrentCollectionId(collectionId);
    seek(0);

    if (found.audioUrl) {
      loadAudioSource(found.audioUrl, found.segments[found.segments.length - 1].endTime);
    } else {
      // Synthesize child voice for the preset on-the-fly
      try {
        const fullArabic = found.segments.map((s) => s.arabic).join(' ۚ ');
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
        const ttsData = await ttsRes.json();
        if (ttsData.success && ttsData.audioBase64) {
          const byteCharacters = atob(ttsData.audioBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: ttsData.mimeType || 'audio/wav' });
          const audioUrl = URL.createObjectURL(blob);
          loadAudioSource(audioUrl, found.segments[found.segments.length - 1].endTime);
        }
      } catch (err) {
        console.warn('Preset synthesis fallback:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Hidden Audio Element */}
      <audio
        ref={audioElementRef}
        src={audioSource}
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <span className="font-arabic text-xl leading-none">آية</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                Quran Shorts Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                9:16 Shorts
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ayat al-Kursi (2:255) • 6-Year-Old Child Reciter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPasteModalOpen(true)}
            className="py-2 px-3 sm:px-3.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm hover:border-amber-400"
          >
            <ClipboardPaste className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Paste Other Ayat</span>
            <span className="sm:hidden">Paste</span>
          </button>

          <button
            onClick={() => setIsExporterOpen(true)}
            className="py-2 px-3.5 sm:px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 hover:scale-102"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Export Shorts Video</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: 9:16 Shorts Device Frame (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          {/* Shorts Container Frame with aspect 9:16 */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full max-w-[360px] aspect-[9/16] rounded-[36px] p-2 bg-gradient-to-b from-slate-700/60 via-slate-800/80 to-slate-900 border-4 transition-all duration-200 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden ${
              isDraggingPhoto
                ? 'border-amber-400 scale-[1.02] shadow-[0_0_40px_rgba(251,191,36,0.4)]'
                : 'border-slate-700/80'
            }`}
          >
            {/* Screen Inner Bezel */}
            <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black select-none">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2.5 inset-x-0 mx-auto w-24 h-4 bg-black/80 backdrop-blur-md rounded-full z-30 pointer-events-none flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 ml-auto mr-3" />
              </div>

              {/* Drag & Drop Overlay Indicator */}
              {isDraggingPhoto && (
                <div className="absolute inset-0 z-40 bg-amber-950/80 backdrop-blur-sm border-2 border-dashed border-amber-400 rounded-[28px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mb-3 animate-bounce">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-amber-200">Drop Boy Photo Here</h4>
                  <p className="text-xs text-amber-300/80 mt-1">
                    Will display clean & unaltered without avatar facial animations
                  </p>
                </div>
              )}

              {/* Custom Photo Active Notification Pill */}
              {customImageSrc && !isDraggingPhoto && (
                <div className="absolute top-9 inset-x-0 mx-auto w-max max-w-[85%] z-30 flex items-center gap-1.5 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-emerald-500/40 rounded-full text-[10px] text-emerald-200 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real Photo • Natural Facial View</span>
                  <button
                    onClick={handleResetCustomImage}
                    className="ml-1 text-slate-400 hover:text-white underline text-[9px]"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* The Live Boy Avatar Canvas */}
              <BoyAvatarCanvas
                isPlaying={isPlaying}
                audioEnergy={audioEnergy}
                customImageSrc={customImageSrc}
                showParticles={showParticles}
                showLightRays={showLightRays}
                theme={theme}
                burnCaptionsOnCanvas={burnCaptions}
                currentSegment={currentSegment}
                currentTime={currentTime}
                photoMotion={photoMotion}
                photoColorGrade={photoColorGrade}
                onCanvasReady={(canvas) => setActiveCanvas(canvas)}
              />

              {/* Quran Captions Overlay (shown on screen when not burned into canvas) */}
              {!burnCaptions && (
                <QuranCaptionsOverlay
                  currentSegment={currentSegment}
                  currentTime={currentTime}
                  captionPosition={captionPosition}
                  showTransliteration={showTransliteration}
                  showTranslation={showTranslation}
                  captionStyle={captionStyle}
                  showShortsGuides={showShortsGuides}
                />
              )}

              {/* YouTube Shorts / TikTok UI Watermark & Floating Buttons Preview */}
              <div className="absolute top-8 left-4 z-20 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] font-mono text-amber-300 font-semibold border border-amber-500/20">
                  @QuranShorts
                </span>
              </div>

              {/* Right Side Social Action Buttons (Shorts Mockup) */}
              <div className="absolute right-2.5 bottom-28 z-20 flex flex-col items-center gap-3.5 pointer-events-none">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </div>
                  <span className="text-[10px] font-medium text-white drop-shadow mt-0.5">34.2K</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-white drop-shadow mt-0.5">1.2K</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-white drop-shadow mt-0.5">Share</span>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-lg animate-spin-slow">
                  <div className="w-full h-full bg-gradient-to-tr from-amber-400 to-red-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Under-Phone Controls */}
          <div className="w-full max-w-[360px] mt-4">
            <AudioControlsBar
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onRestart={() => seek(0)}
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              audioEnergy={audioEnergy}
              onOpenExporter={() => setIsExporterOpen(true)}
              ayahTitle={currentAyahTitle}
              segments={segments}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Studio Tools & Control Tabs (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl gap-1">
            {[
              { id: 'verses', label: 'Ayat & Verses', icon: BookOpen },
              { id: 'voice', label: 'Child Voice', icon: Volume2 },
              { id: 'visuals', label: 'Visuals & FX', icon: Sliders },
              { id: 'metadata', label: 'Shorts Copy & Tags', icon: Share2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Verses & Timeline */}
          {activeTab === 'verses' && (
            <div className="space-y-4">
              <AyatNavigator
                segments={segments}
                currentTitle={currentAyahTitle}
                currentSegmentIndex={currentSegmentIndex}
                currentTime={currentTime}
                onSeekToSegment={handleSeekToSegment}
                onOpenPasteModal={() => setIsPasteModalOpen(true)}
                onSelectCollection={handleSelectCollection}
                currentCollectionId={currentCollectionId}
              />

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-amber-300">Quran Shorts Tip:</span>{' '}
                  You can copy-paste any verses from the Holy Quran using the{' '}
                  <span className="text-amber-300 font-semibold underline cursor-pointer" onClick={() => setIsPasteModalOpen(true)}>
                    Paste Other Ayat
                  </span>{' '}
                  button. The app will auto-translate, balance the timeline, and synthesize the 6-year-old child recitation voice!
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Child Voice & Recitation */}
          {activeTab === 'voice' && (
            <AudioVoiceSelector
              currentSource={audioSource}
              onSelectSource={loadAudioSource}
              playbackRate={playbackRate}
              onSetRate={setRate}
            />
          )}

          {/* Tab 3: Visuals & Settings */}
          {activeTab === 'visuals' && (
            <VideoSettingsPanel
              theme={theme}
              onThemeChange={setTheme}
              showLightRays={showLightRays}
              onToggleLightRays={() => setShowLightRays(!showLightRays)}
              showParticles={showParticles}
              onToggleParticles={() => setShowParticles(!showParticles)}
              captionPosition={captionPosition}
              onCaptionPositionChange={setCaptionPosition}
              captionStyle={captionStyle}
              onCaptionStyleChange={setCaptionStyle}
              showTransliteration={showTransliteration}
              onToggleTransliteration={() => setShowTransliteration(!showTransliteration)}
              showTranslation={showTranslation}
              onToggleTranslation={() => setShowTranslation(!showTranslation)}
              showShortsGuides={showShortsGuides}
              onToggleShortsGuides={() => setShowShortsGuides(!showShortsGuides)}
              customImageSrc={customImageSrc}
              onCustomImageUpload={handleCustomImageUpload}
              onResetCustomImage={handleResetCustomImage}
              photoMotion={photoMotion}
              onTogglePhotoMotion={() => setPhotoMotion(!photoMotion)}
              photoColorGrade={photoColorGrade}
              onColorGradeChange={setPhotoColorGrade}
            />
          )}

          {/* Tab 4: Metadata & Viral Publishing Package */}
          {activeTab === 'metadata' && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">YouTube Shorts & TikTok Copy</h3>
                    <p className="text-xs text-slate-400">Ready-to-paste video title, description & hashtags</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const fullText = `${SHORTS_META.title}\n\n${SHORTS_META.description}`;
                    navigator.clipboard.writeText(fullText);
                    setCopiedTitle(true);
                    setTimeout(() => setCopiedTitle(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedTitle ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedTitle ? 'Copied Everything!' : 'Copy All'}</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Video Title (Optimized for Shorts & Reels)
                </label>
                <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs font-medium text-amber-200">
                  {SHORTS_META.title}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Hashtags (for Viral Algorithm Reach)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SHORTS_META.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Video Description
                </label>
                <div className="p-3 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs text-slate-300 whitespace-pre-line font-mono max-h-40 overflow-y-auto">
                  {SHORTS_META.description}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsExporterOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Launch 9:16 Video Exporter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Video Exporter Modal */}
      <ShortsVideoExporter
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
        canvas={activeCanvas}
        audioElement={audioElementRef.current}
        audioContext={audioContextRef.current}
        mediaStreamDestination={mediaStreamDestinationRef.current}
        duration={duration}
        seek={seek}
        play={play}
        pause={pause}
        setBurnCaptions={setBurnCaptions}
      />

      {/* Custom Ayat Paste & Add Modal */}
      <AyatPasteModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onApplyCustomAyat={handleApplyCustomAyat}
      />
    </div>
  );
}
