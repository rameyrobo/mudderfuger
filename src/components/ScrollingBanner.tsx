'use client';

import Marquee from 'react-fast-marquee';

export default function ScrollingBanner() {
  return (
    <div className="bg-black py-2 mb-32 border-t border-b border-white">
      <Marquee
        gradient={false}
        speed={400}
        pauseOnHover={true}
        className="text-white text-2xl uppercase tracking-wider font-anton"
      >
        <span 
        className="text-5xl"
        > •&nbsp;Yo I'm mudderfuger--I'm 19. I've been skating since June 16, 2025. I've got no sponsers yet and I hate mudda fuckin' cops&nbsp;•&nbsp;<a href="#product-1" className="hover:underline">Sponsor Me</a>&nbsp;•&nbsp;<a href="#product-2" className="hover:underline">Be a MF</a>&nbsp;•&nbsp;<a href="#product-3" className="hover:underline">Get heard</a>&nbsp;•&nbsp;<a href="/about" className="hover:underline">About</a>&nbsp;
        </span>
      </Marquee>
    </div>
  );
}