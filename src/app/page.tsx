"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar"
import ScrollingBannerVids from "../components/ScrollingBannerVids"
import dynamic from "next/dynamic";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import ContactModal from "../components/ContactModal";
import type { Video } from '../types/video';
import type { VideoGridProps } from "../components/VideoGrid";

const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || "fallbackpassword";

// Type the dynamic import
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("siteAuthed") === "true");
  }, []);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== SITE_PASSWORD) {
        setError("Incorrect password.");
        return;
      }
      // Log email to backend
      await fetch("/api/log-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      localStorage.setItem("siteAuthed", "true");
      setIsAuthenticated(true);
    };

  const [isMuted, setIsMuted] = useState(false);
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

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  if (!hasMounted) return null;

  return (
    <main className="bg-black text-white min-h-screen">
      {!isAuthenticated ? (
        <div key="login" className="min-h-screen flex items-center justify-center bg-black text-white">
          <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded shadow-lg space-y-4 font-arial">
            <h2 className="text-2xl font-bold mb-4 font-arial uppercase">Enter Password & Email</h2>
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="block w-full p-2 rounded bg-gray-800 text-white font-arial"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="block w-full p-2 rounded bg-gray-800 text-white font-arial"
            />
            {error && <div className="text-red-400">{error}</div>}
            <button type="submit" className="w-full bg-red-600 py-2 rounded font-arial uppercase cursor-pointer">Enter</button>
          </form>
        </div>
      ) : (
        <>
          <section ref={heroRef} className="w-full h-screen max-h-[100dvh] relative flex flex-col">
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

            <div className="relative z-10 flex flex-col items-center h-full pt-9">
              <h1 className="font-arial text-3xl md:text-7xl font-extrabold uppercase tracking-tighter xl:text-8xl">
                <span className="text-[#0fff00] opacity-95">Mudderfuger</span>
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
            {/* Place the banner absolutely at the bottom */}
            <ScrollingBannerVids />
            <div ref={sentinelRef} className="absolute bottom-0 h-[100px] w-full pointer-events-none z-10" />
          </section>

          <section 
            className="pb-0 pt-9 md:pt-10 lg:pt-11 xl:pt-12"
            id="story-section">
            <h2 className="text-2xl font-bold uppercase text-center tracking-wide justify-self-center mb-10 md:text-3xl lg:text-3xl xl:text-4xl">
              MuddaFuger&rsquo;s Story
            </h2>
            <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">Mudderfuger is a wildly paced, neon-soaked coming-of-age ride about a 19-year-old Al skater who sells donuts for a living while chasing his viral dream. As his music and skate clips blow up, so do the temptations, parties, and troubles he can&lsquo;t always skate away from.</p>
            <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">With a mom who always has his back and a boss who&lsquo;s like family, he manages to stay grounded until - he discovers the cop who&lsquo;s been harassing him is the same man who killed his father.</p>
            <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">Set in a SoCal sprawl where skate-punk swagger meets bedroom-pop heart and a shadowy noir underbelly, Mudderfuger is about skating as survival, revenge as fuel, and finding yourself while grinding the razor&lsquo;s edge between freedom and self-destruction with a grin and a missing tooth to prove it.</p>
            {isAuthenticated && (
              <VideoGrid isMuted={isMuted} videos={videos} />
            )}
            <div className="py-7">
          <h2 className="text-center text-xl sm:text-2xl md:text-4xl  font-arial-bold  text-white transition-all  px-5  py-1.5  rounded-sm  tracking-wide leading-8
          ">Marque Cox</h2>
          <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">Marque Cox aka ShrimpDaddy is a Los Angeles–based director, editor, and creative force blending sharp entertainment marketing instincts with deep roots in meme culture and visual storytelling.</p> 
          <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">From crafting iconic trailers and social campaigns for Netflix (Orange is the New Black, GLOW, Lost in Space) to directing viral content for HBO (Justice League, Fresh Prince, Friends Reunion), his work connects deeply with online audiences.</p> 
          <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">Tapped by Will Smith’s Westbrook to create high-impact memes, Marque&lsquo;s content has generated millions of likes—thanks to his rare ability to toe the line between promotion and pure internet gold. He brought that same energy to brand campaigns he believed in—directing, shooting, and editing standout social content for clients like Red Bull, Hulu, and beyond.</p> 
          <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">His approach was born from LA&lsquo;s skate scene and sharpened in his collaborations with director Alma Har&lsquo;el and the promo departments of Netflix, HBO, and Fox.</p> 
          <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">He is quickly becoming one of the leading voices in AI animation and character creation. Mudderfuger is his latest work. Let’s make some gold together.</p> 
          <h2 className="text-2xl font-arial-bold text-center tracking-wide justify-self-center my-10 md:text-3xl lg:text-3xl xl:text-4xl">Jellywolf</h2>
          <p className="font-arial px-7 md:px-9 lg:px-24 xl:px-60 max-w-[1450px] mx-auto my-5">Jellywolf is the boutique studio helmed by director Alma Har&lsquo;el. Known for reimagining the creative landscape of advertising, Alma has brought bold, emotional storytelling to campaigns for Airbnb, Facebook, Chanel, P&G, and TIME Magazine. Her work spans acclaimed films like Bombay Beach and Honey Boy, groundbreaking music and live-stream projects such as Sigur Rós&lsquo; Fjögur Píanó and Bob Dylan&lsquo;s Shadow Kingdom, and the Apple TV+ series Lady in the Lake starring Natalie Portman.</p> 
          </div>
          </section>
        </>
      )}
    </main>
  );
}