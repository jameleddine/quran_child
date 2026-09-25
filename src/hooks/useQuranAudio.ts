import { useState, useEffect, useRef, useCallback } from 'react';
import { AYAT_AL_KURSI_SEGMENTS, QuranSegment } from '../data/quranData';

export interface UseQuranAudioReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioEnergy: number;
  currentSegment: QuranSegment | null;
  currentSegmentIndex: number;
  segments: QuranSegment[];
  setSegments: (segs: QuranSegment[]) => void;
  audioSource: string;
  playbackRate: number;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => void;
  setRate: (rate: number) => void;
  loadAudioSource: (urlOrBase64: string, newDuration?: number) => void;
  audioElementRef: React.RefObject<HTMLAudioElement | null>;
  audioContextRef: React.RefObject<AudioContext | null>;
  mediaStreamDestinationRef: React.RefObject<MediaStreamAudioDestinationNode | null>;
}

export function useQuranAudio(
  initialAudioUrl: string = '/audio/ayat_alkursi_child.wav',
  initialSegments: QuranSegment[] = AYAT_AL_KURSI_SEGMENTS
): UseQuranAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(53.84);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [audioSource, setAudioSource] = useState(initialAudioUrl);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [segments, setSegments] = useState<QuranSegment[]>(initialSegments);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const mediaStreamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const pendingSeekRef = useRef<number | null>(null);

  // Initialize Web Audio graph
  const initAudioGraph = useCallback(() => {
    if (!audioElementRef.current) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const streamDest = ctx.createMediaStreamDestination();
        mediaStreamDestinationRef.current = streamDest;

        try {
          const source = ctx.createMediaElementSource(audioElementRef.current);
          sourceNodeRef.current = source;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          analyser.connect(streamDest);
        } catch (err) {
          console.warn('Audio node connection notice:', err);
        }
      }

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    } catch (err) {
      console.warn('AudioContext init non-fatal:', err);
    }
  }, []);

  // Audio energy analysis loop
  useEffect(() => {
    let active = true;
    const updateEnergy = () => {
      if (!active) return;
      if (analyserRef.current && isPlaying) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average energy in speech voice band (approx bins 2 to 32)
        let sum = 0;
        const count = Math.min(dataArray.length, 32);
        for (let i = 2; i < count; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (count - 2);
        const normalized = Math.min(1, Math.max(0, avg / 140));
        setAudioEnergy(normalized);
      } else if (!isPlaying) {
        setAudioEnergy(0);
      }
      animFrameRef.current = requestAnimationFrame(updateEnergy);
    };

    animFrameRef.current = requestAnimationFrame(updateEnergy);
    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Handle Play
  const play = useCallback(async () => {
    const audio = audioElementRef.current;
    if (!audio) return;

    // Ensure audio element has a valid src
    const currentSrc = audio.getAttribute('src') || audio.src;
    if (!currentSrc || currentSrc === window.location.href || currentSrc.endsWith('/')) {
      const fallbackSrc = audioSource || '/audio/ayat_alkursi_child.wav';
      audio.src = fallbackSrc;
      audio.load();
    }

    initAudioGraph();

    try {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.warn('Audio play attempt notice:', err?.message || err);
      // Auto-fallback if source is invalid or unsupported
      if (err?.name === 'NotSupportedError' || audio.error) {
        try {
          audio.src = '/audio/ayat_alkursi_child.wav';
          audio.load();
          await audio.play();
          setIsPlaying(true);
        } catch (retryErr) {
          console.error('Audio playback fallback notice:', retryErr);
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    }
  }, [audioSource, initAudioGraph]);

  // Handle Pause
  const pause = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle Play
  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  // Safe Seek
  const seek = useCallback((seconds: number) => {
    const clamped = Math.max(0, Math.min(seconds, duration || 60));
    setCurrentTime(clamped);

    if (audioElementRef.current) {
      try {
        if (audioElementRef.current.readyState >= 1) {
          audioElementRef.current.currentTime = clamped;
        } else {
          pendingSeekRef.current = clamped;
        }
      } catch (e) {
        console.warn('Safe seek intercepted:', e);
      }
    }
  }, [duration]);

  // Set Playback Rate
  const setRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = rate;
    }
  }, []);

  // Load new audio source safely
  const loadAudioSource = useCallback((source: string, newDuration?: number) => {
    pause();
    const validSource = (source && typeof source === 'string' && source.trim().length > 0)
      ? source.trim()
      : '/audio/ayat_alkursi_child.wav';

    setAudioSource(validSource);
    setCurrentTime(0);

    if (newDuration && newDuration > 0) {
      setDuration(newDuration);
    }

    if (audioElementRef.current) {
      audioElementRef.current.src = validSource;
      audioElementRef.current.load();
    }
  }, [pause]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioElementRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = null;
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const onError = () => {
      console.warn('Audio element error detected on src:', audio.src);
      // Auto-recover to default child audio if an external CDN failed
      if (audio.src && !audio.src.includes('ayat_alkursi_child.wav')) {
        audio.src = '/audio/ayat_alkursi_child.wav';
        audio.load();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Find active segment based on current time
  const currentSegmentIndex = segments.findIndex(
    (seg) => currentTime >= seg.startTime && currentTime < seg.endTime
  );

  const currentSegment = currentSegmentIndex !== -1
    ? segments[currentSegmentIndex]
    : segments[0] || null;

  return {
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
  };
}
