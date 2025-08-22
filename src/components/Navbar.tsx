export default function Navbar({
  onNavClick,
  onContactClick,
}: {
  onNavClick?: () => void;
  onContactClick?: () => void;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-1 mt-0.5 text-xl font-semibold uppercase flex-col md:flex-row md:gap-40 items-center">
        <a
          href="#story-section"
          onClick={onNavClick}
          className="hidden lg:inline font-arial-bold text-white focus:bg-black/90 focus-within:bg-black/90 hover:bg-black/90 transition-all text-xl px-5 py-1.5 rounded-sm tracking-wide focus:underline focus-within:underline hover:underline scroll-link leading-4"
        >
          MF’s Story
        </a>
        <button
          onClick={onContactClick}
          className="
          top-10
          right-1
          absolute 
          font-arial-bold 
          uppercase 
          text-white 
          focus:bg-black/90 
          focus-within:bg-black/90 
          hover:bg-black/90 
          transition-all 
          text-xl 
          p-1  
          rounded-sm 
          tracking-wide 
          focus:underline 
          focus-within:underline 
          hover:underline 
          leading-4 
          cursor-pointer 
          flex 
          items-center
          lg:inline
          lg:static 
          lg:px-5 
          lg:py-1.5
          "
        >
          {/* Mail icon for < lg, text for lg+ */}
          <span className="inline-block lg:hidden" aria-label="Contact">
            {/* Simple mail SVG icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 sm:h-7 sm:w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M3 7l9 6 9-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </span>
          <span className="hidden lg:inline">Contact</span>
        </button>
      </div>
    </>
  );
}