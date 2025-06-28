"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar"
import ScrollingBanner from "../components/ScrollingBanner"
import VideoGrid from "../components/VideoGrid";

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [userToggled, setUserToggled] = useState(false);

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      setUserToggled(true);
    }
  };

  useEffect(() => {
    if (!userToggled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visiblePx = entry.intersectionRect.height;
        const totalPx = entry.boundingClientRect.height;

        const visibleRatio = visiblePx / totalPx;

        if (videoRef.current) {
          if (visibleRatio >= 0.25) {
            videoRef.current.muted = false;
            setIsMuted(false);
          } else if (visibleRatio <= 0) {
            videoRef.current.muted = true;
            setIsMuted(true);
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
  }, [userToggled]);

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
            src="https://mudderfuger.b-cdn.net/1_mudderfuger_INTRO.mp4"
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
      className="px-6 pt-0 pb-20"
      id="story-section">
        <ScrollingBanner />
        <h2 className="text-7xl font-bold mb-16 uppercase tracking-wide justify-self-center">
          MF&rsquo;s Story
        </h2>
        <VideoGrid />
      </section>

      <section id="products-section" className="px-6 py-20 bg-white text-black">
        <h2 className="text-4xl font-bold uppercase mb-10 text-center">Shop</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-black text-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Feature Your Music</h3>
            <p className="mb-4">We’ll showcase your track on our homepage.</p>
            <button
              className="snipcart-add-item bg-white text-black px-4 py-2 rounded"
              data-item-id="music-feature"
              data-item-name="Music Feature Slot"
              data-item-price="25.00"
              data-item-url="/"
              data-item-description="Feature your music for 7 days."
              data-item-custom1-name="Your SoundCloud or Spotify link"
              data-item-custom1-required="true"
            >
              Buy Now
            </button>
          </div>

          <div className="bg-black text-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">AI Voice Line</h3>
            <p className="mb-4">Add a line of dialogue to the AI character.</p>
            <button
              className="snipcart-add-item bg-white text-black px-4 py-2 rounded"
              data-item-id="voice-line"
              data-item-name="AI Voice Line Submission"
              data-item-price="15.00"
              data-item-url="/"
              data-item-description="Submit a custom voice line to be spoken by the character."
              data-item-custom1-name="Your Line of Dialogue"
              data-item-custom1-required="true"
            >
              Submit Line
            </button>
          </div>

          <div className="bg-black text-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold mb-2">T-Shirt</h3>
            <p className="mb-4">Official Mudderfuger merchandise.</p>
            <button
              className="snipcart-add-item bg-white text-black px-4 py-2 rounded"
              data-item-id="mudderfuger-shirt"
              data-item-name="Mudderfuger Shirt"
              data-item-price="35.00"
              data-item-url="/"
              data-item-description="Unisex cotton tee"
              data-item-image="/images/shirt.png"
              data-item-custom1-name="Size"
              data-item-custom1-options="S|M|L|XL"
              data-item-custom1-required="true"
            >
              Buy Shirt
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}