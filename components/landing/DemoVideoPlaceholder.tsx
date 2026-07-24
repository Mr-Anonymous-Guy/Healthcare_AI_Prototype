'use client';

import { useState, useRef } from 'react';
import { Play, Pause, Film, Sparkles, CheckCircle2 } from 'lucide-react';

interface DemoVideoPlaceholderProps {
  /**
   * Path to the video file (e.g., '/demo-placeholder.mp4' or '/public/demo-placeholder.mp4')
   * Drop your real screen recording into public/ directory and pass the path here.
   */
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
}

export default function DemoVideoPlaceholder({
  videoSrc = '/Videos/Healthcare_AI_Prototype.mp4',
  posterSrc,
  title = 'HealthAI Assistant Interactive Product Walkthrough',
}: DemoVideoPlaceholderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasError(true));
    }
  };

  return (
    <div className="relative group max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-3 md:p-4">
      {/* Decorative Glow Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-emerald-500/20 rounded-3xl blur-2xl -z-10 group-hover:opacity-100 transition-opacity opacity-75" />

      {/* 16:9 Aspect Ratio Container */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-inner">
        {/* Actual Video Tag (attempts play when video file exists) */}
        {!hasError && (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            playsInline
            onEnded={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
            className="w-full h-full object-cover"
          />
        )}

        {/* Placeholder Screen UI when video is not playing or file is missing */}
        {(!isPlaying || hasError) && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white z-10 transition-all duration-300">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

            {/* Glassmorphic Play Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              aria-label="Play Product Demo Video"
              className="group/play cursor-pointer relative z-20 w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl hover:scale-105 hover:bg-blue-600/90 hover:border-blue-400 transition-all duration-300 mb-6"
            >
              <div className="absolute -inset-2 bg-blue-500/30 rounded-full blur-md opacity-0 group-hover/play:opacity-100 transition-opacity" />
              <Play className="w-8 h-8 md:w-10 md:h-10 fill-white translate-x-0.5" />
            </button>

            <div className="space-y-2 max-w-lg z-20">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Walkthrough Demo
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                Watch RAG medical document extraction, vitals analytics, and symptom tracking in real time.
              </p>
            </div>

            {/* Video File Path Helper Badge */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Film className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Drop video into <code className="text-blue-300 font-bold">{videoSrc}</code>
              </span>
            </div>
          </div>
        )}

        {/* Video Overlay Pause Control when Video is Playing */}
        {isPlaying && (
          <button
            type="button"
            onClick={handleTogglePlay}
            className="absolute bottom-4 right-4 z-30 p-3 rounded-full bg-slate-900/80 border border-slate-700 text-white hover:bg-slate-800 backdrop-blur-md transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <Pause className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Feature Bar Below Video */}
      <div className="mt-4 px-2 py-3 bg-slate-50/80 border border-slate-100 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Real-time PDF Parsing with PDF.js</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>OpenAI Vector RAG Search via pgvector</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Role-Gated Security & Audit Logs</span>
        </div>
      </div>
    </div>
  );
}
