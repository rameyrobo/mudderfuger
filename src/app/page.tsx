"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar"
import ScrollingBannerVids from "../components/ScrollingBannerVids"
import ScrollingBannerProds from "../components/ScrollingBannerProds"
import VideoGrid from "../components/VideoGrid";
import ProductsSection from "../components/ProductsSection";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import ContactModal from "../components/ContactModal";

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  useEffect(() => {
    async function fetchVideos() {
      const res = await fetch('/api/videos');
      const data = await res.json();
      setVideos(data);
    }
    fetchVideos();
  }, []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const animatedTextRef = useRef<HTMLSpanElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleMute = () => {
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

        if (visibleRatio <= 0.10) {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
          }
        } else {
          if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
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
  }, []);

  useEffect(() => {
    let hue = 0;
    let frameId: number;

    const animateHue = () => {
      if (animatedTextRef.current) {
        animatedTextRef.current.style.color = `hsl(${hue}, 100%, 50%)`;
      }
      hue = (hue + .3) % 360;
      frameId = requestAnimationFrame(animateHue);
    };

    frameId = requestAnimationFrame(animateHue);
    return () => cancelAnimationFrame(frameId);
  }, []);

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
            src="https://mudderfuger.b-cdn.net/_vids/1_intro.mp4"
            type="video/mp4"
          />
          <source
            src="https://mudderfuger.b-cdn.net/_vids/1_intro.webm"
            type="video/webm"
          />
        </video>

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="font-arial text-3xl md:text-7xl font-extrabold uppercase tracking-tighter xl:text-8xl">
            <span ref={animatedTextRef} className="text-red-500 opacity-95">Mudderfuger</span>
          </h1>
          <Navbar
            onNavClick={() => {
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
              }
            }}
            onContactClick={() => setIsModalOpen(true)}
          />
          <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
          <button
            onClick={toggleMute}
            className="font-arial bg-transparent text-white px-3 py-1 rounded hover:bg-black/80 transition-colors duration-300 tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4 translate-1.5 md:translate-x-4"
          >
            {isMuted ? (
                  <SpeakerXMarkIcon className="h-8 w-8 text-white" />
                ) : (
                  <SpeakerWaveIcon className="h-8 w-8 text-white" />
                )}
          </button>
        </div>

        {/* Invisible sentinel div at the bottom of hero */}
        <div ref={sentinelRef} className="absolute bottom-0 h-[100px] w-full pointer-events-none" />
      </section>

      <section 
      className="pb-0 pt-9 md:pt-10 lg:pt-11 xl:pt-12"
      id="story-section">
        <h2 className="text-2xl font-bold uppercase tracking-wide justify-self-center mb-px md:text-3xl lg:text-3xl xl:text-4xl">
          MuddaFuger&rsquo;s Story
        </h2>
      <ScrollingBannerVids />
      <VideoGrid isMuted={isMuted} videos={videos} />
      </section>

      <section id="be-mf" className="p-0 bg-black text-white flex flex-col items-center justify-center h-full overflow-x-hidden relative">
        <ScrollingBannerProds />
        <h2 className="
        color-white
        font-bold 
        uppercase
        tracking-wide
        justify-self-center
        px-8 
        py-4
        absolute
        bg-black
        opacity-85
        translate-y-9
        z-50
        pointer-events-none
        translate-x-2
        translate-y-9
        text-6xl
        sm:text-7xl 
        md:text-8xl 
        lg:text-9xl 
        xl:text-10rem
        xl:translate-y-5 
        xl:translate-y-4">
          Be<span className="space1">&nbsp;</span>a<span className="space2">&nbsp;</span>MF</h2>
          
        <ProductsSection />
      </section>
    </main>
  );
}

type Video = {
  id: number;
  title: string;
  url: string;
};