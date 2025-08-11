"use client";

import { useRef } from "react";
import Navbar from "../components/Navbar"

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const animatedTextRef = useRef<HTMLSpanElement>(null);

  return (
    <main className="bg-black text-white min-h-screen px-2">
      <section ref={heroRef} className="w-full min-h-screen relative overflow-y-scroll">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="font-arial text-4xl sm:text-7xl font-extrabold uppercase tracking-tighter mt-20 xl:text-8xl">
            <span ref={animatedTextRef} className="text-red-500 opacity-95">Mudderfuger</span>
          </h1>
          {/* Normal playable video under the h1 */}
          <video
            ref={videoRef}
            controls
            controlsList="nodownload"
            className="w-full max-w-3xl mt-8 rounded-smshadow-lg"
            poster="/mudderfuger_official_trailer_poster.jpg"
          >
            <source src="https://mudderfuger.b-cdn.net/_vids/mudderfuger_official_trailer.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="flex-menu flex flex-col md:flex-row">
            <Navbar />
            
          </div>
        </div>
      </section>
    </main>
  );
}