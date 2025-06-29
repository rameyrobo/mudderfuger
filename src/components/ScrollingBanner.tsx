'use client';

import Marquee from 'react-fast-marquee';

export default function ScrollingBanner() {
  return (
    <div className="bg-black h-[6vh] mb-0 flex border-t border-b border-white">
      <Marquee
        gradient={false}
        speed={400}
        pauseOnHover={true}
        className="text-white text-2xl uppercase tracking-wider font-anton overflow-y-hidden"
      >
        <span 
        className="text-4xl"
        >
        &nbsp;•&nbsp;The world’s first AI skateboarder
        •&nbsp;I hate cops, I drink beer, I party, I skate
        •&nbsp;AI dropout with a busted tooth & a warrant
        •&nbsp;Name’s Mudderfuger&nbsp;🛹🍻
        </span>
      </Marquee>
    </div>
  );
}