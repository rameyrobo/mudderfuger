import { useState, useEffect, useMemo } from 'react';
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
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: number]: string | boolean }>({});

  // Sponsor plan selection state
  const [selectedSponsorPlan, setSelectedSponsorPlan] = useState<string>("starter-sponsor");

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
  // Log all products on mount
  useEffect(() => {
    console.log("All products:", products);
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

  // Log the modal product when modalIdx changes
  useEffect(() => {
    if (modalIdx !== null) {
      console.log("Modal Product:", products[modalIdx]);
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

  // Log Snipcart cart contents when Snipcart is ready
  useEffect(() => {
  const handleSnipcartReady = () => {
    const state = Snipcart.store.getState();
    const cart = state.cart;
    console.log("🚀 Snipcart Cart Contents:", cart);
    console.log("📦 Subscriptions (if any):", cart.subscriptions || []);
    console.log("🛒 Items:", cart.items || []);
  };

  document.addEventListener('snipcart.ready', handleSnipcartReady);
  return () => {
    document.removeEventListener('snipcart.ready', handleSnipcartReady);
  };
}, []);

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

  // Find the sponsor-me product (for dynamic plan mapping)
  const sponsorMe = products.find(p => p.id === "sponsor-me");
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
                transition-all 
                bg-black 
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
                data-item-price={(product.itemPrice ?? product.price ?? 0).toFixed(2)}
                data-item-url="/"
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
    <div className="fixed top-0 left-0 w-full h-full min-h-screen z-[999] flex items-start justify-center overflow-y-scroll p-0">
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
          right-3 
          text-4xl 
          font-light 
          z-20 
          cursor-pointer 
          text-black"
          aria-label="Close"
        >
          ×
        </button>
        {product?.id !== "sponsor-me" && (
          <div className="w-full md:w-5/12 lg:w-7/12 flex justify-center">
            {modalImage && (
              <Image
                src={modalImage}
                alt=""
                width={600}
                height={800}
                className="w-full max-h-96 md:max-h-[80vh] object-contain rounded mb-4 md:mb-0"
              />
            )}
          </div>
        )}
        <div className={`flex flex-col items-start ${product?.category === 'sponsor-me' ? 'w-full' : 'w-full md:w-7/12 lg:w-5/12'}`}>
          {product?.category === "sponsor-me" ? (
            <>
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {products
                  .filter(p => p.category === "sponsor-me" && typeof p.price === "number")
                  .map((tier) => (
                  <div
                    key={tier.id}
                    className={`border border-gray-300 p-6 rounded-lg bg-white shadow transition-all ${
                      selectedSponsorPlan === tier.id
                        ? "border-black ring-2 ring-black"
                        : ""
                    }`}
                  >
                    <h2 className="text-lg font-arial-bold mb-2">{tier.title}</h2>
                    <p className="text-xl font-arial-bold mb-4">
                      {tier.id === "official-brand-partner" ? "$15k–$30k" : `$${tier.itemPrice ?? tier.price}`}{" "}
                      <span className="text-sm font-normal">
                        {tier.id === "official-brand-partner" ? "/year" : "/month"}
                      </span>
                    </p>
                    <ul className="font-arial text-sm mb-6 list-disc list-inside">
                      {tier.includes.map((item, i) => (
                        <li key={i} className="leading-8">{item}</li>
                      ))}
                    </ul>
                    {tier.id === "official-brand-partner" ? (
                      <a
                        href="mailto:collab@mudderfuger.ai"
                        className="bg-black text-white px-4 py-2 rounded font-arial-bold inline-block"
                      >
                        Inquire
                      </a>
                    ) : (
                      <button
                        id={`select-plan-${tier.id}`}
                        type="button"
                        className={`
                          font-arial-bold
                          border-2
                          ${selectedSponsorPlan === tier.id
                            ? "bg-black text-white border-black"
                            : "bg-white text-black border-gray-300 hover:border-black"}
                          px-4
                          py-2
                          rounded
                          mt-2
                          uppercase
                          cursor-pointer
                          transition-all
                        `}
                        onClick={() => setSelectedSponsorPlan(tier.id)}
                        aria-pressed={selectedSponsorPlan === tier.id}
                      >
                        {selectedSponsorPlan === tier.id ? "Selected" : "Choose Plan"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {/* Single Add to Cart Button */}
              <button
                className="snipcart-add-item snipcart-checkout font-arial-bold bg-black text-white px-6 py-3 rounded mt-6 uppercase"
                data-item-id="sponsor-me"
                data-item-name="Sponsor Me"
                data-item-url="/"
                data-item-description="Pick your sponsor level and get Mudderfuged."
                data-item-selected-plan={selectedSponsorPlan}
                data-item-price={(() => {
                  const planProduct = products.find(p => p.id === selectedSponsorPlan);
                  return (planProduct?.itemPrice ?? planProduct?.price ?? 0).toFixed(2);
                })()}
                {
                  ...(sponsorMe?.availablePlans || []).reduce((attrs, plan, i) => {
                    const idx = i + 1;
                    attrs[`data-plan${idx}-id`] = plan.id;
                    attrs[`data-plan${idx}-name`] = plan.name;
                    attrs[`data-plan${idx}-frequency`] = plan.frequency;
                    attrs[`data-plan${idx}-interval`] = String(plan.interval);
                    attrs[`data-plan${idx}-price`] = String(plan.itemPrice);
                    return attrs;
                  }, {} as Record<string, string>)
                }
              >
                Add to Cart
              </button>
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
                          <label key={index} className="flex items-center mb-2 font-arial text-base cursor-pointer max-w-32">
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
              <button
                className="
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
                "
                data-item-id={product?.id}
                data-item-name={product?.title}
                data-item-price={product?.price}
                data-item-url="/"
                data-item-max-quantity="1"
                data-item-stackable="always"
                data-item-description={product?.description || ""}
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
      </div>
    </div>
  );
}
  