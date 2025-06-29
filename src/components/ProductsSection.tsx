import { useState, useEffect } from 'react';
import Image from 'next/image';

const imgs = [
{ id: 1, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-1.jpg' },
{ id: 2, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-10.jpg' },
{ id: 3, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-11.jpg' },
{ id: 4, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-12.jpg' },
{ id: 5, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-14.jpg' },
{ id: 6, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-15.jpg' },
{ id: 7, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-16.jpg' },
{ id: 8, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-2.jpg' },
{ id: 9, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-3.jpg' },
{ id: 10, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-5.jpg' },
{ id: 11, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-6.jpg' },
{ id: 12, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-7.jpg' },
{ id: 13, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-8.jpg' },
{ id: 14, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-9.jpg' },
];
const products = [
    {
      id: "brand-placement",
      title: "Brand/Product Placement",
      price: 300,
      description: "Your brand or @name on a shirt, sign, wall, or background prop. Optional name drop or dialogue shoutout. Tag in caption + option for a collab post (if requested). Includes 1–3 high-res cinematic stills from the scene.",
      videoSrc: "https://mudderfuger.b-cdn.net/2_walking_to_the_park.mp4",
    },
    {
      id: "add-yourself",
      title: "Add Yourself Into an Episode",
      price: 100,
      description: "Submit a photo. We’ll build you into a Mudderfuger scene. Includes custom AI version of your face, your name or @handle in the skit, and an optional tag in caption.",
      videoSrc: "https://mudderfuger.b-cdn.net/3_skatepark.mp4",
    },
    {
      id: "submit-song",
      title: "Submit a Song",
      price: 150,
      description: "At least 8–10 seconds of your music in a real skit. Includes tag in caption + option for a collab post.",
      videoSrc: "https://mudderfuger.b-cdn.net/9_out_of_jail_selfi-hevc.mp4",
    },
    {
      id: "collab-post",
      title: "📩 Collab Post Listing",
      price: 50,
      description: "Be added as a collaborator on Instagram. Only available with a Brand, Character, or Song package.",
      videoSrc: "https://mudderfuger.b-cdn.net/4_photogrpher_walking_to_work.mp4",
    },
  ];

// Helper to get N unique random images from the pool
function getNUniqueRandomImages(imgArray, n) {
  const arr = [...imgArray];
  const chosen = [];
  while (chosen.length < n && arr.length) {
    const idx = Math.floor(Math.random() * arr.length);
    chosen.push(arr.splice(idx, 1)[0].url);
  }
  return chosen;
}

export default function ProductsSection() {
  // Initial assignment of images as empty, then assign unique images on mount
  const [imageAssignments, setImageAssignments] = useState<string[]>(() => Array(products.length).fill(""));

  useEffect(() => {
    setImageAssignments(getNUniqueRandomImages(imgs, products.length));
  }, []);

  const handleMouseLeave = (idx) => {
    // Images currently in use (except for this one)
    const used = imageAssignments.filter((_, i) => i !== idx);
    // Available images
    const available = imgs.map(i => i.url).filter(url => !used.includes(url));
    // Random new image
    if (available.length) {
      const newImg = available[Math.floor(Math.random() * available.length)];
      setImageAssignments(assignments =>
        assignments.map((img, i) => i === idx ? newImg : img)
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      {products.map((product, idx) => (
        <div
          key={product.id}
          id={product.id}
          className="group relative flex items-center justify-center h-[50vh] bg-black text-white overflow-hidden"
          onMouseLeave={() => handleMouseLeave(idx)}
        >
          {/* Decorative BG Image */}
          {imageAssignments[idx] && (
            <Image
              src={imageAssignments[idx]}
              alt=""
              fill
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 z-0"
            />
          )}
          {/* Solid color overlay, transitions on hover */}
          <div className="absolute inset-0 bg-black opacity-80 group-hover:opacity-0 transition-opacity z-10" />
          <div className="text-center px-4 relative z-20 max-w-[90%]">
            <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
            <p className="text-sm mb-4">{product.description}</p>
            <button
              className="snipcart-add-item bg-white text-black px-4 py-2 rounded"
              data-item-id={product.id}
              data-item-name={product.title}
              data-item-price={product.price.toFixed(2)}
              data-item-url="/"
              data-item-description={product.description}
            >
              Buy Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}