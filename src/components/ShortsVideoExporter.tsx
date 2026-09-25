import React, { useState, useRef } from 'react';
import {
  Download,
  Video,
  Check,
  Copy,
  Clock,
  Sparkles,
  Loader2,
  X,
  Play,
  Film,
} from 'lucide-react';
import { SHORTS_META, QuranSegment } from '../data/quranData';

interface ShortsVideoExporterProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
  audioElement: HTMLAudioElement | null;
  audioContext: AudioContext | null;
  mediaStreamDestination: MediaStreamAudioDestinationNode | null;
  duration: number;
  seek: (seconds: number) => void;
  play: () => Promise<void>;
  pause: () => void;
  setBurnCaptions: (burn: boolean) => void;
}

export const ShortsVideoExporter: React.FC<ShortsVideoExporterProps> = ({
  isOpen,
  onClose,
  canvas,
  audioElement,
  audioContext,
  mediaStreamDestination,
  duration,
  seek,
  play,
  pause,
  setBurnCaptions,
}) => {
  const [exportMode, setExportMode] = useState<'full' | 'snippet15' | 'snippet30'>('full');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [copiedMeta, setCopiedMeta] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);

  if (!isOpen) return null;

  const targetDuration = exportMode === 'full' ? duration : exportMode === 'snippet30' ? 30 : 15;

  const handleStartExport = async () => {
    if (!canvas || !audioElement) {
      alert('Video canvas or audio is not ready yet.');
      return;
    }

    try {
      setIsRecording(true);
      setProgress(0);
      setRecordedVideoUrl(null);
      setRecordingStatus('Initializing 9:16 Video Stream & Audio...');
      setBurnCaptions(true); // Burn captions directly into video stream

      // Seek to start
      seek(0);
      pause();

      // Ensure AudioContext is running
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Allow 150ms for t=0 initial frame and burnt captions to settle cleanly on canvas
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Get canvas stream (30 FPS)
      const canvasStream = canvas.captureStream(30);

      // Get audio tracks
      let combinedStream: MediaStream;
      if (mediaStreamDestination && mediaStreamDestination.stream.getAudioTracks().length > 0) {
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...mediaStreamDestination.stream.getAudioTracks(),
        ]);
      } else {
        // Fallback: capture audio element stream
        const audioStream = (audioElement as any).captureStream
          ? (audioElement as any).captureStream()
          : (audioElement as any).mozCaptureStream
          ? (audioElement as any).mozCaptureStream()
          : null;

        if (audioStream && audioStream.getAudioTracks().length > 0) {
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
        } else {
          combinedStream = canvasStream;
        }
      }

      // Select supported mimeType
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ];
      let selectedMime = 'video/webm';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: selectedMime,
        videoBitsPerSecond: 6_000_000, // 6 Mbps for crisp 9:16 Shorts
      });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        setRecordingStatus('Finalizing video file...');
        const blob = new Blob(chunksRef.current, { type: selectedMime });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setIsRecording(false);
        setBurnCaptions(false);
        pause();
      };

      recorder.start(250); // Record chunks every 250ms
      await play();
      setRecordingStatus('Recording in real-time...');

      const startRecTime = performance.now();
      intervalRef.current = window.setInterval(() => {
        const elapsed = (performance.now() - startRecTime) / 1000;
        const currentProgress = Math.min(100, Math.floor((elapsed / targetDuration) * 100));
        setProgress(currentProgress);

        if (elapsed >= targetDuration) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 200);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsRecording(false);
      setBurnCaptions(false);
      alert('Failed to export video: ' + err.message);
    }
  };

  const handleCancelExport = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setBurnCaptions(false);
    pause();
  };

  const handleCopyMeta = () => {
    const textToCopy = `${SHORTS_META.title}\n\n${SHORTS_META.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedMeta(true);
    setTimeout(() => setCopiedMeta(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            if (isRecording) handleCancelExport();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-2xl text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Export 9:16 Shorts Video</h2>
            <p className="text-xs text-slate-400">
              Ready for YouTube Shorts, Instagram Reels & TikTok
            </p>
          </div>
        </div>

        {/* Duration Selection (if not already recording) */}
        {!isRecording && !recordedVideoUrl && (
          <div className="space-y-4 mb-6">
            <label className="text-xs font-semibold text-slate-300 block">
              Select Video Length:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'full', label: 'Complete Ayah', time: `${Math.round(duration)}s`, desc: 'Full Ayat al-Kursi' },
                { id: 'snippet30', label: '30s Highlight', time: '30s', desc: 'Viral Middle Hook' },
                { id: 'snippet15', label: '15s Teaser', time: '15s', desc: 'Opening 2 Verses' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setExportMode(opt.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    exportMode === opt.id
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-lg font-extrabold my-0.5">{opt.time}</div>
                  <div className="text-[10px] text-slate-400">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Export Features:</span>
              </div>
              <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                <li>Vertical 9:16 high-bitrate video stream</li>
                <li>Pure 6-year-old child Quran recitation audio synchronized</li>
                <li>Burned-in Arabic calligraphy subtitles with golden highlighting</li>
                <li>Audio-reactive mouth animation and eye blinking</li>
              </ul>
            </div>

            <button
              onClick={handleStartExport}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              <span>Record & Render Video ({targetDuration}s)</span>
            </button>
          </div>
        )}

        {/* Recording in Progress State */}
        {isRecording && (
          <div className="py-8 text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <Loader2 className="w-24 h-24 text-amber-400 animate-spin opacity-30" />
              <div className="absolute text-xl font-bold font-mono text-amber-300">
                {progress}%
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-100">{recordingStatus}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please keep this tab open while the video renders in 9:16 format...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              onClick={handleCancelExport}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel Recording
            </button>
          </div>
        )}

        {/* Recording Complete & Download State */}
        {recordedVideoUrl && !isRecording && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-center">
              <div className="inline-flex p-2.5 bg-emerald-500/20 text-emerald-400 rounded-full mb-2">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-300">
                Shorts Video Rendered Successfully!
              </h3>
              <p className="text-xs text-emerald-200/80 mt-1">
                Your 9:16 vertical video is ready to download and upload to YouTube, TikTok, or Instagram.
              </p>
            </div>

            {/* Video Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-[9/16] max-h-64 mx-auto shadow-2xl flex items-center justify-center">
              <video
                src={recordedVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Download Button */}
            <a
              href={recordedVideoUrl}
              download="Ayat_Al_Kursi_Child_Reciter_Shorts.webm"
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>Download 9:16 Video File</span>
            </a>

            {/* Copy Metadata for YouTube / TikTok */}
            <div className="p-4 bg-slate-800/50 border border-slate-700/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  Shorts Title & Viral Hashtags
                </span>
                <button
                  onClick={handleCopyMeta}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  {copiedMeta ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMeta ? 'Copied!' : 'Copy Info'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 line-clamp-3">
                {SHORTS_META.title}
                <br />
                {SHORTS_META.hashtags.join(' ')}
              </p>
            </div>

            <button
              onClick={() => {
                setRecordedVideoUrl(null);
              }}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Render Another Version
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
