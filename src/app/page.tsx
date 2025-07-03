"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar"
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const animatedTextRef = useRef<HTMLSpanElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [userToggled, setUserToggled] = useState(false);

  const toggleMute = () => {
    setUserToggled(true);
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (audioRef.current) {
        if (newMuted) {
          audioRef.current.pause();
        } else {
          audioRef.current.play().catch(() => {});
        }
      }
    }
  };

  useEffect(() => {
    if (!sentinelRef.current || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visiblePx = entry.intersectionRect.height;
        const totalPx = entry.boundingClientRect.height;
        const visibleRatio = visiblePx / totalPx;

        if (visibleRatio <= 0) {
          if (!userToggled) {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
            }
          } else {
            setUserToggled(false);
          }
        }
      },
      {
        root: null,
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [userToggled, isMuted]);


  return (
    <main className="bg-black text-white min-h-screen">
      <section ref={heroRef} className="w-full h-screen relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute w-full h-full object-cover"
        >
          
        </video>
        <audio ref={audioRef} src="/Fuck%20Tha%20Police.mp3" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="font-arial text-3xl md:text-7xl font-extrabold uppercase tracking-tighter xl:text-8xl">
            <span ref={animatedTextRef} className="text-red-500 opacity-95">Mudderfuger</span>
          </h1>
          <div className="flex-menu  flex flex-col md:flex-row">
          <Navbar />
          <button
            onClick={toggleMute}
            className="w-fit font-arial bg-transparent text-white px-3 py-1 rounded hover:bg-black/80 transition-colors duration-300 tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4 absolute relative translate-x-[344%] translate-y-[-110%] md:translate-x-3.5 md:translate-y-2"
          >
            {isMuted ? (
                  <SpeakerXMarkIcon className="h-8 w-8 text-white" />
                ) : (
                  <SpeakerWaveIcon className="h-8 w-8 text-white" />
                )}
          </button>
          </div>
                <a href="#" className="text-4xl font-arial-bold text-white mt-32 focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline leading-4">coming soon</a>
        </div>

        {/* Invisible sentinel div at the bottom of hero */}
        <div ref={sentinelRef} className="absolute bottom-0 h-[100px] w-full pointer-events-none" />
      </section>
    </main>
  );
}