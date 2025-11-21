const baseUrl = "http://163.227.239.93/api/products/";

async function loadProducts() {
  const res = await fetch(baseUrl);
  const products = await res.json();
  let html = "<ul>";
  products.forEach(p => {
    html += `<li>${p.name} - ${p.price} TK</li>`;
  });
  html += "</ul>";
  document.getElementById("product-list").innerHTML = html;
}

loadProducts();
