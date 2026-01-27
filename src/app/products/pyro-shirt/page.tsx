export default function PyroShirtPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Pyro Flame Shirt 🔥</h1>
      <p className="mb-6">This shirt is fire! Available in sizes S, M, L, XL, 2XL</p>
      
      <div className="mb-6">
        <img 
          src="https://mudderfuger.b-cdn.net/_imgs/pyro-shirt.webp" 
          alt="Pyro Flame Shirt" 
          className="w-full rounded-lg"
        />
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold mb-2">$25.99</p>
        <p className="text-xs text-gray-500 mb-4">
          EU representative: HONSON VENTURES LIMITED, gpsr@honsonventures.com, 3, Gnaftis House flat 102, Limassol, Mesa Geitonia, 4003, CY
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Product information: Gildan 64000, 2 year warranty in EU and Northern Ireland as per Directive 1999/44/EC. 
          Warnings, Hazard: For adults, Made in Bangladesh. 
          Care instructions: Machine wash: cold (max 30C or 90F), with similar colors, Do not bleach, Tumble dry: low heat, Iron, steam or dry: low heat, Do not dryclean
        </p>
      </div>

      <button
        className="snipcart-add-item bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        data-item-id="pyro-shirt"
        data-item-name="Pyro Flame Shirt"
        data-item-price="25.99"
        data-item-url="/products/pyro-shirt"
        data-item-description="This shirt is fire!🔥"
        data-item-image="https://mudderfuger.b-cdn.net/_imgs/pyro-shirt.webp"
        data-item-custom1-name="Color"
        data-item-custom1-type="dropdown"
        data-item-custom1-options="White"
        data-item-custom2-name="Size"
        data-item-custom2-type="dropdown"
        data-item-custom2-options="Small|Medium|Large|Extra Large|2XL"
        data-item-custom2-required="true"
      >
        Add to Cart
      </button>
    </main>
  );
}
