const baseUrl = "http://127.0.0.1:8000/api/products/";

async function loadProducts() {
  const res = await fetch(baseUrl);
  const products = await res.json();

  const grid =
    `<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">` +
    products
      .map(
        (p) => `
        <div class="bg-white rounded-xl shadow p-3 flex flex-col gap-2">
          <div class="text-sm sm:text-base font-semibold leading-snug line-clamp-2">${p.name}</div>
          <div class="text-xs sm:text-sm text-gray-600">${p.price} TK</div>
          <button
            class="mt-auto w-full py-2 rounded-lg bg-black text-white text-sm active:scale-[0.99]"
            type="button"
            data-id="${p.id}"
          >
            Add
          </button>
        </div>
      `
      )
      .join("") +
    `</div>`;

  document.getElementById("product-list").innerHTML = grid;
}

loadProducts();
