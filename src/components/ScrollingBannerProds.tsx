'use client';

import Marquee from 'react-fast-marquee';

export default function ScrollingBanner() {
  return (
    <div className="bg-black h-[6dvh] mb-0 flex border-t border-b border-white">
      <Marquee
        gradient={false}
        speed={400}
        pauseOnHover={true}
        className="text-white text-2xl uppercase tracking-wider overflow-y-hidden"
      >
        <span 
        className="text-4xl font-arial-bold tracking-widest"
        >
        Yo! You wanna get in on this? You can be like me and be ai too! That&lsquo;d be sick. You don&lsquo;t even have to like think or anything&nbsp;&nbsp;<span>¯\_(ツ)_/¯</span>&nbsp;&nbsp;</span>
      </Marquee>
    </div>
  );
}