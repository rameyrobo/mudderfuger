export default function Navbar() {
  return (
    <div className="flex flex-wrap gap-1 mt-4 text-xl font-semibold uppercase flex-col md:flex-row md:gap-4 items-center">
            <a href="#story-section" className="font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4">MF’s Story</a>
            <a href="#be-mf" className="font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline leading-4">Be a MF</a>
            <a href="#contact" className="font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline leading-4">Contact</a>
    </div>
  );
}