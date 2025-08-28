"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar"
import ScrollingBannerVids from "../components/ScrollingBannerVids"
import ScrollingBannerProds from "../components/ScrollingBannerProds"
import dynamic from "next/dynamic";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import ContactModal from "../components/ContactModal";
const VideoGrid = dynamic(() => import("../components/VideoGrid"), { ssr: false });
const ProductsSection = dynamic(() => import("../components/ProductsSection"), { ssr: false });

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
  const heroVideoUrl = 'https://mudderfuger.b-cdn.net/_hero/1_intro.mp4'

  const [isMuted, setIsMuted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferWebm, setPreferWebm] = useState<null | boolean>(null);
  const [shouldPause, setShouldPause] = useState(false); // NEW: track if video should be paused by nav/modal
  const shouldPauseRef = useRef(shouldPause);

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (shouldPause || isModalOpen) {
      videoRef.current.pause();
    } else {
      // Only play if in view (IntersectionObserver will handle this)
      // Try to play, but browser may block if not in view
      videoRef.current.play().catch(() => {});
    }
  }, [shouldPause, isModalOpen])

  useEffect(() => {
    const ua = navigator.userAgent;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isFirefox = ua.toLowerCase().includes('firefox');
    if (isSafari || isFirefox) {
      setPreferWebm(true);
    } else {
      setPreferWebm(false);
    }
  }, []);

  // Keep shouldPauseRef in sync with shouldPause
useEffect(() => {
  shouldPauseRef.current = shouldPause;
}, [shouldPause]);

// IntersectionObserver: pause if out of view, play if in view and not paused by nav/modal
useEffect(() => {
  if (!sentinelRef.current || !videoRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      const visiblePx = entry.intersectionRect.height;
      const totalPx = entry.boundingClientRect.height;
      const visibleRatio = visiblePx / totalPx;

      // Always sync muted state before play/pause
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
      }

      if (visibleRatio <= 0.10) {
        videoRef.current?.pause();
      } else {
        // Only play if not paused by nav/modal
        if (!shouldPauseRef.current && !isModalOpen) {
          videoRef.current?.play().catch(() => {});
        }
        // If shouldPause was set by nav, but user scrolled back, reset it
        if (shouldPauseRef.current && !isModalOpen) {
          setShouldPause(false);
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
}, [isModalOpen, isMuted]); 


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

  // Dynamically set the video poster to the best size for the device
  useEffect(() => {
    if (!videoRef.current) return;
    function getBestThumbSize() {
      const w = window.innerWidth;
      if (w < 450) return 320;
      if (w < 640) return 640;
      if (w < 1024) return 1280;
      return 1920;
    }
    const size = getBestThumbSize();
    videoRef.current.poster = `/mudderfuger-thumbnail-${size}.webp`;
  }, [preferWebm, isMuted]);

  return (
    <main className="bg-black text-white min-h-screen">
      <section ref={heroRef} className="w-full h-screen max-h-[100dvh]relative overflow-hidden">
        {preferWebm !== null && (
          <picture id="hero-picture">
            <source
              id="hero-srcset"
              srcSet="/mudderfuger-thumbnail-320.webp 320w, /mudderfuger-thumbnail-640.webp 640w, /mudderfuger-thumbnail-1280.webp 1280w, /mudderfuger-thumbnail-1920.webp 1920w"
              sizes="(max-width:450px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1280px, 1920px"
              type="image/webp"
            />
            {/* No <img> fallback, only responsive <source> */}
            <video
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              poster="/mudderfuger-thumbnail-1280.webp"
              className="absolute w-full h-full object-cover"
              id="hero-video"
            >
              <source
                src={
                  preferWebm
                    ? heroVideoUrl.replace('.mp4', '.webm')
                    : heroVideoUrl
                }
                type={preferWebm ? 'video/webm' : 'video/mp4'}
              />
            </video>
          </picture>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="font-arial text-3xl md:text-7xl font-extrabold uppercase tracking-tighter xl:text-8xl">
            <span ref={animatedTextRef} className="text-red-500 opacity-95">Mudderfuger</span>
          </h1>
          <Navbar
            onNavClick={() => setShouldPause(true)}
            onContactClick={() => setIsModalOpen(true)}
          />
          <ContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
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
        <h2 className="text-2xl font-bold uppercase text-center tracking-wide justify-self-center mb-px md:text-3xl lg:text-3xl xl:text-4xl">
          Mudderfuger&rsquo;s Story
        </h2>
      <ScrollingBannerVids />
      <VideoGrid isMuted={isMuted} videos={videos} />
      </section>

      <section id="be-mf" className="p-0 bg-black text-white flex flex-col items-center justify-center h-full max-h-[100dvh] overflow-x-hidden relative">
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