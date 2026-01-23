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
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const isMutedRef = useRef(true);
  const isModalOpenRef = useRef(false);
  const inViewRef = useRef(true);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const heroVideoUrl = 'https://mudderfuger.b-cdn.net/_trailer/mudderfuger_official_trailer.mp4'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferWebm, setPreferWebm] = useState<null | boolean>(null);

  // Set initial muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
    }
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
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
  }, [preferWebm]);

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
              muted
              playsInline
              poster="/mudderfuger-thumbnail-1280.webp"
              className="absolute w-full h-full object-cover"
              id="hero-video"
              onLoadedData={() => {
                startVideoMonitoring();
                setupIntersectionObserver();
              }}
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
            onContactClick={() => setIsModalOpen(true)}
          />
          <ContactModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          <button
            ref={muteButtonRef}
            onClick={toggleMute}
            aria-label="Unmute video"
            aria-pressed="false"
            className="font-arial bg-transparent text-white px-3 py-1 rounded hover:bg-black/80 transition-colors duration-300 tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4 translate-1.5 md:translate-x-4"
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
      className="pb-0 pt-9 md:pt-10 lg:pt-11 xl:pt-12"
      id="story-section">
        <h2 className="text-2xl font-bold uppercase text-center tracking-wide justify-self-center mb-px md:text-3xl lg:text-3xl xl:text-4xl">
          Mudderfuger&rsquo;s Story
        </h2>
      <ScrollingBannerVids />
      <VideoGrid isMuted={true} videos={videos} />
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