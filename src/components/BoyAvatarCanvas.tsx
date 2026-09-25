import React, { useEffect, useRef } from 'react';

interface BoyAvatarCanvasProps {
  isPlaying: boolean;
  audioEnergy: number; // 0 to 1 from AudioAnalyser
  customImageSrc?: string | null;
  showParticles?: boolean;
  showLightRays?: boolean;
  theme?: 'mediterranean' | 'golden_noor' | 'madinah' | 'night_stars';
  burnCaptionsOnCanvas?: boolean;
  currentSegment?: any | null;
  currentTime?: number;
  photoMotion?: boolean;
  photoColorGrade?: 'none' | 'warm_sun' | 'soft_glow';
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

export const BoyAvatarCanvas: React.FC<BoyAvatarCanvasProps> = ({
  isPlaying,
  audioEnergy,
  customImageSrc,
  showParticles = true,
  showLightRays = true,
  theme = 'mediterranean',
  burnCaptionsOnCanvas = false,
  currentSegment = null,
  currentTime = 0,
  photoMotion = true,
  photoColorGrade = 'none',
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userImageRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Store mutable props in a ref to avoid resetting the canvas animation loop on every audio/time tick
  const propsRef = useRef({
    isPlaying,
    audioEnergy,
    customImageSrc,
    showParticles,
    showLightRays,
    theme,
    burnCaptionsOnCanvas,
    currentSegment,
    currentTime,
    photoMotion,
    photoColorGrade,
  });

  useEffect(() => {
    propsRef.current = {
      isPlaying,
      audioEnergy,
      customImageSrc,
      showParticles,
      showLightRays,
      theme,
      burnCaptionsOnCanvas,
      currentSegment,
      currentTime,
      photoMotion,
      photoColorGrade,
    };
  });

  // Load custom image when provided
  useEffect(() => {
    if (customImageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        userImageRef.current = img;
      };
      img.src = customImageSrc;
      if (img.complete) {
        userImageRef.current = img;
      }
    } else {
      userImageRef.current = null;
    }
  }, [customImageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Fixed canvas internal resolution for crisp 9:16 Shorts rendering (720x1280)
    const W = 720;
    const H = 1280;
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    if (onCanvasReady) onCanvasReady(canvas);

    // Using alpha: false guarantees the canvas buffer is never cleared to transparent black
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Particle setup
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      radius: Math.random() * 3 + 1,
      speedY: Math.random() * 0.4 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI,
    }));

    // Floating petals setup
    const petals = Array.from({ length: 15 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.4,
      size: Math.random() * 6 + 4,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      speedY: Math.random() * 0.5 + 0.3,
      speedX: Math.sin(Math.random() * 10) * 0.4,
      color: Math.random() > 0.3 ? '#f43f5e' : '#fb7185',
    }));

    let startTime = performance.now();
    let blinkValue = 0; // 0 = open, 1 = closed
    let nextBlinkTime = performance.now() + 2500;
    let mouthOpening = 0;

    const render = (time: number) => {
      const {
        isPlaying: activePlaying,
        audioEnergy: activeEnergy,
        showParticles: activeParticles,
        showLightRays: activeLightRays,
        theme: activeTheme,
        burnCaptionsOnCanvas: activeBurn,
        currentSegment: activeSegment,
        currentTime: activeTime,
        photoMotion: activePhotoMotion,
        photoColorGrade: activeColorGrade,
      } = propsRef.current;

      const elapsed = (time - startTime) / 1000;

      // Handle Blinking
      if (time > nextBlinkTime) {
        blinkValue = 1;
        if (time > nextBlinkTime + 130) {
          blinkValue = 0;
          nextBlinkTime = time + 3000 + Math.random() * 3500;
        }
      }

      // Smooth mouth interpolation
      const targetMouth = activePlaying ? Math.min(1, Math.max(0, activeEnergy * 1.5)) : 0;
      mouthOpening += (targetMouth - mouthOpening) * 0.25;

      // Subtle breathing motion
      const breath = Math.sin(elapsed * 1.5) * 3;
      const headSway = Math.sin(elapsed * 0.8) * 1.5;

      // DO NOT call clearRect - background is drawn completely opaque over the frame
      // This prevents black strobe flickering during screen recording / MediaRecorder capture
      if (userImageRef.current && userImageRef.current.complete) {
        drawPristineUserPhoto(
          ctx,
          userImageRef.current,
          W,
          H,
          elapsed,
          activePhotoMotion,
          activeColorGrade
        );
      } else {
        // Draw the authentic 6-year-old Tunisian boy in red chechia & cream jebba
        drawDefaultBoyScene(
          ctx,
          W,
          H,
          elapsed,
          mouthOpening,
          blinkValue,
          breath,
          headSway,
          activeTheme
        );
      }

      // Draw Divine Light Rays
      if (activeLightRays) {
        drawCelestialLightRays(ctx, W, H, elapsed);
      }

      // Draw Ambient Particles (Noor & Bougainvillea petals)
      if (activeParticles) {
        drawAmbientEffects(ctx, particles, petals, W, H, elapsed);
      }

      // Vignette & Cinematic Border Overlay
      drawCinematicVignette(ctx, W, H);

      // Burn Captions on Canvas (for direct recording / video export)
      if (activeBurn && activeSegment) {
        drawCanvasCaptions(ctx, W, H, activeSegment, activeTime);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []); // Run once on mount! Never restart or re-dimension canvas during playback/recording

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-300"
        style={{ aspectRatio: '9 / 16' }}
      />
    </div>
  );
};

