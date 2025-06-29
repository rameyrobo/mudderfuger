"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar"
import ScrollingBanner from "../components/ScrollingBanner"
import VideoGrid from "../components/VideoGrid";
import ProductsSection from "../components/ProductsSection";

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [userToggled, setUserToggled] = useState(false);

  const toggleMute = () => {
    setUserToggled(true);
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
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
          <source
            src="https://mudderfuger.b-cdn.net/_vids/1_mudderfuger_intro.webm"
            type="video/webm"
          />
          <source
            src="https://mudderfuger.b-cdn.net/_vids/1_mudderfuger_intro.mp4"
            type="video/mp4"
          />
        </video>

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-6xl md:text-9xl font-extrabold uppercase tracking-wide text-white">
            Mudderfuger
          </h1>
          <Navbar />
          <button
            onClick={toggleMute}
            className="absolute top-5 right-5 z-20 bg-black/60 text-white px-3 py-1 rounded hover:bg-black/80"
          >
            {isMuted ? "🔇 Enable Sound" : "🔊 Mute"}
          </button>
        </div>

        {/* Invisible sentinel div at the bottom of hero */}
        <div ref={sentinelRef} className="absolute bottom-0 h-[100px] w-full pointer-events-none" />
      </section>

      <section 
      className="pt-0 pb-10"
      id="story-section">
        <ScrollingBanner />
        <h2 className="text-6xl font-bold mb-16 uppercase tracking-wide justify-self-center">
          MuddaFugger&rsquo;s Story
        </h2>
      <VideoGrid isMuted={isMuted} />
      </section>

      <section id="be-mf" className="p-0 bg-white text-black">
        <ProductsSection />
      </section>
    </main>
  );
}