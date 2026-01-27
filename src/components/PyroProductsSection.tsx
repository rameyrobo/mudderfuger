'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ScrollingBannerProds from './ScrollingBannerProds';
import { products } from '@/data/products';

export default function PyroProductsSection() {
  const pyroBoard = products.find(p => p.id === 'pyro-board')!;
  const pyroShirt = products.find(p => p.id === 'pyro-shirt')!;

  const [boardImageIndex, setBoardImageIndex] = useState(0);
  const [shirtImageIndex, setShirtImageIndex] = useState(0);
  const [boardSize, setBoardSize] = useState('8');
  const [shirtSize, setShirtSize] = useState('S');
  const [boardBottom, setBoardBottom] = useState('20');
  const [shirtBottom, setShirtBottom] = useState('20');
  const [boardDescExpanded, setBoardDescExpanded] = useState(false);
  const [shirtDescExpanded, setShirtDescExpanded] = useState(false);
  const [boardDescTall, setBoardDescTall] = useState(false);
  const [shirtDescTall, setShirtDescTall] = useState(false);

  const boardBoxRef = useRef<HTMLDivElement>(null);
  const shirtBoxRef = useRef<HTMLDivElement>(null);
  const boardDescRef = useRef<HTMLDivElement>(null);
  const shirtDescRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic bottom positioning on mobile
  useEffect(() => {
    const calculateBottom = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 992) {
        // Fixed bottom spacing on mobile
        setBoardBottom('0.875rem'); // 14px / 16 = 0.875rem ≈ 13.5px
        setShirtBottom('0.875rem');
      } else {
        // Reset to auto on desktop (Tailwind lg:bottom-8 will apply)
        setBoardBottom('auto');
        setShirtBottom('auto');
      }
    };

    calculateBottom();
    window.addEventListener('resize', calculateBottom);
    return () => window.removeEventListener('resize', calculateBottom);
  }, []);

  // Check if descriptions are tall enough to need truncation
  useEffect(() => {
    const checkDescriptionHeights = () => {
      setTimeout(() => {
        if (boardDescRef.current) {
          const height = boardDescRef.current.scrollHeight;
          console.log('Board desc height:', height);
          setBoardDescTall(height > 100);
        }
        if (shirtDescRef.current) {
          const height = shirtDescRef.current.scrollHeight;
          console.log('Shirt desc height:', height);
          setShirtDescTall(height > 100);
        }
      }, 100);
    };

    checkDescriptionHeights();
    window.addEventListener('resize', checkDescriptionHeights);
    return () => window.removeEventListener('resize', checkDescriptionHeights);
  }, [pyroBoard.description, pyroShirt.description]);

  // Auto-rotate images with staggered timing
  useEffect(() => {
    // Board rotates immediately and every 5 seconds (0, 5, 10, 15, 20, 25...)
    const boardInterval = setInterval(() => {
      setBoardImageIndex((prev) => (prev + 1) % pyroBoard.images!.length);
    }, 5000);

    // Shirt rotates with 5.65 second delay, then every 5 seconds (5.65, 10.65, 15.65, 20.65...)
    const shirtTimeout = setTimeout(() => {
      setShirtImageIndex((prev) => (prev + 1) % pyroShirt.images!.length);
      
      const shirtInterval = setInterval(() => {
        setShirtImageIndex((prev) => (prev + 1) % pyroShirt.images!.length);
      }, 5000);

      return () => clearInterval(shirtInterval);
    }, 5650);

    return () => {
      clearInterval(boardInterval);
      clearTimeout(shirtTimeout);
    };
  }, [pyroBoard.images, pyroShirt.images]);

  return (
    <section id="pyro-board" className="p-0 bg-black text-white flex flex-col items-center justify-center h-full min-h-[100dvh] overflow-x-hidden relative">
      <ScrollingBannerProds 
        text="Yo mudderfugers, I just got sponsored! I&apos;m riding for 🔥🔥 Pyro Skateshop🔥🔥 and you can cop their new deck or shirt here. "
      />
      
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-0 flex-1">
        {/* Pyro Skateboard */}
        <div className="relative h-[100dvh] md:h-auto">
          {/* Background Image */}
          <div className="absolute inset-0 flex items-start lg:block">
            <div className="relative w-full h-[60%] lg:h-full">
              <Image
                src={pyroBoard.images![boardImageIndex]}
                alt={pyroBoard.title}
                fill
                className="object-contain lg:object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Product Info Box - Bottom Right Corner */}
          <div 
            ref={boardBoxRef}
            className="absolute bottom-0 left-0 right-0 lg:bottom-20 xl:bottom-8 lg:right-8 lg:left-auto w-full lg:w-auto max-w-full lg:max-w-xs bg-black/50 lg:backdrop-blur-sm p-6"
            style={{ bottom: typeof window !== 'undefined' && window.innerWidth < 992 ? boardBottom : undefined }}
          >
            {/* Thumbnail Carousel - Mobile Only */}
            <div className="flex gap-2 mb-4 justify-center lg:hidden">
              {pyroBoard.images!.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setBoardImageIndex(idx)}
                  className={`relative w-12 h-12 rounded border-2 transition-all cursor-pointer ${
                    idx === boardImageIndex ? 'border-red-500' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${pyroBoard.title} ${idx + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-arial-bold text-xl uppercase">
                {pyroBoard.title}
              </h3>
              <p className="text-xl lg:text-2xl font-bold text-red-500">
                ${pyroBoard.price}
              </p>
            </div>
            <div className="relative mb-4">
              <div 
                ref={boardDescRef}
                className={`font-arial text-xs text-gray-300 space-y-2 pl-3 pr-3 ${boardDescTall && !boardDescExpanded ? 'max-h-[50px] md:max-h-[50px] overflow-hidden' : ''}`}
              >
                {pyroBoard.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              {boardDescTall && (
                <button
                  onClick={() => setBoardDescExpanded(!boardDescExpanded)}
                  className={`hidden md:block relative text-xs text-red-500 hover:text-red-400 mt-1 font-arial-bold ${boardDescExpanded ? 'bg-gradient-to-b' : 'bg-gradient-to-t'} from-transparent via-9% to-black/10 pt-4 -mt-4 w-full text-left pl-3 pb-3 cursor-pointer`}
                >
                  {boardDescExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="font-arial text-xs text-gray-300 mb-2 block">Size</label>
              <select
                value={boardSize}
                onChange={(e) => setBoardSize(e.target.value)}
                className="w-full bg-black/80 text-white border border-white/30 rounded px-3 py-2 text-sm font-arial focus:outline-none focus:border-red-500"
              >
                <option value="8">8&quot;</option>
                <option value="8.25">8.25&quot;</option>
                <option value="8.5">8.5&quot;</option>
              </select>
            </div>

            <button
              className="snipcart-add-item font-arial-bold uppercase bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors duration-300 text-sm w-full cursor-pointer"
              data-item-id={pyroBoard.id}
              data-item-name={pyroBoard.title}
              data-item-price={pyroBoard.price}
              data-item-url={pyroBoard.url}
              data-item-description={pyroBoard.description}
              data-item-image={pyroBoard.image}
              data-item-custom1-name="Size"
              data-item-custom1-value={boardSize}
            >
              Pre-Order
            </button>
          </div>

          {/* Thumbnail Carousel - Desktop Only */}
          <div className="hidden lg:flex absolute bottom-8 left-8 gap-2">
            {pyroBoard.images!.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setBoardImageIndex(idx)}
                className={`relative w-12 h-12 rounded border-2 transition-all cursor-pointer ${
                  idx === boardImageIndex ? 'border-red-500' : 'border-white/30 hover:border-white/60'
                }`}
              >
                <Image
                  src={img}
                  alt={`${pyroBoard.title} ${idx + 1}`}
                  fill
                  className="object-cover rounded"
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Pyro Shirt */}
        <div className="relative h-[100dvh] md:h-auto">
          {/* Background Image */}
          <div className="absolute inset-0 flex items-start lg:block">
            <div className="relative w-full h-[60%] lg:h-full">
              <Image
                src={pyroShirt.images![shirtImageIndex]}
                alt={pyroShirt.title}
                fill
                className="object-contain lg:object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          {/* Product Info Box - Bottom Right Corner */}
          <div 
            ref={shirtBoxRef}
            className="absolute bottom-0 left-0 right-0 lg:bottom-20 xl:bottom-8 lg:right-8 lg:left-auto w-full lg:w-auto max-w-full lg:max-w-xs bg-black/50 lg:backdrop-blur-sm p-6"
            style={{ bottom: typeof window !== 'undefined' && window.innerWidth < 992 ? shirtBottom : undefined }}
          >
            {/* Thumbnail Carousel - Mobile Only */}
            <div className="flex gap-2 mb-4 justify-center lg:hidden">
              {pyroShirt.images!.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setShirtImageIndex(idx)}
                  className={`relative w-12 h-12 rounded border-2 transition-all cursor-pointer ${
                    idx === shirtImageIndex ? 'border-red-500' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${pyroShirt.title} ${idx + 1}`}
                    fill
                    className="object-cover rounded"
                    sizes="48px"
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-arial-bold text-xl uppercase">
                {pyroShirt.title}
              </h3>
              <p className="text-xl lg:text-2xl font-bold text-red-500">
                ${pyroShirt.price}
              </p>
            </div>
            <div className="relative mb-4">
              <div 
                ref={shirtDescRef}
                className={`font-arial text-xs text-gray-300 space-y-2 pl-3 pr-3 ${shirtDescTall && !shirtDescExpanded ? 'max-h-auto md:max-h-[50px] overflow-hidden' : ''}`}
              >
                {pyroShirt.description.split('\n\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              {shirtDescTall && (
                <button
                  onClick={() => setShirtDescExpanded(!shirtDescExpanded)}
                  className={`hidden md:block relative text-xs text-red-500 hover:text-red-400 mt-1 font-arial-bold ${shirtDescExpanded ? 'bg-gradient-to-b' : 'bg-gradient-to-t'} from-transparent via-9% to-black/10 pt-4 -mt-4 w-full text-left pl-3 pb-3 cursor-pointer`}
                >
                  {shirtDescExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="font-arial text-xs text-gray-300 mb-2 block">Size</label>
              <select
                value={shirtSize}
                onChange={(e) => setShirtSize(e.target.value)}
                className="w-full bg-black/80 text-white border border-white/30 rounded px-3 py-2 text-sm font-arial focus:outline-none focus:border-red-500"
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="2XL">2XL</option>
              </select>
            </div>

            <button
              className="snipcart-add-item font-arial-bold uppercase bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors duration-300 text-sm w-full cursor-pointer"
              data-item-id={pyroShirt.id}
              data-item-name={pyroShirt.title}
              data-item-price={pyroShirt.price}
              data-item-url={pyroShirt.url}
              data-item-description={pyroShirt.description}
              data-item-image={pyroShirt.image}
              data-item-custom1-name="Size"
              data-item-custom1-value={shirtSize}
            >
              Add to Cart
            </button>
          </div>

          {/* Thumbnail Carousel - Desktop Only */}
          <div className="hidden lg:flex absolute bottom-8 left-8 gap-2">
            {pyroShirt.images!.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setShirtImageIndex(idx)}
                className={`relative w-12 h-12 rounded border-2 transition-all cursor-pointer ${
                  idx === shirtImageIndex ? 'border-red-500' : 'border-white/30 hover:border-white/60'
                }`}
              >
                <Image
                  src={img}
                  alt={`${pyroShirt.title} ${idx + 1}`}
                  fill
                  className="object-cover rounded"
                  sizes="48px"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
