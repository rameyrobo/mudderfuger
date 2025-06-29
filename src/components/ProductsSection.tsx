

export default function ProductsSection() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
      {products.map((product) => (
        <div
          key={product.id}
          id={product.id}
          className="group relative flex items-center justify-center h-[50vh] bg-black text-white overflow-hidden"
          onMouseEnter={(e) => {
            const video = e.currentTarget.querySelector("video");
            if (video) video.play();
          }}
          onMouseLeave={(e) => {
            const video = e.currentTarget.querySelector("video");
            if (video) video.pause();
          }}
        >
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-500 z-0"
            muted
            loop
            playsInline
          >
            <source
              src={product.videoSrc.replace(/\.mp4$/, ".webm")}
              type="video/webm"
            />
            <source
              src={product.videoSrc}
              type="video/mp4"
            />
          </video>
          <div className="text-center px-4 relative z-10 max-w-[90%]">
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
