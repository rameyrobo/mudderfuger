"use client";

import { useEffect, useRef, useState } from "react";
import ScrollingBannerVids from "../components/ScrollingBannerVids"
import ScrollingBannerProds from "../components/ScrollingBannerProds"
import dynamic from "next/dynamic";
import ContactModal from "../components/ContactModal";
const VideoGrid = dynamic(() => import("../components/VideoGrid"), { ssr: false });
const ProductsSection = dynamic(() => import("../components/ProductsSection"), { ssr: false });
const PyroProductsSection = dynamic(() => import("../components/PyroProductsSection"), { ssr: false });

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
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const isMutedRef = useRef(true);
  const isModalOpenRef = useRef(false);
  const inViewRef = useRef(true);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const heroVideoUrl = 'https://mudderfuger.b-cdn.net/_trailer/MUDDERFUGER_OFFICIAL_TRAILER_.mp4'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferWebm, setPreferWebm] = useState<null | boolean>(null);

  // Set initial muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  }, []);

  const toggleMute = () => {
    if (videoRef.current && muteButtonRef.current) {
      const video = videoRef.current;
      video.muted = !video.muted;
      isMutedRef.current = video.muted;
      
      // Update button icon
      muteButtonRef.current.innerHTML = video.muted 
        ? '<svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>'
        : '<svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>';
      
      muteButtonRef.current.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      muteButtonRef.current.setAttribute('aria-pressed', String(!video.muted));
      
      // Force play after a tiny delay to let muted change take effect
      setTimeout(() => {
        if (!video.paused) return; // Already playing
        video.play().catch(() => {});
      }, 10);
    }
  };

  // Set up IntersectionObserver after video is loaded
  const setupIntersectionObserver = () => {
    if (!sentinelRef.current) return;
    if (observerRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const visiblePx = entry.intersectionRect.height;
        const totalPx = entry.boundingClientRect.height;
        const visibleRatio = visiblePx / totalPx;
        const isInView = visibleRatio > 0.10;
        
        inViewRef.current = isInView;

        if (!videoRef.current) return;

        if (!isInView) {
          videoRef.current.pause();
        } else if (!isModalOpenRef.current) {
          videoRef.current.play().catch(() => {});
        }
      },
      {
        root: null,
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observerRef.current.observe(sentinelRef.current);
  };

  // Start monitoring video after it's loaded
  const startVideoMonitoring = () => {
    const video = videoRef.current;
    if (!video) return;

    // Clear any existing interval first
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(() => {
      if (inViewRef.current && !isModalOpenRef.current && video.paused) {
        video.play().catch(() => {});
      }
    }, 100);
  };

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
    if (!videoRef.current) return;
    
    if (isModalOpen) {
      videoRef.current.pause();
    } else if (inViewRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isModalOpen]);

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

  // Cleanup interval and observer on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Set the video poster
  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.poster = 'https://mudderfuger.b-cdn.net/_trailer/screenshot.jpg';
  }, [preferWebm]);

  return (
    <main className="bg-black text-white h-screen overflow-y-scroll" style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}>
      <section ref={heroRef} className="w-full h-screen max-h-[100dvh] relative overflow-hidden" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
        {preferWebm !== null && (
          <picture id="hero-picture">
            <source
              id="hero-srcset"
              srcSet="https://mudderfuger.b-cdn.net/_trailer/screenshot.webp"
              type="image/webp"
            />
            <source
              srcSet="https://mudderfuger.b-cdn.net/_trailer/screenshot.jpg"
              type="image/jpeg"
            />
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster="https://mudderfuger.b-cdn.net/_trailer/screenshot.jpg"
              className="absolute w-full h-full object-cover"
              id="hero-video"
              onLoadedData={() => {
                startVideoMonitoring();
                setupIntersectionObserver();
              }}
            >
              <source
                src="https://mudderfuger.b-cdn.net/_trailer/MUDDERFUGER_OFFICIAL_TRAILER_.webm"
                type="video/webm"
              />
              <source
                src={heroVideoUrl}
                type="video/mp4"
              />
            </video>
          </picture>
        )}

        <div className="relative z-10 flex flex-col items-center justify-start pt-8 md:pt-12 h-full">
          <h1 className="font-arial text-3xl md:text-7xl font-extrabold uppercase tracking-tighter xl:text-8xl">
            <span ref={animatedTextRef} className="text-red-500 opacity-95">Mudderfuger</span>
          </h1>
          <div className="flex flex-wrap gap-1 mt-4 text-xl font-semibold uppercase flex-col md:flex-row md:gap-4 items-center">
            <a href="#story-section" className="font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4">MF&apos;s Story</a>
            <a href="#pyro-skateshop" className="font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4">Pyro Skateshop</a>
            <a href="#be-mf" className="font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline leading-4">Be a MF</a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="font-arial-bold uppercase text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline leading-4 cursor-pointer"
            >
              Contact
            </button>
            <div className="flex gap-4">
              <a 
                href="https://www.youtube.com/@mudderfuger" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-red-500 transition-colors cursor-pointer"
                aria-label="YouTube"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/mudderfuger/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-red-500 transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
          <ContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          <button
            ref={muteButtonRef}
            onClick={toggleMute}
            aria-label="Unmute video"
            aria-pressed="false"
            className="font-arial bg-transparent text-white px-3 py-1 rounded hover:bg-black/80 transition-colors duration-300 tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4 translate-1.5 md:translate-x-4 mt-2"
          >
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </button>
        </div>

        {/* Invisible sentinel div at the bottom of hero */}
        <div ref={sentinelRef} className="absolute bottom-0 h-[100px] w-full pointer-events-none" />
      </section>

      <section 
      className="pb-0 pt-9 md:pt-10 lg:pt-11 xl:pt-12 h-max"
      id="story-section"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
        <h2 className="text-2xl font-bold uppercase text-center tracking-wide justify-self-center mb-px md:text-3xl lg:text-3xl xl:text-4xl">
          Mudderfuger&rsquo;s Story
        </h2>
      <ScrollingBannerVids />
      <VideoGrid isMuted={true} videos={videos} />
      </section>

      <PyroProductsSection />

      <section id="be-mf" className="p-0 bg-black text-white flex flex-col items-center justify-center h-screen max-h-[100dvh] overflow-x-hidden relative" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
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