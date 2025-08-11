"use client";

import { useState, useRef } from "react";
import Navbar from "../components/Navbar";

const SITE_PASSWORD = process.env.NEXT_PUBLIC_SITE_PASSWORD || "fallbackpassword";

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const animatedTextRef = useRef<HTMLSpanElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    typeof window !== "undefined" && localStorage.getItem("siteAuthed") === "true"
  );
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
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
    );
  }

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