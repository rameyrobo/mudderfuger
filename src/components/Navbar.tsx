export default function Navbar() {
  return (
    <div className="flex flex-wrap gap-1 mt-4 text-xl font-semibold uppercase flex-col md:flex-row md:gap-4 items-center">
            <a href="#story-section" className="text-white hover:bg-black/90 transition-all text-2xl px-5 py-1.5 rounded-sm tracking-wide hover:underline scroll-link">MF’s Story</a>
            <a href="#be-mf" className="text-white hover:bg-black/90 transition-all text-2xl px-5 py-1.5 rounded-sm tracking-wide hover:underline">Be a MF</a>
            <a href="#contact" className="text-white hover:bg-black/90 transition-all text-2xl px-5 py-1.5 rounded-sm tracking-wide hover:underline">Contact</a>
    </div>
  );
}