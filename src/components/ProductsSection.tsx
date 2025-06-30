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
{ id: 13, url: 'https://mudderfuger.b-cdn.net/_imgs/mudderfugger-8.jpg' }
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
  const [fading, setFading] = useState(() => Array(products.length).fill(false));

  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    setImageAssignments(getNUniqueRandomImages(imgs, products.length));
  }, []);

  useEffect(() => {
    if (modalIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleModalClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalIdx]);

  const handleMouseLeave = (idx: number) => {
    setFading(f => f.map((fade, i) => i === idx ? true : fade));
    setTimeout(() => {
      // Images currently in use (except for this one)
      const used = imageAssignments.filter((_, i) => i !== idx);
      const available = imgs.map(i => i.url).filter(url => !used.includes(url));
      if (available.length) {
        const newImg = available[Math.floor(Math.random() * available.length)];
        setImageAssignments(assignments =>
          assignments.map((img, i) => i === idx ? newImg : img)
        );
      }
      setFading(f => f.map((fade, i) => i === idx ? false : fade));
    }, 320);
  };

  const handleModalClose = () => {
    setModalIdx(null);
    setModalImage(null);
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
          onClick={() => {
            setModalImage(imageAssignments[idx]);
            setModalIdx(idx);
            // Change the image assignment right away
            const used = imageAssignments.filter((_, i) => i !== idx);
            const available = imgs.map(i => i.url).filter(url => !used.includes(url));
            if (available.length) {
              const newImg = available[Math.floor(Math.random() * available.length)];
              setImageAssignments(assignments =>
                assignments.map((img, i) => i === idx ? newImg : img)
              );
            }
          }}
          onFocus={() => {
            setModalImage(imageAssignments[idx]);
            setModalIdx(idx);
            // Change the image assignment right away
            const used = imageAssignments.filter((_, i) => i !== idx);
            const available = imgs.map(i => i.url).filter(url => !used.includes(url));
            if (available.length) {
              const newImg = available[Math.floor(Math.random() * available.length)];
              setImageAssignments(assignments =>
                assignments.map((img, i) => i === idx ? newImg : img)
              );
            }
          }}
        >
          {/* Decorative BG Image */}
          {imageAssignments[idx] && (
            <Image
              src={imageAssignments[idx]}
              alt=""
              fill
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-0 ${fading[idx] ? "opacity-0" : "opacity-100"}`}
            />
          )}
          {/* Solid color overlay */}
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-80 transition-opacity z-10" />
            <div className="text-center px-4 relative z-20 max-w-[90%] group-hover:z-60">
              <h3 className="
                text-center  
                text-black  
                bg-white
                font-bold  
                uppercase
                tracking-wide  
                transition-all bg-black 
                justify-self-center
                px-1
                py-4   
                leading-6
                rounded-sm 
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
                        max-w-max
                        pl-[20px]
                        indent-[-18px]
                        lg:indent-[-24px]"
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
      {modalIdx !== null && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 transition-all lg:hidden">
        <div className="absolute inset-0" onClick={() => handleModalClose()}></div>
        <div className="relative max-w-lg w-full mx-4 bg-black text-white rounded-lg shadow-2xl p-6 z-10 flex flex-col items-center">
          <button
            onClick={() => handleModalClose()}
            className="
            absolute 
            -top-2.5 
            right-2 
            text-4xl 
            font-light 
            z-20 
            cursor-pointer 
            text-white
            scale-125"
            aria-label="Close"
          >
            ×
          </button>
          {modalImage && (
            <Image
              src={modalImage}
              alt=""
              width={600}
              height={800}
              className="w-full max-h-96 object-cover rounded mb-4"
            />
          )}
          <h2 className="text-2xl font-bold mb-2">{products[modalIdx].title}</h2>
          {products[modalIdx].description && (
            <p className="mb-2 text-base">{products[modalIdx].description}</p>
          )}
          {products[modalIdx].includes && products[modalIdx].includes.length > 0 && (
            <ul className="list-disc list-inside text-sm mb-4 text-left mx-auto max-w-[90%]">
              {products[modalIdx].includes.map((item, i) => (
                <li key={i} className="mb-2 pl-[19.8px] indent-[-21.1px]">{item}</li>
              ))}
            </ul>
          )}
          <button
            className="
              snipcart-add-item
              bg-white 
              text-black 
              px-4 
              py-2 
              rounded 
              mt-2
              cursor-pointer
            "
            data-item-id={products[modalIdx].id}
            data-item-name={products[modalIdx].title}
            data-item-price={products[modalIdx].price.toFixed(2)}
            data-item-url="/"
            data-item-description={products[modalIdx].description || ""}
          >
            Buy Now
          </button>
        </div>
      </div>
    )}
    </div>
  );
}