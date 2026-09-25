import React, { useState } from 'react';
import { Volume2, Sparkles, Wand2, Upload, Loader2, Play, Check } from 'lucide-react';

interface AudioVoiceSelectorProps {
  currentSource: string;
  onSelectSource: (sourceUrl: string) => void;
  playbackRate: number;
  onSetRate: (rate: number) => void;
}

export const AudioVoiceSelector: React.FC<AudioVoiceSelectorProps> = ({
  currentSource,
  onSelectSource,
  playbackRate,
  onSetRate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<'Puck' | 'Kore' | 'Zephyr'>('Puck');
  const [childAge, setChildAge] = useState<number>(6);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const handleGenerateTTS = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedSuccess(false);

    try {
      const quranText = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ. اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ";
      
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quranText,
          voiceName: selectedVoice,
          childAge: childAge,
          style: `A sweet, innocent ${childAge}-year-old child reciting the Holy Quran with high-pitched youthful voice and clear peaceful tajweed`,
        }),
      });

      let data: any = null;
      if (response.ok) {
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          data = await response.json();
        }
      }

      if (!response.ok || !data || !data.success) {
        throw new Error(data?.error || 'Gemini TTS synthesis is currently unavailable. Using default sweet child recitation.');
      }

      // Convert base64 audio to object URL
      const byteCharacters = atob(data.audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteNumbers.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
      const objectUrl = URL.createObjectURL(blob);

      onSelectSource(objectUrl);
      setGeneratedSuccess(true);
    } catch (err: any) {
      console.error(err);
      setGenerateError(err.message || 'Generation failed. Using default child audio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onSelectSource(url);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100">Child Voice & Recitation Audio</h3>
            <p className="text-xs text-slate-400">Innocent 6-year-old voice calibrated for Ayat al-Kursi</p>
          </div>
        </div>
      </div>

      {/* Audio Preset Selection */}
      <div className="space-y-3">
        {/* Preset 1: Default 6-Year-Old Child Recitation */}
        <div
          onClick={() => onSelectSource('/audio/ayat_alkursi_child.wav')}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
            currentSource === '/audio/ayat_alkursi_child.wav'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xs">
              6y
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-slate-100">Sweet 6-Year-Old Voice (Default)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-semibold">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-400">54s Complete Ayat al-Kursi • Pure Tajweed • High Clarity</p>
            </div>
          </div>
          {currentSource === '/audio/ayat_alkursi_child.wav' && (
            <Check className="w-5 h-5 text-amber-400" />
          )}
        </div>

        {/* Preset 2: Quran CDN Child Recitation */}
        <div
          onClick={() => onSelectSource('https://everyayah.com/data/Alafasy_128kbps/002255.mp3')}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
            currentSource.includes('everyayah.com')
              ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
              : 'bg-slate-800/50 border-slate-700/60 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
              HQ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-slate-100">Sanctuary Studio Recitation</span>
              </div>
              <p className="text-xs text-slate-400">Studio Master • Deep Spiritual Reverberation</p>
            </div>
          </div>
          {currentSource.includes('everyayah.com') && (
            <Check className="w-5 h-5 text-amber-400" />
          )}
        </div>
      </div>

      {/* AI Voice Generator Panel */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Wand2 className="w-4 h-4 text-purple-400" />
            <span>Customize / Synthesize Child Voice (Gemini TTS)</span>
          </div>
          <span className="text-[10px] text-purple-300/80 font-mono bg-purple-500/10 px-2 py-0.5 rounded">
            gemini-3.8-flash-tts
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Prebuilt Persona Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Puck">Puck (High & Youthful)</option>
              <option value="Kore">Kore (Soft & Melodic)</option>
              <option value="Zephyr">Zephyr (Gentle & Peaceful)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Child Age: {childAge} Years</label>
            <input
              type="range"
              min="5"
              max="9"
              value={childAge}
              onChange={(e) => setChildAge(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateTTS}
          disabled={isGenerating}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing Child Quran Recitation... (~10s)</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Fresh {childAge}yo Child Recitation</span>
            </>
          )}
        </button>

        {generateError && (
          <p className="mt-2 text-[11px] text-red-400 bg-red-950/40 p-2 rounded border border-red-800/50">
            {generateError}
          </p>
        )}
        {generatedSuccess && (
          <p className="mt-2 text-[11px] text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-800/50">
            ✓ New child recitation synthesized successfully and set as active audio!
          </p>
        )}
      </div>

      {/* Recitation Speed & Custom Audio Upload */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-[11px] text-slate-400 block mb-1">
            Recitation Cadence: {playbackRate}x
          </label>
          <div className="flex gap-1.5">
            {[0.85, 0.95, 1.0, 1.1].map((r) => (
              <button
                key={r}
                onClick={() => onSetRate(r)}
                className={`flex-1 py-1 text-xs rounded border transition-all ${
                  playbackRate === r
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {r}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Upload Audio</label>
          <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 cursor-pointer flex items-center gap-1.5 transition-all">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Custom File</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleCustomAudioUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
