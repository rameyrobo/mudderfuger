export default function Navbar() {
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-xl font-semibold uppercase flex-col md:flex-row items-center">
            <a href="#story-section" className="text-2xl px-5 hover:underline scroll-link">MF’s Story</a>
            <a href="#product-1" className="text-2xl px-5 hover:underline">Sponsor Me</a>
            <a href="#product-2" className="text-2xl px-5 hover:underline">Be a MF</a>
            <a href="#product-3" className="text-2xl px-5 hover:underline">Get heard</a>
            <a href="/about" className="ext-2xl px-5 hover:underline">About</a>
    </div>
  );
}