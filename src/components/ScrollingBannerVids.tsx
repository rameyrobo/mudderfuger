'use client';

import Marquee from 'react-fast-marquee';
import { useEffect, useState } from 'react';

export default function ScrollingBanner() {
  const [speed, setSpeed] = useState(200); // default to mobile speed

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setSpeed(400); // lg and up
      } else {
        setSpeed(200); // mobile/tablet
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-black h-[3vh] sm:h-[4vh] md:h-[5vh] lg:h-[6vh] mb-0 flex border-t border-b border-white relative pb-0.5 md:pb-0">
      <Marquee
        gradient={false}
        speed={speed}
        pauseOnHover={true}
        className="text-white text-2xl uppercase tracking-wider overflow-y-hidden bg-black relative"
      >
        <span
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-arial-bold tracking-wider"
          style={{ willChange: 'transform' }}
        >
          &nbsp;•&nbsp;The world&lsquo;s first AI skateboarder
          •&nbsp;I hate cops, I drink beer, I party, I skate
          •&nbsp;AI dropout with a busted tooth & a warrant
          •&nbsp;Name’s Mudderfuger&nbsp;🛹🍻
        </span>
      </Marquee>
    </div>
  );
}