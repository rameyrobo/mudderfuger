import { useState, useEffect, useMemo, useRef } from 'react';
import ContactModal from './ContactModal';
import Image from 'next/image';
import { imgs } from '@/data/imgs';
import { products } from '@/data/products';

type UploadField = {
  name: string;
  description: string;
  type: string;
  accept: string;
  required: boolean;
  important?: string[];
  checkbox1?: { label: string; required: boolean };
  checkbox2?: { label: string; required: boolean };
};
type SnipcartCart = {
  invoiceNumber?: string;
  token?: string;
  // add more fields if you use them
};
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

function isAddYourselfUploadField(field: UploadField): field is UploadField & { important: string[] } {
  return Array.isArray(field.important);
}

declare global {
  interface Window {
    Snipcart: {
      events: {
        on: (event: string, callback: (cart: unknown) => void) => void;
        off: (event: string, callback: (cart: unknown) => void) => void;
      };
    };
  }
}

export default function ProductsSection() {
  // Initial assignment of images as empty, then assign unique images on mount
  const [imageAssignments, setImageAssignments] = useState<string[]>(() => Array(products.length).fill(""));
  const [fading, setFading] = useState(() => Array(products.length).fill(false));

  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  // State to track custom field values for the modal product
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: number]: string | boolean }>({});

  // Add state for upload form validation
  const [uploadValidation, setUploadValidation] = useState<{ [key: string]: boolean }>({});

  // Sponsor plan selection state
  const [selectedSponsorPlan] = useState<string>("starter-sponsor");
  // Contact modal state
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  // Upload files state
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({});

  // Dynamically update the sponsor-me button price for Snipcart
  // This effect ensures the data-item-price attribute and dataset.itemPrice are always correct for the selected plan.
  useEffect(() => {
    const sponsorButton = document.querySelector<HTMLButtonElement>('.snipcart-add-item[data-item-id="sponsor-me"]');
    const selectedPlan = products.find(p => p.id === selectedSponsorPlan);
    if (sponsorButton && selectedPlan) {
      const price = selectedPlan.itemPrice ?? selectedPlan.price ?? 0;
      sponsorButton.dataset.itemPrice = price.toFixed(2);
      (sponsorButton as unknown as { itemPrice: string }).itemPrice = price.toFixed(2);
    }
  }, [selectedSponsorPlan]);
  
  // Open modal on page load and handle back/forward navigation for /products/:id
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/products\/([^/]+)$/);
    if (match) {
      const productId = match[1];
      const idx = products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        setModalIdx(idx);
        setModalImage(getNUniqueRandomImages(imgs, products.length)[idx]);
      }
    }

    const handlePopState = () => {
      const newPath = window.location.pathname;
      const match = newPath.match(/^\/products\/([^/]+)$/);
      if (match) {
        const productId = match[1];
        const idx = products.findIndex(p => p.id === productId);
        if (idx !== -1) {
          setModalIdx(idx);
          setModalImage(getNUniqueRandomImages(imgs, products.length)[idx]);
        }
      } else {
        setModalIdx(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  // Update browser URL to reflect selected product when modal is open
  useEffect(() => {
    if (modalIdx !== null) {
      const productSlug = products[modalIdx]?.id;
      if (productSlug) {
        const newUrl = `/products/${productSlug}`;
        window.history.pushState({}, '', newUrl);
      }
    } else {
      // Reset back to root or previous section
      const isSponsorPage = window.location.pathname.startsWith('/products/');
      if (isSponsorPage) {
        window.history.pushState({}, '', '/');
      }
    }
  }, [modalIdx]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (modalIdx !== null) {
      document.body.classList.add('overflow-y-hidden');
    } else {
      document.body.classList.remove('overflow-y-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-y-hidden');
    };
  }, [modalIdx]);

  useEffect(() => {
    // Reset custom field values when modal changes
    if (modalIdx !== null) {
      const product = products[modalIdx];
      const initialValues: { [key: number]: string | boolean } = {};
      if (product.customFields) {
        product.customFields.forEach((field, index) => {
          if (field.type === 'checkbox') {
            initialValues[index] = false;
          } else if (field.type === 'dropdown') {
            const options = field.options ? field.options.split('|') : [];
            initialValues[index] = options.length > 0 ? options[0] : '';
          }
        });
      }
      setCustomFieldValues(initialValues);
    } else {
      setCustomFieldValues({});
    }
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
    }, 0);
  };

  const handleModalClose = () => {
    setModalIdx(null);
    setModalImage(null);
    setTimeout(() => {
    window.location.href = '/#be-mf';
  }, 10)
};

  const handleCustomFieldChange = (index: number, value: string | boolean) => {
    const field = product?.customFields?.[index];

    if (field?.type === 'checkbox') {
      const options = field.options?.split('|') ?? [];
      const selectedValue = value
        ? options.find(opt => opt.startsWith('true'))
        : options.find(opt => opt.startsWith('false'));
      setCustomFieldValues(prev => ({
        ...prev,
        [index]: selectedValue || '',
      }));
    } else {
      setCustomFieldValues(prev => ({
        ...prev,
        [index]: value,
      }));
    }
  };

  // Modal product and price calculation hooks
  const rawProduct = modalIdx !== null ? products[modalIdx] : null;
  const product = rawProduct?.id === "sponsor-me"
    ? products.find(p => p.category === "sponsor-me") || rawProduct
    : rawProduct;

  // Carousel slides for add-yourself
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const prevCarouselIdx = useRef(carouselIdx);
  const addYourselfSlides = useMemo(() => {
    if (product?.id !== "add-yourself" || !product.media) return [];
    return product.media.flatMap(mediaItem => {
      const base = mediaItem.src.replace(/\.mp4$/, '');
      return [
        {
          type: 'image',
          src: `${base}.webp`,
          alt: `Original image for ${mediaItem.alt}`,
        },
        {
          type: 'video',
          src: `${base}.webm`, // use webm
          alt: mediaItem.alt,
        }
      ];
    });
  }, [product]);

  const snipcartPrice = useMemo(() => {
    if (!product) return "0.00";
    return (
      (product.itemPrice ?? product.price) +
      Object.entries(customFieldValues).reduce((acc, [indexStr, val]) => {
        const index = parseInt(indexStr);
        const field = product.customFields?.[index];
        return acc + extractPrice(val, field?.options);
      }, 0)
    ).toFixed(2);
  }, [customFieldValues, product]);

  function extractPrice(value: string | boolean, label?: string): number {
    if (typeof value === 'boolean' && value && label) {
      const match = label.match(/\[\+?(-?\d+(\.\d{1,2})?)\]/);
      return match ? parseFloat(match[1]) : 0;
    }
    if (typeof value === 'string') {
      const match = value.match(/\[\+?(-?\d+(\.\d{1,2})?)\]/);
      return match ? parseFloat(match[1]) : 0;
    }
    return 0;
  }

  // Effect to update custom field values on the Buy Now button directly
  useEffect(() => {
    const buyNowButton = document.querySelector('button.snipcart-add-item');

    if (!buyNowButton || !product || !product.customFields) return;

    product.customFields.forEach((field, index) => {
      const value = customFieldValues[index];

      if (field.type === 'checkbox') {
        const isTrue = typeof value === 'string' && value.startsWith('true');
        buyNowButton.setAttribute(`data-item-custom${index + 1}-value`, isTrue ? 'true' : 'false');
      } else if (field.type === 'dropdown') {
        const stringVal = typeof value === 'string' ? value.split('[')[0] : '';
        buyNowButton.setAttribute(`data-item-custom${index + 1}-value`, stringVal);
      }
    });
  }, [customFieldValues, product]);

  // Reset uploadFiles when modal changes
  useEffect(() => {
    setUploadFiles({});
  }, [modalIdx]);

  // Helper to check if all required uploads are present
  const allUploadsFilled =
    !product?.upload?.length ||
    product.upload.every((field, idx) => {
      if (!field.required) return true;
      const fileUploaded = !!uploadFiles[`upload-${product.id}-${idx}`];
      
      // For add-yourself product, also check required checkboxes
      if (product.id === "add-yourself") {
        const checkbox1Checked = uploadValidation[`checkbox1-${product.id}-${idx}`] || false;
        const checkbox2Checked = uploadValidation[`checkbox2-${product.id}-${idx}`] || false;
        return fileUploaded && checkbox1Checked && checkbox2Checked;
      }
      
      return fileUploaded;
    });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (product?.id !== "add-yourself" || addYourselfSlides.length === 0) return;

    // If current slide is an image, auto-advance after 2 seconds
    if (addYourselfSlides[carouselIdx].type === "image") {
      const timer = setTimeout(() => {
        setCarouselIdx((idx) => (idx + 1) % addYourselfSlides.length);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // If current slide is a video, advance only after video ends
    const video = videoRef.current;
    if (addYourselfSlides[carouselIdx].type === "video" && video) {
      // Always start from the beginning
      video.currentTime = 0;
      video.play();

      const handleEnded = () => {
        setCarouselIdx((idx) => (idx + 1) % addYourselfSlides.length);
      };
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [carouselIdx, addYourselfSlides, product?.id, setCarouselIdx]);

  useEffect(() => {
    if (prevCarouselIdx.current !== carouselIdx) {
      setIsFading(true);
      const fadeTimeout = setTimeout(() => setIsFading(false), 150); // 400ms fade duration
      prevCarouselIdx.current = carouselIdx;
      return () => clearTimeout(fadeTimeout);
    }
  }, [carouselIdx]);

  /*
    const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        "x-file-name": `${Date.now()}_${file.name}`,
        "content-type": file.type,
      },
      body: file,
    });
    const data = await res.json();
    if (data.success) {
      // Success! Use data.url as needed
    } else {
      alert("Upload failed: " + data.error);
    }
  }; */

  useEffect(() => {
    // Wait for Snipcart to be available
    if (typeof window === "undefined" || !window.Snipcart) return;

    function handleCartConfirmed(cart: unknown) {
      console.log("cart.confirmed event fired", cart);

      let orderId = "unknown";
      if (cart && typeof cart === "object") {
        const c = cart as SnipcartCart;
        orderId = c.invoiceNumber ?? c.token ?? "unknown";
      }

      const file = uploadFiles[`upload-add-yourself-0`];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", `${orderId}_${file.name}`);

      fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log("Uploaded to Bunny after order:", data.url);
          } else {
            alert("Upload failed: " + data.error);
          }
        });
    }

    window.Snipcart.events.on("cart.confirmed", handleCartConfirmed);
    return () => {
      window.Snipcart.events.off("cart.confirmed", handleCartConfirmed);
    };
  }, [uploadFiles]);

  if (modalIdx === null) {
    return (
      <div className="w-full grid grid-cols-2 gap-0">
        {products
          .filter(p => p.id === "sponsor-me" || !["starter-sponsor", "monthly-main-sponsor", "official-brand-partner"].includes(p.id))
          .map((product, idx) => (
        <div
          key={product.id}
          id={product.id}
          tabIndex={0}
          className="group relative flex items-center justify-center h-[47dvh] bg-black text-white overflow-hidden outline-none"
          onMouseLeave={() => handleMouseLeave(idx)}
          onClick={() => {
            setContactModalOpen(false); // Close contact modal if open
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
            setContactModalOpen(false); // Close contact modal if open
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
              <h3 className=" font-arial-bold text-center text-black bg-white font-bold uppercase tracking-wide transition-all bg-black justify-self-center px-3.5 py-4 leading-6 rounded-sm text-base group-hover:text-lg group-hover:bg-transparent group-hover:text-white group-hover:bg-transparent group-hover:leading-6 md:group-hover:leading-10 md:group-hover:text-4xl sm:leading-8 md:text-xl md:px-4 md:leading-7 lg:text-2xl lg:px-8
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
                  font-arial
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
              </div>
              <button
                className="
                  font-arial-bold
                  uppercase
                  opacity-0 
                  group-hover:max-h-96
                  group-hover:opacity-95
                  bg-white 
                  text-black 
                  px-4 
                  py-2 
                  rounded 
                  mt-2
                  hover:invert
                  border-white
                  border-2
                  hover:text-red-700
                  hover:border-red-700
                  cursor-pointer
                  inline-block
                  snipcart-checkout"
                data-item-id={product.id}
                data-item-name={product.title}
                data-item-price={(product.itemPrice ?? product.price ?? 0).toFixed(2)}
                data-item-url={product.url}
                data-item-max-quantity="1"
                data-item-stackable="always"
                data-item-description={product.description || ""}
                {...(product.customFields?.[0] && {
                  'data-item-custom1-name': product.customFields[0].name,
                  'data-item-custom1-type': product.customFields[0].type,
                  'data-item-custom1-options': product.customFields[0].options,
                })}
                {...(product.customFields?.[1] && {
                  'data-item-custom2-name': product.customFields[1].name,
                  'data-item-custom2-type': product.customFields[1].type,
                  'data-item-custom2-options': product.customFields[1].options,
                })}
                tabIndex={-1}
              >
                See Details
              </button>
            </div>
          </div>
      ))}
      </div>
    );
  }
  // Modal render
  return (
    <div className="fixed top-0 left-0 w-full h-full min-h-screen z-[999] flex items-start justify-center overflow-y-scroll p-0 opacity-100">
      <div className="absolute top-0 left-0 w-full min-h-full bg-white/90 z-[-1]" onClick={() => handleModalClose()}></div>
      <div className="
      relative 
      w-full 
      h-full 
      mx-0 
      bg-white 
      text-black 
      rounded-lg 
      shadow-2xl 
      p-9
      pb-16
      md:px-16 
      2xl:px-64 
      z-10 
      flex 
      flex-col 
      md:flex-row 
      items-center 
      gap-8 
      overflow-y-scroll">
        <button
          onClick={() => handleModalClose()}
          className="
          font-arial-bold 
          absolute 
          top-px 
          uppercase     
          text-xl    
          font-light    
          z-20    
          cursor-pointer    
          text-black   
          bg-white 
          border-white
          border-2  
          text-center   
          opacity-100  
          mt-3 
          px-3 
          py-2 
          rounded-sm 
          hover:invert 
          hover:text-red-700 
          hover:border-red-700
          transition-all 
          left-7
          "
          aria-label="Back to Products"
        >
        <span className="back-buton-arrow relative font-extrabold text-base bottom-px top-0">⬅ </span> 
        Back
        </button>
        {/* Carousel for add-yourself */}
        {product?.id === "add-yourself" ? (
          <div className="w-full md:w-5/12 lg:w-7/12 flex flex-col items-center justify-center mt-16 lg:mt-0">
            {addYourselfSlides.length > 0 && (
              <>
                <h2 className="text-4xl font-arial-bold mb-6 text-center uppercase">
                  Be like {product.media?.[Math.floor(carouselIdx / 2)]?.name}
                </h2>
                <div className="relative w-full flex flex-col items-center">
                  <div className="w-full flex items-center justify-center">
                    {addYourselfSlides[carouselIdx].type === 'image' ? (
                      <Image
                        src={addYourselfSlides[carouselIdx].src}
                        alt={addYourselfSlides[carouselIdx].alt}
                        width={400}
                        height={500}
                        className="object-contain rounded max-h-96 md:max-h-[80dvh] mb-4 md:mb-0"
                      />
                    ) : (
                      <div
                        className={`w-full flex items-center justify-center mb-4 md:mb-0 carousel-fade${isFading ? ' fade-out' : ''}`}
                        style={{
                          aspectRatio: addYourselfSlides[carouselIdx].type === 'video' ? '4 / 5' : undefined,
                          maxWidth: 400,
                          maxHeight: '80vh',
                        }}
                      >
                        <video
                          ref={videoRef}
                          key={addYourselfSlides[carouselIdx].src}
                          controls
                          autoPlay
                          playsInline
                          preload="auto"
                          poster={addYourselfSlides[carouselIdx].src.replace('.webm', '.webp')}
                          onContextMenu={e => e.preventDefault()}
                          className="w-full h-full object-contain rounded"
                          style={{ background: "#000" }}
                        >
                          <source
                            src={addYourselfSlides[carouselIdx].src}
                            type="video/webm"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      aria-label="Previous"
                      onClick={() => setCarouselIdx((carouselIdx - 1 + addYourselfSlides.length) % addYourselfSlides.length)}
                      className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      ◀
                    </button>
                    <span className="text-sm font-arial hidden">
                      {carouselIdx + 1} / {addYourselfSlides.length}
                    </span>
                    <button
                      aria-label="Next"
                      onClick={() => setCarouselIdx((carouselIdx + 1) % addYourselfSlides.length)}
                      className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : product?.id !== "sponsor-me" && (
          <div className="w-full md:w-5/12 lg:w-7/12 flex justify-center mt-16 lg:mt-0">
            {product?.id === "product-commercial" ? (
              <video
                src="https://mudderfuger.b-cdn.net/_commercials/boom_boom_v1.webm"
                controls
                autoPlay
                loop
                className="w-full max-h-96 md:max-h-[80dvh] object-contain mb-4 md:mb-0 rounded"
                style={{ background: "#000" }}
              />
            ) : (
              modalImage && (
                <Image
                  src={modalImage}
                  alt=""
                  width={600}
                  height={800}
                  className="w-full max-h-96 md:max-h-[80dvh] object-contain mb-4 md:mb-0"
                />
              )
            )}
          </div>
        )}
        <div className={`flex flex-col items-start ${product?.category === 'sponsor-me' ? 'w-full' : 'w-full md:w-7/12 lg:w-5/12'}`}>
          {product?.category === "sponsor-me" ? (
            <>
              <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 text-left pt-[50px] md:pt-[45rem] lg:pt-9">
             {modalImage && (
              <Image
                src={modalImage}
                alt=""
                width={600}
                height={800}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-0"
              />
            )}
                {products
                  .filter(p => p.category === "sponsor-me" && typeof p.price === "number")
                  .map((tier) => (
                  <div
                    key={tier.id}
                    className={`border border-gray-300 p-6 rounded-lg bg-white shadow transition-all z-1 opacity-90 ${
                      selectedSponsorPlan === tier.id
                        ? "border-black ring-2 ring-black relative z-30"
                        : "relative z-30"
                    }`}
                  >
                    <h2 className="text-2xl uppercase font-arial-bold mb-2">{tier.title}</h2>
                    <p className="text-xl font-arial-bold mb-4">
                      {tier.id === "official-brand-partner" ? "$15k–$30k" : `$${tier.itemPrice ?? tier.price}`}{" "}
                      <span className="text-sm font-normal">
                        {tier.id === "official-brand-partner" ? "/year" : "/month"}
                      </span>
                    </p>
                    <ul className="font-arial text-sm mb-6 list-disc list-inside">
                      {tier.includes.map((item, i) => (
                        <li key={i} className="leading-8 pl-[19.8px] indent-[-21.1px]">{item}</li>
                      ))}
                    </ul>
                    {tier.id === "official-brand-partner" ? (
                      <button
                        type="button"
                        onClick={() => setContactModalOpen(true)}
                        className="font-arial-bold bg-black text-white border-2 border-white px-4 py-2 rounded uppercase hover:invert hover:text-red-700 hover:border-red-700 hover:bg-white bottom-0 mb-7 cursor-pointer transition-color ease-in-out hover:scale-105 transition-transform"
                      >
                        Contact MF
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setContactModalOpen(true)}
                        className="font-arial-bold bg-black text-white border-2 border-white px-4 py-2 rounded uppercase hover:invert hover:text-red-700 hover:border-red-700 hover:bg-white bottom-0 mb-7 cursor-pointer transition-color ease-in-out hover:scale-105 transition-transform "
                      >
                        Contact MF
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-l text-2xl font-bold mb-2 font-arial-bold uppercase max-w-xl">{product?.title}</h1>
              {(() => {
                const field1 = product?.customFields?.[0];
                // const field2 = product?.customFields?.[1]; <-- might add back in later
                const val1 = customFieldValues[0];
                const val2 = customFieldValues[1];

                const isTrue = typeof val1 === 'string' && val1.startsWith('true');
                const option1Text = isTrue ? field1?.name.replace(/\[\+\d+(\.\d{1,2})?\]/, '').trim() : '';
                let option2Text = '';
                if (typeof val2 === 'string' && !val2.startsWith('0')) {
                  const count = val2.split('[')[0];
                  const plural = count === '1' ? 'revision' : 'revisions';
                  option2Text = `${count} ${plural}`;
                }

                const parts = [];
                if (option1Text) parts.push(option1Text);
                if (option2Text) parts.push(option2Text);

                return parts.length > 0 ? (
                  <h2 className="font-arial-bold text-base text-black mb-4">
                    w/ {parts.join(' and ')}
                  </h2>
                ) : null;
              })()}
              <div className="price-data flex flex-row content-start items-center justify-around w-full">
                <p className="text-xl font-semibold font-arial mb flex-1">${snipcartPrice}</p>
                {/* Custom Fields Form */}
                {product?.customFields && product.customFields.length > 0 && (
                  <form className="w-full max-w-none text-left flex flex-row items-center content-end justify-evenly">
                    {product.customFields.map((field, index) => {
                      if (field.type === 'checkbox') {
                        const options = field.options?.split('|') ?? [];
                        const trueOption = options.find(opt => opt.startsWith('true')) || '';
                        return (
                          <label key={index} className="flex items-center mb-2 font-arial text-base cursor-pointer max-w-32 leading-[1.3]">
                            <input
                              type="checkbox"
                              checked={customFieldValues[index] === trueOption}
                              onChange={e => handleCustomFieldChange(index, e.target.checked)}
                              className="mr-2"
                            />
                            {field.name.replace(/\[\+\d+(\.\d{1,2})?\]/, '')}
                            <span className="ml-1 text-sm text-gray-600">
                              {field.name.match(/\[\+(\d+(\.\d{1,2})?)\]/)?.[0]}
                            </span>
                          </label>
                        );
                      } else if (field.type === 'dropdown') {
                        const options = field.options ? field.options.split('|') : [];
                        return (
                          <label key={index} className="block mb-2 font-arial text-base flex-1 self-auto grow-0 shrink basis-3/12 translate-y-1">
                            <span className="block mb-1">{field.name}</span>
                            <select
                              value={
                                typeof customFieldValues[index] === 'string'
                                  ? customFieldValues[index]
                                  : options.length > 0
                                    ? options[0]
                                    : ''
                              }
                              onChange={e => handleCustomFieldChange(index, e.target.value)}
                              className="w-full px-2 rounded text-black max-w-12"
                            >
                              {options.map((option, i) => {
                                const match = option.match(/^(.+?)\[\+\d+(\.\d{1,2})?\]$/);
                                const label = match ? match[1] : option;
                                return (
                                  <option key={i} value={option}>{label.trim()}</option>
                                );
                              })}
                            </select>
                          </label>
                        );
                      }
                      return null;
                    })}
                  </form>
                )}
              </div>
              {product?.description && (
                <p className="mb-4 max-w-sm text-base font-arial">{product.description}</p>
              )}
              {product?.includes && product.includes.length > 0 && (
                <ul className="list-disc list-inside text-sm mb-4 text-left ml-6 mr-auto">
                  {product.includes.map((item, i) => (
                    <li key={i} className="font-arial mb-2 pl-[19.8px] indent-[-21.1px]">{item}</li>
                  ))}
                </ul>
              )}
              {product?.upload && product.upload.length > 0 && (
  <form className="mb-4 w-full max-w-xs flex flex-col gap-3">
    {(product.upload as UploadField[]).map((field, idx) => (
      <div key={idx} className="flex flex-col font-arial text-base">
        <label className="flex flex-col">
          <span className="mb-1">
            {field.name}
            {field.required && <span className="text-red-500">*</span>}
          </span>
          <input
            type={field.type}
            accept={field.accept}
            required={field.required}
            className="border rounded px-2 py-1"
            name={`upload-${product.id}-${idx}`}
            onChange={e => {
              const file = e.target.files?.[0] || null;
              setUploadFiles(prev => ({
                ...prev,
                [`upload-${product.id}-${idx}`]: file,
              }));
            }}
          />
          {field.description && (
            <span className="text-xs text-gray-600 mt-1">{field.description}</span>
          )}
        </label>

        {/* Important disclaimer for add-yourself product */}
        {product.id === "add-yourself" && isAddYourselfUploadField(field) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-arial-bold text-sm text-yellow-800 mb-2">IMPORTANT:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              {field.important.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-yellow-600 mr-2 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required checkboxes for add-yourself product */}
        {product.id === "add-yourself" && field.checkbox1 && (
          <label className="flex items-start mt-3 cursor-pointer">
            <input
              type="checkbox"
              required={field.checkbox1.required}
              className="mr-2 mt-1 flex-shrink-0"
              checked={uploadValidation[`checkbox1-${product.id}-${idx}`] || false}
              onChange={e => {
                setUploadValidation(prev => ({
                  ...prev,
                  [`checkbox1-${product.id}-${idx}`]: e.target.checked,
                }));
              }}
            />
            <span className="text-sm leading-tight">
              {field.checkbox1.label}
              {field.checkbox1.required && <span className="text-red-500">*</span>}
            </span>
          </label>
        )}

        {product.id === "add-yourself" && field.checkbox2 && (
          <label className="flex items-start mt-2 cursor-pointer">
            <input
              type="checkbox"
              required={field.checkbox2.required}
              className="mr-2 mt-1 flex-shrink-0"
              checked={uploadValidation[`checkbox2-${product.id}-${idx}`] || false}
              onChange={e => {
                setUploadValidation(prev => ({
                  ...prev,
                  [`checkbox2-${product.id}-${idx}`]: e.target.checked,
                }));
              }}
            />
            <span className="text-sm leading-tight">
              {field.checkbox2.label}
              {field.checkbox2.required && <span className="text-red-500">*</span>}
            </span>
          </label>
        )}
      </div>
    ))}
  </form>
)}
              <button
                className={`
                  font-arial-bold
                  snipcart-add-item
                  bg-white 
                  border-2
                  text-black 
                  px-4 
                  py-2 
                  rounded
                  mt-2
                  uppercase
                  cursor-pointer
                  snipcart-checkout
                  hover:invert
                  hover:text-red-700 
                  hover:scale-105
                  transition-all
                  ${!allUploadsFilled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                `}
                data-item-id={product?.id}
                data-item-name={product?.title}
                data-item-price={product?.price}
                data-item-url={product?.url}
                data-item-max-quantity="1"
                data-item-stackable="always"
                data-item-description={product?.description || ""}
                disabled={!allUploadsFilled}
                {
                  ...((product?.customFields || []).reduce((acc, field, i) => {
                    acc[`data-item-custom${i + 1}-name`] = field.name;
                    acc[`data-item-custom${i + 1}-type`] = field.type;
                    if (field.options) acc[`data-item-custom${i + 1}-options`] = field.options;
                    const val = customFieldValues[i];
                    if (typeof val === 'boolean') {
                      acc[`data-item-custom${i + 1}-value`] = val ? 'true' : 'false';
                    } else if (typeof val === 'string') {
                      const stripped = val.split('[')[0]; // remove price annotation
                      acc[`data-item-custom${i + 1}-value`] = stripped;
                    }
                    return acc;
                  }, {} as Record<string, string>))
                }
              >
                Add to Cart
              </button>
            </>
          )}
        </div>
        {/* Contact Modal for sponsor-me plans */}
        <ContactModal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} />
      </div>
    </div>
  );
}