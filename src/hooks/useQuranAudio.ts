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
  const [duration, setDuration] = useState(53.96);
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

  // Initialize Web Audio graph
  const initAudioGraph = useCallback(() => {
    if (!audioElementRef.current) return;
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
        // Connect also to stream destination for video recording
        analyser.connect(streamDest);
      } catch (err) {
        console.warn('Audio node connection warning (can happen on re-mount):', err);
      }
    }

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
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

        // Calculate average energy in speech voice band (approx bins 2 to 30)
        let sum = 0;
        const count = Math.min(dataArray.length, 32);
        for (let i = 2; i < count; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (count - 2);
        // Normalize 0 to 1
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
    initAudioGraph();
    if (audioElementRef.current) {
      try {
        await audioElementRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Audio play error:', err);
      }
    }
  }, [initAudioGraph]);

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

  // Seek
  const seek = useCallback((seconds: number) => {
    if (audioElementRef.current) {
      const clamped = Math.max(0, Math.min(seconds, duration));
      audioElementRef.current.currentTime = clamped;
      setCurrentTime(clamped);
    }
  }, [duration]);

  // Set Playback Rate
  const setRate = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = rate;
    }
  }, []);

  // Load new audio source
  const loadAudioSource = useCallback((source: string, newDuration?: number) => {
    pause();
    setAudioSource(source);
    setCurrentTime(0);
    if (newDuration && newDuration > 0) {
      setDuration(newDuration);
    }
    if (audioElementRef.current) {
      audioElementRef.current.src = source;
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
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
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