// ==========================================
// SCENE RENDERERS
// ==========================================

function drawDefaultBoyScene(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  elapsed: number,
  mouthOpening: number,
  blinkValue: number,
  breath: number,
  headSway: number,
  theme: string
) {
  // 1. Background Wall & Mediterranean Architecture
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  if (theme === 'golden_noor') {
    bgGrad.addColorStop(0, '#3b1f0b');
    bgGrad.addColorStop(0.5, '#5c3311');
    bgGrad.addColorStop(1, '#1a0b02');
  } else if (theme === 'night_stars') {
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
  } else {
    // Tunisian Sidi Bou Said sunny whitewash & azure
    bgGrad.addColorStop(0, '#e2e8f0');
    bgGrad.addColorStop(0.4, '#f8fafc');
    bgGrad.addColorStop(1, '#cbd5e1');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Background Blue Arched Door (Sidi Bou Said signature)
  const doorX = W * 0.5 + 40;
  const doorY = H * 0.35;
  const doorW = W * 0.48;
  const doorH = H * 0.45;

  ctx.save();
  ctx.beginPath();
  ctx.arc(doorX + doorW / 2, doorY, doorW / 2, Math.PI, 0, false);
  ctx.lineTo(doorX + doorW, doorY + doorH);
  ctx.lineTo(doorX, doorY + doorH);
  ctx.closePath();
  ctx.fillStyle = '#0284c7'; // vibrant Mediterranean blue
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#0369a1';
  ctx.stroke();

  // Door studs pattern (traditional Andalusian/Tunisian iron nail art)
  ctx.fillStyle = '#0f172a';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      ctx.arc(doorX + 35 + c * 50, doorY + 50 + r * 60, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Mediterranean Bougainvillea Vines cascading from top-right
  ctx.save();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(W, 0);
  ctx.bezierCurveTo(W * 0.8, H * 0.05, W * 0.7, H * 0.12, W * 0.65, H * 0.18);
  ctx.stroke();

  // Bougainvillea blossoms
  const flowerCluster = [
    { x: W * 0.88, y: H * 0.04, s: 18 },
    { x: W * 0.82, y: H * 0.08, s: 22 },
    { x: W * 0.75, y: H * 0.11, s: 26 },
    { x: W * 0.68, y: H * 0.15, s: 20 },
    { x: W * 0.64, y: H * 0.19, s: 16 },
  ];
  for (const f of flowerCluster) {
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(f.x - 3, f.y - 2, f.s * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(f.x - 1, f.y - 1, f.s * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. The 6-Year-Old Boy Portrait
  const centerX = W * 0.5 + headSway;
  const centerY = H * 0.46 + breath;

  // Shoulders & Traditional Cream Jebba Tunic
  ctx.save();
  ctx.fillStyle = '#fefdfa'; // warm ivory cream
  ctx.beginPath();
  ctx.moveTo(centerX - 180, H);
  ctx.lineTo(centerX - 170, centerY + 280);
  ctx.quadraticCurveTo(centerX - 130, centerY + 180, centerX - 70, centerY + 140);
  ctx.lineTo(centerX + 70, centerY + 140);
  ctx.quadraticCurveTo(centerX + 130, centerY + 180, centerX + 170, centerY + 280);
  ctx.lineTo(centerX + 180, H);
  ctx.closePath();
  ctx.fill();

  // Jebba Collar and intricate arabesque embroidery
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#e2d9c8'; // gold-cream thread
  ctx.stroke();

  // Detailed Moroccan/Tunisian gold chest embroidery
  ctx.strokeStyle = '#d4af37'; // antique gold
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Central placket buttons
  ctx.moveTo(centerX, centerY + 140);
  ctx.lineTo(centerX, centerY + 360);
  ctx.stroke();

  // Small handmade knotted buttons (khobbaza)
  ctx.fillStyle = '#c5a028';
  for (let b = 0; b < 7; b++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY + 155 + b * 22, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Symmetrical embroidery flourishes
  for (let side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(centerX + side * 40, centerY + 200, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + side * 65, centerY + 250, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Right Hand placed gently over Heart (left chest)
  const handX = centerX + 15;
  const handY = centerY + 260 + breath * 0.5;
  ctx.fillStyle = '#f5cba7'; // child skin tone
  ctx.beginPath();
  ctx.ellipse(handX, handY, 44, 26, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Delicate child fingers
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(handX - 22 + f * 12, handY - 14 + f * 4, 7, 18, -0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Neck
  ctx.save();
  ctx.fillStyle = '#f1c29b';
  ctx.fillRect(centerX - 35, centerY + 90, 70, 60);
  ctx.restore();

  // Head / Face
  const headRadiusX = 86;
  const headRadiusY = 104;

  ctx.save();
  // Soft child jaw / cheeks
  ctx.fillStyle = '#fbd4b4';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheeks Rosy Blush
  const blushGrad = ctx.createRadialGradient(centerX - 46, centerY + 20, 4, centerX - 46, centerY + 20, 28);
  blushGrad.addColorStop(0, 'rgba(244, 114, 182, 0.4)');
  blushGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
  ctx.fillStyle = blushGrad;
  ctx.beginPath();
  ctx.arc(centerX - 46, centerY + 20, 28, 0, Math.PI * 2);
  ctx.fill();

  const blushGradR = ctx.createRadialGradient(centerX + 46, centerY + 20, 4, centerX + 46, centerY + 20, 28);
  blushGradR.addColorStop(0, 'rgba(244, 114, 182, 0.4)');
  blushGradR.addColorStop(1, 'rgba(244, 114, 182, 0)');
  ctx.fillStyle = blushGradR;
  ctx.beginPath();
  ctx.arc(centerX + 46, centerY + 20, 28, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  for (let s of [-1, 1]) {
    ctx.fillStyle = '#f8caa2';
    ctx.beginPath();
    ctx.ellipse(centerX + s * (headRadiusX - 2), centerY + 4, 14, 22, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hair strands peaking out under chechia
  ctx.fillStyle = '#3e2723'; // dark brown child hair
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - 65, headRadiusX - 4, 25, 0, 0, Math.PI);
  ctx.fill();

  // RED CHECHIA (Tunisian Felt Cap)
  const capY = centerY - 88;
  const capW = headRadiusX + 8;
  const capH = 68;

  ctx.fillStyle = '#b91c1c'; // deep felt crimson red
  ctx.beginPath();
  ctx.roundRect(centerX - capW, capY, capW * 2, capH, [30, 30, 10, 10]);
  ctx.fill();

  // Chechia 3D felt shadow & highlight
  const capGrad = ctx.createLinearGradient(centerX - capW, capY, centerX + capW, capY);
  capGrad.addColorStop(0, 'rgba(0,0,0,0.3)');
  capGrad.addColorStop(0.3, 'rgba(255,255,255,0.15)');
  capGrad.addColorStop(0.7, 'rgba(255,255,255,0.05)');
  capGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.roundRect(centerX - capW, capY, capW * 2, capH, [30, 30, 10, 10]);
  ctx.fill();

  // Eyes & Eyebrows
  const eyeOffsetY = centerY - 12;
  const eyeDistance = 38;

  // Eyebrows
  ctx.strokeStyle = '#4a2c11';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  // Left eyebrow
  ctx.beginPath();
  ctx.moveTo(centerX - eyeDistance - 18, eyeOffsetY - 18);
  ctx.quadraticCurveTo(centerX - eyeDistance, eyeOffsetY - 24, centerX - eyeDistance + 16, eyeOffsetY - 17);
  ctx.stroke();
  // Right eyebrow
  ctx.beginPath();
  ctx.moveTo(centerX + eyeDistance - 16, eyeOffsetY - 17);
  ctx.quadraticCurveTo(centerX + eyeDistance, eyeOffsetY - 24, centerX + eyeDistance + 18, eyeOffsetY - 18);
  ctx.stroke();

  // Eyes (with realistic blinking)
  for (let s of [-1, 1]) {
    const ex = centerX + s * eyeDistance;
    const ey = eyeOffsetY;

    if (blinkValue > 0.6) {
      // Closed Eye (gentle curved line with lashes)
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ex, ey + 2, 11, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else {
      // Open Eye
      // Sclera (White)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(ex, ey, 13, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris (Warm Hazel / Brown)
      ctx.fillStyle = '#5c3818';
      ctx.beginPath();
      ctx.arc(ex, ey, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Bright Sparkle / Glint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex - 2, ey - 2, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Nose
  ctx.strokeStyle = '#e0a982';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 2);
  ctx.lineTo(centerX + 3, centerY + 16);
  ctx.quadraticCurveTo(centerX, centerY + 20, centerX - 5, centerY + 18);
  ctx.stroke();

  // Child Mouth with Audio-Reactive Lip Movement
  const mouthY = centerY + 42;
  const mouthWidth = 28 + mouthOpening * 8;
  const mouthHeight = Math.max(3, mouthOpening * 18);

  if (mouthOpening < 0.08) {
    // Serene peaceful child smile (resting / waqf pause)
    ctx.strokeStyle = '#be5a5a';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(centerX - 16, mouthY - 1);
    ctx.quadraticCurveTo(centerX, mouthY + 7, centerX + 16, mouthY - 1);
    ctx.stroke();

    // Dimples
    ctx.fillStyle = '#df8989';
    ctx.beginPath();
    ctx.arc(centerX - 18, mouthY - 2, 1.8, 0, Math.PI * 2);
    ctx.arc(centerX + 18, mouthY - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Reciting Quran - Mouth Opens and moves with tajweed pronunciation
    // Mouth Cavity
    ctx.fillStyle = '#5c1d1d';
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY + mouthHeight * 0.4, mouthWidth * 0.5, mouthHeight * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper Teeth row (peeking out)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY + 1, mouthWidth * 0.35, 3, 0, 0, Math.PI);
    ctx.fill();

    // Tongue
    ctx.fillStyle = '#e17272';
    ctx.beginPath();
    ctx.ellipse(centerX, mouthY + mouthHeight * 0.65, mouthWidth * 0.28, 4, 0, 0, Math.PI);
    ctx.fill();

    // Lips outline
    ctx.strokeStyle = '#b44a4a';
    ctx.lineWidth = 2.8;
    ctx.stroke();
  }

  ctx.restore();
}

function drawPristineUserPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  W: number,
  H: number,
  elapsed: number,
  cinematicMotion: boolean = true,
  colorGrade: 'none' | 'warm_sun' | 'soft_glow' = 'none'
) {
  // Calculate source aspect ratio to cover 9:16 perfectly without distortion
  const imgRatio = img.width / img.height;
  const targetRatio = W / H;
  let sWidth = img.width;
  let sHeight = img.height;
  let sx = 0;
  let sy = 0;

  if (imgRatio > targetRatio) {
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
  } else {
    sHeight = img.width / targetRatio;
    sy = (img.height - sHeight) / 2;
  }

  ctx.save();

  // Subtle cinematic Ken Burns slow zoom (standard in professional video shorts)
  if (cinematicMotion) {
    const slowZoom = 1.0 + Math.sin(elapsed * 0.15) * 0.02; // very subtle 2% max zoom
    ctx.translate(W / 2, H * 0.45);
    ctx.scale(slowZoom, slowZoom);
    ctx.translate(-W / 2, -H * 0.45);
  }

  // Draw the original photo completely crisp and clean - NO mouth, eye, or face distortion
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, W, H);

  // Optional subtle color grading
  if (colorGrade === 'warm_sun') {
    ctx.fillStyle = 'rgba(251, 191, 36, 0.06)';
    ctx.fillRect(0, 0, W, H);
  } else if (colorGrade === 'soft_glow') {
    const radial = ctx.createRadialGradient(W / 2, H * 0.4, 60, W / 2, H * 0.4, W * 0.8);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}

function drawCelestialLightRays(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  elapsed: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const numRays = 6;
  const originX = W * 0.5;
  const originY = -50;

  for (let i = 0; i < numRays; i++) {
    const angle = ((i - (numRays - 1) / 2) * 0.22) + Math.sin(elapsed * 0.6 + i) * 0.05;
    const rayWidth = 60 + Math.sin(elapsed + i * 2) * 20;

    const grad = ctx.createLinearGradient(originX, originY, originX + Math.sin(angle) * H, H);
    grad.addColorStop(0, 'rgba(253, 230, 138, 0.22)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(originX - rayWidth / 2, originY);
    ctx.lineTo(originX + rayWidth / 2, originY);
    ctx.lineTo(originX + Math.sin(angle) * H + rayWidth * 2, H);
    ctx.lineTo(originX + Math.sin(angle) * H - rayWidth * 2, H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawAmbientEffects(
  ctx: CanvasRenderingContext2D,
  particles: any[],
  petals: any[],
  W: number,
  H: number,
  elapsed: number
) {
  ctx.save();
  // 1. Golden Noor particles
  for (const p of particles) {
    p.y -= p.speedY;
    p.x += Math.sin(elapsed + p.pulse) * 0.4;
    if (p.y < 0) {
      p.y = H;
      p.x = Math.random() * W;
    }

    const currentAlpha = p.alpha * (0.6 + Math.sin(elapsed * 2 + p.pulse) * 0.4);
    ctx.fillStyle = `rgba(251, 191, 36, ${currentAlpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();

    // Halo
    ctx.fillStyle = `rgba(251, 191, 36, ${currentAlpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Cascading Bougainvillea Petals
  for (const pt of petals) {
    pt.y += pt.speedY;
    pt.x += Math.sin(elapsed + pt.size) * 0.5;
    pt.rotation += pt.rotSpeed;
    if (pt.y > H * 0.7) {
      pt.y = 0;
      pt.x = Math.random() * W;
    }

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(pt.rotation);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, pt.size, pt.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function drawCinematicVignette(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.save();
  // Top and bottom shadow for text legibility in Shorts
  const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.22);
  topGrad.addColorStop(0, 'rgba(2, 6, 23, 0.85)');
  topGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, H * 0.22);

  const bottomGrad = ctx.createLinearGradient(0, H * 0.62, 0, H);
  bottomGrad.addColorStop(0, 'rgba(2, 6, 23, 0)');
  bottomGrad.addColorStop(0.5, 'rgba(2, 6, 23, 0.75)');
  bottomGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
  ctx.fillStyle = bottomGrad;
  ctx.fillRect(0, H * 0.62, W, H * 0.38);

  ctx.restore();
}

function drawCanvasCaptions(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  segment: any,
  _currentTime: number
) {
  ctx.save();
  const boxY = H - 260;
  const boxW = W * 0.92;
  const boxX = (W - boxW) / 2;

  // Background Glass Box
  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, 185, 20);
  ctx.fill();
  ctx.stroke();

  // Badge
  ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 75, boxY - 14, 150, 26, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(segment.verseRef || 'القرآن الكريم', W / 2, boxY + 4);

  // Arabic Text
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 32px "Amiri", "Scheherazade New", serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.85)';
  ctx.shadowBlur = 16;
  ctx.fillText(segment.arabic, W / 2, boxY + 65);
  ctx.shadowBlur = 0;

  // Transliteration
  ctx.fillStyle = '#fde047';
  ctx.font = 'italic 16px system-ui, sans-serif';
  ctx.fillText(segment.transliteration, W / 2, boxY + 105);

  // Translation
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '14px system-ui, sans-serif';
  const words = (segment.translation || '').split(' ');
  let line = '';
  let lineY = boxY + 135;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > boxW - 40 && n > 0) {
      ctx.fillText(line, W / 2, lineY);
      line = words[n] + ' ';
      lineY += 18;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, W / 2, lineY);

  ctx.restore();
}
