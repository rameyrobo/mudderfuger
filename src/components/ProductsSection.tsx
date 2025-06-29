import { useState, useEffect } from 'react';
import Image from 'next/image';

const imgs = [
{ id: 1, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-9.jpg' },
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
,
];
const products = [
    {
      id: "brand-placement",
      title: "Brand/Product Placement",
      price: 300,
      description: null,
      includes: [
        "Your brand or @name on a shirt, sign, wall, or background prop",
        "Optional name drop or dialogue shoutout",
        "Tag in caption + option for a collab post (if requested) - add on",
        "1–3 high-res cinematic stills from the scene"
      ]
    },
    {
      id: "add-yourself",
      title: "Add Yourself Into an Episode",
      price: 100,
      description: "Submit a photo. We’ll build you (or a friend) into a real Mudderfuger scene as a skater, partygoer, cop, or background freak.",
      includes: [
        "Custom AI version of your face",
        "Name or @handle used in the skit",
        "Tag in caption + option for a collab post - add on"
      ]
    },
    {
      id: "submit-song",
      title: "Submit a Song",
      price: 150,
      description: null,
      includes: [
        "At least 8–10 seconds of your music in a real skit",
        "Tag in caption + option for a collab post - add on"
      ]
    },
    {
      id: "collab-post",
      title: "📩 Collab Post Listing",
      price: 50,
      description: "Be added as a collaborator on the Instagram  (shows up on your page too). Only available with a Brand, Character, or Song package.",
      includes: null
    },
  ];

// Helper to get N unique random images from the pool
function getNUniqueRandomImages(
  imgArray: { id: number; url: string }[],
  n: number
): string[] {
  const arr = [...imgArray];
  const chosen: string[] = [];
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

  const handleMouseLeave = (idx: number) => {
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
    <div className="w-full grid grid-cols-2 gap-0">
      {products.map((product, idx) => (
        <div
          key={product.id}
          id={product.id}
          tabIndex={0}
          className="group relative flex items-center justify-center h-[47vh] bg-black text-white overflow-hidden outline-none"
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
          {/* Solid color overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-90 group-focus-within:opacity-90 transition-opacity z-10" />
            <div className="text-center px-4 relative z-20 max-w-[90%] group-hover:z-60 group-focus-within:z-60">
              <h3 className="
                text-l
                text-center  
                text-black  
                bg-white
                font-bold  
                uppercase
                tracking-wide  
                transition-all bg-black 
                justify-self-center
                px-0.5  
                py-4   
                leading-6 
                text-xl
                lg:text-2xl
                lg:px-8
                group-hover:bg-transparent
                group-focus:bg-transparent
                group-focus-within:bg-transparent  
                group-hover:text-white
                group-focus:text-white
                group-focus-within:text-white  
                sm:group-hover:text-3xl
                sm:group-focus:text-3xl 
                sm:group-focus-within:text-3xl   
                sm:leading-8
                md:px-4
                md:leading-9
                md:group-hover:text-4xl
                md:group-focus:text-4xl
                md:group-focus-within:text-4xl 
                group-hover:bg-transparent  
                ">
                  {product.title}
              </h3>
              <div
                className="
                  max-h-0 
                  overflow-hidden 
                  opacity-0 
                  group-hover:max-h-96 
                  group-hover:opacity-100 
                  group-focus-within:max-h-96 
                  group-focus-within:opacity-100 
                  transition-all 
                  duration-500 
                  ease-in-out
                  flex 
                  flex-col 
                  items-center
                "
              >
                {product.description && (
                  <p className="
                  text-sm 
                  lg:text-base 
                  text-left 
                  bg-black/100 
                  mb-2 
                  max-w-sm
                  ">
                  {product.description}
                  </p>
                )}
                {product.includes && product.includes.length > 0 && (
                  <ul className="list-disc list-inside text-sm mb-4 text-left mx-auto max-w-[90%]">
                    {product.includes.map((item, i) => (
                      <li 
                        className="
                        text-xs
                        lg:text-base 
                        mb-1 
                        max-w-max"
                        key={i}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className="
                  snipcart-add-item
                  opacity-0 
                  group-hover:max-h-96 
                  group-hover:opacity-95 
                  group-focus-within:max-h-96 
                  group-focus-within:opacity-95
                  bg-white 
                  text-black 
                  px-4 
                  py-2 
                  rounded 
                  mt-2
                  cursor-pointer"
                data-item-id={product.id}
                data-item-name={product.title}
                data-item-price={product.price.toFixed(2)}
                data-item-url="/"
                data-item-description={product.description || ""}
                tabIndex={-1}
              >
                Buy Now
              </button>
            </div>
          </div>
      ))}
    </div>
  );
}