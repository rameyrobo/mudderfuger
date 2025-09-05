"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar"
import ScrollingBannerVids from "../components/ScrollingBannerVids"
import dynamic from "next/dynamic";
import { SpeakerWaveIcon, SpeakerXMarkIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import ContactModal from "../components/ContactModal";
import type { Video } from '../types/video';
import type { VideoGridProps } from "../components/VideoGrid";
import Image from "next/image";

const VideoGrid = dynamic<VideoGridProps>(
  () => import("../components/VideoGrid"),
  { ssr: false }
);

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
  const heroVideoUrl = 'https://mudderfuger.b-cdn.net/_trailer/mudderfuger_official_trailer.mp4'
  const [isMuted, setIsMuted] = useState(false); // Start as unmuted
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferWebm, setPreferWebm] = useState<null | boolean>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Move this line up here, before any use:
  const [userWantsToPlay, setUserWantsToPlay] = useState(false);

  // --- Only use pauseLock for manual pausing ---
  const [pauseLock, setPauseLock] = useState(false);
  const pauseLockRef = useRef(pauseLock);
  useEffect(() => { pauseLockRef.current = pauseLock }, [pauseLock]);

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        setHasInteracted(true);
        setShowControls(true);
        setUserWantsToPlay(true); // <-- Add this
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setUserWantsToPlay(false); // <-- Add this
      }
    }
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    const isFirefox = ua.toLowerCase().includes('firefox');
    setPreferWebm(isFirefox); // Only Firefox prefers WebM
  }, []);

  // When modal closes, unlock pause
  useEffect(() => {
    if (!isModalOpen) setPauseLock(false);
  }, [isModalOpen]);

  // Manual pause/play for modal/nav
  useEffect(() => {
    if (!videoRef.current) return;
    if (pauseLock || isModalOpen) {
      videoRef.current.pause();
    }
    // Do not play here! Let the observer handle play.
  }, [pauseLock, isModalOpen]);

  // IntersectionObserver: only controls play/pause if not locked
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        const visiblePx = entry.intersectionRect.height;
        const totalPx = entry.boundingClientRect.height;
        const visibleRatio = visiblePx / totalPx;

        videoRef.current.muted = isMuted;

        if (visibleRatio <= 0.10) {
          videoRef.current.pause();
        } else {
          // Only play if userWantsToPlay is true
          if (!pauseLockRef.current && !isModalOpen && hasInteracted && userWantsToPlay) {
            videoRef.current.play().catch(() => {});
          }
        }
      },
      {
        root: null,
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isMuted, isModalOpen, hasInteracted, userWantsToPlay]);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  return (
    <main className="bg-black text-white min-h-screen">
      <>
        {/* Render your main content directly, no authentication check */}
        <section
          ref={heroRef}
          className="
            w-full
            relative
            flex flex-col
            aspect-video
            h-auto
            md:aspect-video md:h-auto
            lg:h-screen lg:max-h-[100dvh] lg:aspect-auto
          "
        >
          {preferWebm !== null && (
            <picture id="hero-picture" className="pointer-events-none">
              <video
                ref={videoRef}
                loop
                playsInline
                controls={showControls}
                poster="/mudderfuger_official_trailer_poster.jpg"
                className="
                  absolute
                  w-full
                  h-max
                  object-cover
                  aspect-video
                  md:aspect-video
                  lg:aspect-auto
                  lg:h-[94vh]
                  pointer-events-auto
                "
                id="hero-video"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    // Do NOT auto-play here
                    // videoRef.current.play().catch(() => {});
                  }
                }}
                onVolumeChange={() => {
                  if (videoRef.current) {
                    setIsMuted(videoRef.current.muted);
                  }
                }}
              >
                {preferWebm ? (
                  <source
                    src={heroVideoUrl.replace('.mp4', '.webm')}
                    type="video/webm"
                  />
                ) : null}
                <source
                  src={heroVideoUrl}
                  type="video/mp4"
                />
              </video>
            </picture>
          )}

          <div className="relative flex flex-col items-center h-full pt-0 pointer-events-none">
            <h1 className="font-arial font-extrabold uppercase tracking-tighter text-clamped max-h-30 pointer-events-auto">
              <span className="text-[#0fff00] opacity-95 text-clamped">Mudderfuger</span>
            </h1>
            <div className="pointer-events-auto">
              <Navbar
                onNavClick={undefined}
                onContactClick={() => {
                  setPauseLock(true);
                  setIsModalOpen(true);
                }}
              />
            </div>
            <ContactModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setPauseLock(false);
              }}
            />
            <button
              onClick={toggleMute}
              className="hidden absolute right-2 top-3.5 z-20 cursor-pointer ... pointer-events-auto"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              ) : (
                <SpeakerWaveIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              )}
            </button>
            <button
              onClick={togglePlay}
              className="
              absolute right-2 top-3.5 z-20 cursor-pointer ... pointer-events-auto
              md:absolute 
              md:right-auto
              md:left-1/2 
              md:top-32 
              md:z-20 
              md:-translate-x-1/2 
              md:cursor-pointer 
              md:pointer-events-auto 
              md:bg-black/60 
              md:rounded-full 
              md:p-1"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? (
                <PauseIcon className="h-7 w-7 text-white" />
              ) : (
                <PlayIcon className="h-7 w-7 text-white" />
              )}
            </button>
          </div>
          <div ref={sentinelRef} className="absolute bottom-0 h-[100px] w-full pointer-events-none z-10" />
          <ScrollingBannerVids />
        </section>

        <section className="pb-10 pt-4 md:pt-0 overflow-x-hidden" id="story-section">
          <h2 className="text-center uppercase text-clamped-small mt-5 md:mt-7 mb-0 text-[#FF13F0] transition-all px-5 mx-auto rounded-sm  max-w-[900px] tracking-wide leading-13 sm:leading-18 md:leading-20 lg:leading-24 font-arial font-bold scale-150 sm:scale-100 md:scale-110 lg:scale-100">
            Story
          </h2>
          <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto mt-3 mb-5"><span className="italic">Mudderfuger</span> is a neon-soaked, breakneck coming-of-age story about a 19-year-old skater from Los Angeles who sells donuts by day while chasing his viral dream by night. As his music and skate clips explode online, so do the temptations, parties, and trouble he can&lsquo;t always skate away from.</p>
          <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto my-5">With a mom who always has his back and a boss who feels like family, he stays grounded—until he learns the cop who&lsquo;s been harassing him is the same man who killed his father.</p>
          <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto my-5">Set against the sprawl of Southern California—where skate-punk swagger collides with bedroom-pop tenderness and a shadowy noir undercurrent—<span className="italic">Mudderfuger</span> is about skating as survival, revenge as fuel, and finding yourself while grinding the razor&lsquo;s edge between freedom and self-destruction… with a grin and a missing tooth to prove it.</p>
          <VideoGrid isMuted={isMuted} videos={videos} />
          <div className="pb-0 pt-4 md:pt-0 overflow-x-hidden">
            <h2 className="text-center uppercase text-clamped-small mt-5 md:mt-7 mb-0 text-[#FF5C00] transition-all  px-5  py-1.5 mx-auto rounded-sm  max-w-[900px] tracking-widest sm:leading-18 md:leading-20 lg:leading-24 font-arial font-bold scale-150 sm:scale-100 md:scale-110 lg:scale-100
            ">Marque Cox</h2>
            <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto mt-3 mb-5"><strong>Marque Cox (aka ShrimpDaddy)</strong> is a Los Angeles–based director, editor, and creative force whose work fuses sharp entertainment marketing instincts with the language of meme culture and visual storytelling.</p> 
            <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto my-5">From shaping iconic trailers and campaigns for Netflix (<span className="italic">Orange is the New Black</span>, <span className="italic">GLOW</span>, <span className="italic">Lost in Space</span>) to directing viral content for HBO (<span className="italic">Justice League</span>, <span className="italic">Fresh Prince</span>, <span className="italic">Friends Reunion</span>), his projects consistently resonate with online audiences.</p> 
            <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto my-5">Handpicked by Will Smith&lsquo;s Westbrook to craft high-impact memes, Marque&lsquo;s content has generated millions of likes—thanks to his unique ability to balance promotional strategy with pure internet chaos. He&lsquo;s brought that same energy to brands he believes in, creating standout campaigns for Red Bull, Hulu, and more.</p> 
            <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto my-5">Rooted in LA&lsquo;s skate scene and sharpened through collaborations with director Alma Har&lsquo;el and the promo teams at Netflix, HBO, and Fox, Marque has developed a style that is both authentic and culture-forward.</p> 
            <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto my-5">Now emerging as a leading voice in AI animation and character creation, he continues to push boundaries with bold new work—most recently, his project <span className="italic">Mudderfuger</span>.</p> 
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-[21/2] mx-auto mt-11 md:mt-13 lg:mt-15 mb-0 py-2">
              <Image src="/jellywolf.png" alt="Jellywolf logo" fill className="object-contain"/>
            </div>
            <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto mt-3 mb-5 pt-3 md:pt-7 lg:pt-7.5">Jellywolf is the boutique studio led by director Alma Har&lsquo;el, celebrated for redefining the language of advertising with bold, emotional storytelling. Alma has brought her visionary touch to campaigns for Airbnb, Facebook, Chanel, P&G, and TIME Magazine, crafting work that blurs the line between art and commerce.</p>
            <p className="font-arial px-7 sm:px-10 md:px-9 lg:px-20 xl:px-52 max-w-[1530px] mx-auto my-5">Her career spans acclaimed films like <span className="italic">Bombay Beach</span> and <span className="italic">Honey Boy</span>, groundbreaking collaborations in music and live-streaming such as Sigur Rós&lsquo; <span className="italic">Fjögur Píanó</span> and Bob Dylan&lsquo;s <span className="italic">Shadow Kingdom</span>, and most recently, the Apple TV+ series <span className="italic">Lady in the Lake</span> starring Natalie Portman.</p>
          </div>
        </section>
      </>
    </main>
  );
}