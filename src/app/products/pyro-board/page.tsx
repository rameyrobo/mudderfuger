export default function PyroBoardPage() {
  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Pyro Flame Skateboard 🔥</h1>
      <p className="mb-6">This skateboard is fire! Available in 8&quot;, 8.25&quot;, and 8.5&quot;</p>
      
      <div className="mb-6">
        <img 
          src="https://mudderfuger.b-cdn.net/_imgs/pyro-board.webp" 
          alt="Pyro Flame Skateboard" 
          className="w-full rounded-lg"
        />
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold mb-2">$80</p>
        <ul className="list-disc pl-5 mb-6">
          <li>Expected to ship in 4-6 weeks</li>
          <li>Secure your Pyro Flame Skateboard today MF</li>
        </ul>
      </div>

      <button
        className="snipcart-add-item bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        data-item-id="pyro-board"
        data-item-name="Pyro Flame Skateboard"
        data-item-price="80"
        data-item-url="/products/pyro-board"
        data-item-description="This skateboard is fire🔥"
        data-item-image="https://mudderfuger.b-cdn.net/_imgs/pyro-board.webp"
        data-item-custom1-name="Color"
        data-item-custom1-type="dropdown"
        data-item-custom1-options="Yellow"
        data-item-custom2-name="Size"
        data-item-custom2-type="dropdown"
        data-item-custom2-options="8 inch|8.25 inch|8.5 inch"
        data-item-custom2-required="true"
      >
        Add to Cart
      </button>
    </main>
  );
}
