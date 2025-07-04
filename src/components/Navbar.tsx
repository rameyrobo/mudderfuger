import InstagramIcon from '../components/InstagramIcon';

export default function Navbar() {
  return (
    <div className="flex flex-no-wrap gap-1 mt-4 text-3xl font-semibold uppercase flex-col-reverse md:flex-row md:gap-4 items-center">
      <a href="https://www.instagram.com/mudderfuger/" className="translate-x-[-85%] translate-y-[18%] lg:translate-x-[-37%] lg:translate-y-0" target="_blank" rel="noopener noreferrer"><InstagramIcon className="w-12 h-12 text-white hover:text-pink-500 transition " /></a>
      <a href="https://www.instagram.com/reel/DKp93PVTfZQ/?hl=en" className="text-4xl font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline leading-4">Police Not Allowed</a>
    </div>
  );
}