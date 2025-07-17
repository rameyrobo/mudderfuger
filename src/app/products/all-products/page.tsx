export default function AllProductsPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      {/* Add Yourself */}
      <section className="mb-10 border-b pb-8">
        <h2 className="text-xl font-bold">{`Add Yourself Into an Episode`}</h2>
        <p className="mb-2">{`$100 — Submit a photo. We’ll build you (or a friend) into a real Mudderfuger scene as a skater, partygoer, cop, or background freak.`}</p>
        <ul className="mb-2 list-disc pl-5">
          <li>Custom AI version of your face</li>
          <li>Name or @handle used in the skit</li>
          <li>Tag in caption + option for a collab post - add on</li>
        </ul>
        <button
          className="snipcart-add-item bg-blue-600 text-white px-4 py-2 rounded"
          data-item-id="add-yourself"
          data-item-name="Add Yourself Into an Episode"
          data-item-price="100"
          data-item-url="/products/add-yourself"
          data-item-description="Submit a photo. We’ll build you (or a friend) into a real Mudderfuger scene as a skater, partygoer, cop, or background freak."
        >
          Buy Now
        </button>
      </section>

      {/* Submit Song / Artwork */}
      <section className="mb-10 border-b pb-8">
        <h2 className="text-xl font-bold">{`Submit a Song / Artwork`}</h2>
        <p className="mb-2">{`$150 — Submit a song or custom artwork (like a PNG, logo, or shirt design). If Mudderfuger likes your submission, he'll wear it in an episode and feature it on his merch store.`}</p>
        <ul className="mb-2 list-disc pl-5">
          <li>You'll get a shoutout as the artist</li>
          <li>Get your design included for sale on the website</li>
          <li>The shirt will be listed for a full month, so your own promo and shoutouts can help boost sales and your chances of getting paid.</li>
          <li>At least 8–10 seconds of your music in a real skit</li>
          <li>Tag in caption + option for a collab post - add on</li>
        </ul>
        <button
          className="snipcart-add-item bg-blue-600 text-white px-4 py-2 rounded"
          data-item-id="submit-song"
          data-item-name="Submit a Song / Artwork"
          data-item-price="150"
          data-item-url="/products/submit-song"
          data-item-description="Submit a song or custom artwork (like a PNG, logo, or shirt design). If Mudderfuger likes your submission, he'll wear it in an episode and feature it on his merch store."
        >
          Buy Now
        </button>
      </section>

      {/* Product Commercial */}
      <section className="mb-10">
        <h2 className="text-xl font-bold">{`PRODUCT COMMERCIAL`}</h2>
        <p className="mb-2">{`$500 — A standalone, high-quality Mudderfuger-style ad — no monthly commitment.`}</p>
        <ul className="mb-2 list-disc pl-5">
          <li>1 custom AI skit/ad  (15-40 sec)</li>
          <li>Product is clearly featured with Mudderfuger’s signature chaos and humor</li>
          <li>Vertical (9:16) and Horizontal (16:9) versions included</li>
          <li>Ready for TikTok, Reels, YouTube, or paid campaigns</li>
          <li>Creative handled by us</li>
          <li>You can submit a product, short blurb, and key message — we take it from there</li>
          <li>Repost rights included</li>
          <li>Use the video on your own channels (must tag @mudderfuger when reposting)</li>
        </ul>
        <button
          className="snipcart-add-item bg-blue-600 text-white px-4 py-2 rounded"
          data-item-id="product-commercial"
          data-item-name="PRODUCT COMMERCIAL"
          data-item-price="500"
          data-item-url="/products/product-commercial"
          data-item-description="A standalone, high-quality Mudderfuger-style ad — no monthly commitment."
          data-item-custom1-name="Share on my Stories"
          data-item-custom1-type="checkbox"
          data-item-custom1-options="false|true[+100.00]"
          data-item-custom2-name="Revisions"
          data-item-custom2-type="dropdown"
          data-item-custom2-options="0|1[+75.00]|2[+150.00]|3[+225.00]"
        >
          Buy Now
        </button>
      </section>
    </main>
  );
}