import { useState, useEffect } from 'react';
import Image from 'next/image';
import { imgs } from '@/data/imgs';
import { products } from '@/data/products';

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

  // State to track custom field values for the modal product
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: number]: any }>({});

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
      const initialValues: { [key: number]: any } = {};
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
  };

  const handleCustomFieldChange = (index: number, value: any) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [index]: value,
    }));
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
                font-arial-bold
                text-center  
                text-black  
                bg-white
                font-bold  
                uppercase
                tracking-wide  
                transition-all bg-black 
                justify-self-center
                px-3.5
                py-4   
                leading-6
                rounded-sm 
                text-base
                group-hover:text-lg
                group-hover:bg-transparent
                group-hover:text-white
                group-hover:bg-transparent
                group-hover:leading-6
                md:group-hover:leading-10
                md:group-hover:text-4xl
                sm:leading-8
                md:text-xl
                md:px-4
                md:leading-7
                lg:text-2xl
                lg:px-8
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
                  snipcart-add-item
                  opacity-0 
                  group-hover:max-h-96
                  group-hover:opacity-95
                  bg-white 
                  text-black 
                  px-4 
                  py-2 
                  rounded 
                  mt-2
                  cursor-pointer
                  inline-block
                  snipcart-checkout"
                data-item-id={product.id}
                data-item-name={product.title}
                data-item-price={product.price.toFixed(2)}
                data-item-url="/"
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
      {modalIdx !== null && (
      <div className="absolute top-0 left-0 w-full h-full min-h-screen z-[999] flex items-start justify-center overflow-y-scroll p-0">
        <div className="absolute top-0 left-0 w-full min-h-full bg-black/90 z-[-1]" onClick={() => handleModalClose()}></div>
        <div className="relative w-full h-full mx-0 bg-black text-white rounded-lg shadow-2xl p-9 px-16 lg:px-96 z-10 flex flex-col items-center overflow-y-scroll">
          <button
            onClick={() => handleModalClose()}
            className="
            font-arial-bold
            absolute 
            top-px  
            right-3 
            text-4xl 
            font-light 
            z-20 
            cursor-pointer 
            text-white"
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
              className="w-full max-h-70 object-contain rounded mb-4"
            />
          )}
          <h3 className="text-l font-bold mb-2 font-arial-bold uppercase max-w-xl">{products[modalIdx].title}</h3>
          {products[modalIdx].description && (
            <p className="mb-4 max-w-sm text-base font-arial">{products[modalIdx].description}</p>
          )}
          {products[modalIdx].includes && products[modalIdx].includes.length > 0 && (
            <ul className="list-disc list-inside text-sm mb-4 text-left mx-auto max-w-sm">
              {products[modalIdx].includes.map((item, i) => (
                <li key={i} className="font-arial mb-2 pl-[19.8px] indent-[-21.1px]">{item}</li>
              ))}
            </ul>
          )}
          {/* Render custom fields form */}
          {products[modalIdx].customFields && products[modalIdx].customFields.length > 0 && (
            <form className="mb-4 w-full max-w-sm text-left">
              {products[modalIdx].customFields.map((field, index) => {
                if (field.type === 'checkbox') {
                  return (
                    <label key={index} className="flex items-center mb-2 font-arial text-base cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customFieldValues[index]}
                        onChange={e => handleCustomFieldChange(index, e.target.checked)}
                        className="mr-2"
                      />
                      {field.name}
                    </label>
                  );
                } else if (field.type === 'dropdown') {
                  const options = field.options ? field.options.split('|') : [];
                  return (
                    <label key={index} className="block mb-4 font-arial text-base">
                      <span className="block mb-1">{field.name}</span>
                      <select
                        value={customFieldValues[index] || (options.length > 0 ? options[0] : '')}
                        onChange={e => handleCustomFieldChange(index, e.target.value)}
                        className="w-full p-2 rounded text-black"
                      >
                        {options.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                  );
                }
                return null;
              })}
            </form>
          )}
          <button
            className="
              font-arial-bold
              snipcart-add-item
              bg-white 
              text-black 
              px-4 
              py-2 
              rounded 
              mt-2
              cursor-pointer
              snipcart-checkout
            "
            data-item-id={products[modalIdx].id}
            data-item-name={products[modalIdx].title}
            data-item-price={products[modalIdx].price.toFixed(2)}
            data-item-url="/"
            data-item-description={products[modalIdx].description || ""}
            {...(products[modalIdx].customFields?.[0] && {
              'data-item-custom1-name': products[modalIdx].customFields[0].name,
              'data-item-custom1-type': products[modalIdx].customFields[0].type,
              'data-item-custom1-options': products[modalIdx].customFields[0].options,
              'data-item-custom1-value': customFieldValues[0] !== undefined ? customFieldValues[0].toString() : '',
            })}
            {...(products[modalIdx].customFields?.[1] && {
              'data-item-custom2-name': products[modalIdx].customFields[1].name,
              'data-item-custom2-type': products[modalIdx].customFields[1].type,
              'data-item-custom2-options': products[modalIdx].customFields[1].options,
              'data-item-custom2-value': customFieldValues[1] !== undefined ? customFieldValues[1].toString() : '',
            })}
          >
            Buy Now
          </button>
        </div>
      </div>
    )}
    </div>
  );
}