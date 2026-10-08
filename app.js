const products = [
  { id: "aura-mini", name: "Parlante Aura Mini", category: "Audio", tag: "MÁS ELEGIDO", price: 34990, description: "Sonido claro y compacto para llevar a todas partes.", code: "MST-A01" },
  { id: "link-hub", name: "Hub Link 6 en 1", category: "Conectividad", tag: "NUEVO", price: 42990, description: "Más conexiones, menos enredos en tu escritorio.", code: "MST-C06" },
  { id: "pulse-charge", name: "Cargador Pulse 30W", category: "Accesorios", tag: "ESENCIAL", price: 24990, description: "Carga rápida y eficiente en un formato pequeño.", code: "MST-P30" },
  { id: "nova-buds", name: "Audífonos Nova TWS", category: "Audio", tag: "NUEVO", price: 39990, description: "Audífonos inalámbricos cómodos para música y llamadas.", code: "MST-A02" },
  { id: "wave-mic", name: "Micrófono Wave USB", category: "Audio", tag: "PARA CREAR", price: 59990, description: "Voz nítida para reuniones, clases y grabaciones.", code: "MST-A03" },
  { id: "link-adapter", name: "Adaptador Link USB-C", category: "Conectividad", tag: "ESENCIAL", price: 14990, description: "Conecta tus dispositivos con un adaptador compacto.", code: "MST-C07" },
  { id: "cable-flex", name: "Cable Flex USB-C", category: "Conectividad", tag: "RESISTENTE", price: 9990, description: "Cable reforzado para carga y transferencia diaria.", code: "MST-C08" },
  { id: "vector-mouse", name: "Mouse Vector Silent", category: "Accesorios", tag: "SILENCIOSO", price: 18990, description: "Control preciso y clic silencioso para tu escritorio.", code: "MST-P31" },
  { id: "orbit-keyboard", name: "Teclado Orbit Compact", category: "Accesorios", tag: "COMPACTO", price: 32990, description: "Teclado compacto para trabajar con más espacio.", code: "MST-P32" },
  { id: "vision-webcam", name: "Webcam Vision HD", category: "Conectividad", tag: "PARA REUNIONES", price: 44990, description: "Imagen clara para videollamadas desde casa u oficina.", code: "MST-C09" },
  { id: "powerbank-go", name: "Batería Go 10.000 mAh", category: "Accesorios", tag: "PARA LLEVAR", price: 27990, description: "Energía adicional para tus dispositivos en movimiento.", code: "MST-P33" },
  { id: "stand-fold", name: "Soporte Fold Ajustable", category: "Accesorios", tag: "ERGONÓMICO", price: 16990, description: "Eleva tu teléfono o tablet para usarlo cómodamente.", code: "MST-P34" }
];
const formatCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const ivaRate = 0.19;
const freeShippingThreshold = 60000;
const cartStorageKey = "mst-cart-v1";
const profileStorageKey = "mst-profile-v1";
const themeStorageKey = "mst-theme-v1";
let cart = loadCart();
const productGrid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const cartOverlay = document.querySelector("#cart-overlay");
const productDetail = document.querySelector("#product-detail");
const checkoutForm = document.querySelector("#checkout-form");
const searchForm = document.querySelector("#site-search");
const searchInput = document.querySelector("#site-search-input");
const searchSuggestions = document.querySelector("#search-suggestions");
const themeToggle = document.querySelector("#theme-toggle");
let activeCategory = "Todos";
let selectedProductId = null;

function applyTheme(theme) {
  const activeTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = activeTheme;
  if (themeToggle) {
    const isDark = activeTheme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", `Activar tema ${isDark ? "claro" : "oscuro"}`);
    document.querySelector("#theme-label").textContent = isDark ? "Claro" : "Oscuro";
    document.querySelector(".theme-icon").textContent = isDark ? "☼" : "◐";
  }
}
let savedTheme = "light";
try {
  savedTheme = localStorage.getItem(themeStorageKey) || "light";
} catch {
  savedTheme = "light";
}
applyTheme(savedTheme);

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
    return Array.isArray(savedCart) ? savedCart.filter((item) => products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}
function restoreProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(profileStorageKey) || "null");
    if (!profile || typeof profile !== "object") return;
    document.querySelectorAll("[data-profile-field]").forEach((field) => {
      if (field.name === "region" || field.name === "city") return;
      if (typeof profile[field.name] === "string") field.value = profile[field.name];
    });
    const savedRegion = normalizeSearch(profile.region || "");
    const region = (window.MST_REGIONS || []).find((entry) => {
      const normalizedName = normalizeSearch(entry.name);
      return normalizedName === savedRegion || (savedRegion && normalizedName.includes(savedRegion));
    });
    if (region) {
      const regionSelect = document.querySelector("#customer-region");
      const communeSelect = document.querySelector("#customer-city");
      regionSelect.value = region.name;
      regionSelect.dispatchEvent(new Event("change"));
      const savedCommune = normalizeSearch(profile.city || "");
      const commune = region.communes.find((name) => normalizeSearch(name) === savedCommune);
      if (commune) communeSelect.value = commune;
    }
    document.querySelector("#clear-profile").hidden = false;
    document.querySelector("#profile-feedback").textContent = "Tus datos guardados están listos para usar.";
  } catch {
    document.querySelector("#profile-feedback").textContent = "No fue posible cargar los datos guardados en este navegador.";
  }
}
function initializeAddressSelectors() {
  const regionSelect = document.querySelector("#customer-region");
  const communeSelect = document.querySelector("#customer-city");
  const regions = window.MST_REGIONS || [];
  if (!regionSelect || !communeSelect) return;
  regions.forEach((region) => regionSelect.add(new Option(region.name, region.name)));
  regionSelect.addEventListener("change", () => {
    const selectedRegion = regions.find((region) => region.name === regionSelect.value);
    communeSelect.replaceChildren(new Option(selectedRegion ? "Selecciona una comuna" : "Selecciona primero una región", ""));
    communeSelect.disabled = !selectedRegion;
    if (selectedRegion) {
      selectedRegion.communes.forEach((commune) => communeSelect.add(new Option(commune, commune)));
    }
  });
}
function saveCart() { localStorage.setItem(cartStorageKey, JSON.stringify(cart)); }
function normalizeSearch(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-CL").trim();
}
function findProducts(query) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];
  return products.filter((product) => normalizeSearch(`${product.name} ${product.category} ${product.tag} ${product.description}`).includes(normalizedQuery));
}
function renderProducts(query = "") {
  const normalizedQuery = normalizeSearch(query);
  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "Todos" || product.category === activeCategory;
    const matchesQuery = !normalizedQuery || normalizeSearch(`${product.name} ${product.category} ${product.tag} ${product.description}`).includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  productGrid.innerHTML = filteredProducts.map((product) => `
    <article class="product-card">
      <button class="product-image product-open" type="button" data-view="${product.id}" aria-label="Ver detalles de ${product.name}">
        <span class="product-tag">${product.tag}</span><span class="product-placeholder" aria-hidden="true">IMAGEN<br>POR AGREGAR</span><span class="product-code">${product.code}</span>
      </button>
      <div class="product-details"><p class="product-category">${product.category}</p>
        <div class="product-name-row"><button class="product-title product-open" type="button" data-view="${product.id}">${product.name}</button><span class="product-price">${formatCLP.format(product.price)}<small>NETO</small></span></div>
        <p class="product-description">${product.description}</p>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Agregar ${product.name} al carrito"><span>Agregar al carrito</span></button>
      </div>
    </article>`).join("");
  const productCount = document.querySelector("#product-count");
  const catalogEmpty = document.querySelector("#catalog-empty");
  if (productCount) productCount.textContent = `${filteredProducts.length} PRODUCTOS`;
  if (catalogEmpty) catalogEmpty.hidden = filteredProducts.length > 0;
}
function closeSearchSuggestions() {
  if (!searchSuggestions || !searchInput) return;
  searchSuggestions.hidden = true;
  searchInput.setAttribute("aria-expanded", "false");
}
function renderSearchSuggestions(query) {
  if (!searchSuggestions || !searchInput) return [];
  const matches = findProducts(query).slice(0, 6);
  if (!query.trim()) {
    closeSearchSuggestions();
    return matches;
  }
  searchSuggestions.innerHTML = matches.length
    ? matches.map((product) => `<button class="search-suggestion" type="button" role="option" data-search-product="${product.id}"><span>${product.name}</span><span class="search-suggestion-price">${formatCLP.format(product.price)} neto</span></button>`).join("")
    : `<div class="search-no-results">No encontramos productos con ese nombre.</div>`;
  searchSuggestions.hidden = false;
  searchInput.setAttribute("aria-expanded", "true");
  return matches;
}
function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + products.find((product) => product.id === item.id).price * item.quantity, 0);
  const iva = Math.round(subtotal * ivaRate);
  const finalTotal = subtotal + iva;
  document.querySelector("#cart-count").textContent = count;
  document.querySelector("#drawer-count").textContent = `(${count})`;
  document.querySelector("#cart-subtotal").textContent = formatCLP.format(subtotal);
  document.querySelector("#cart-iva").textContent = formatCLP.format(iva);
  document.querySelector("#cart-total").textContent = formatCLP.format(finalTotal);
  document.querySelector("#cart-empty").hidden = count > 0;
  document.querySelector("#drawer-footer").hidden = count === 0;
  const shippingProgress = document.querySelector("#shipping-progress");
  if (shippingProgress) {
    const remaining = Math.max(0, freeShippingThreshold - finalTotal);
    const hasFreeShipping = remaining === 0;
    shippingProgress.hidden = count === 0;
    document.querySelector("#shipping-progress-message").textContent = hasFreeShipping
      ? "¡Tu pedido tiene envío gratis!"
      : `Te faltan ${formatCLP.format(remaining)} para el envío gratis`;
    const progressBar = document.querySelector("#shipping-progress-bar");
    progressBar.setAttribute("aria-valuenow", String(Math.min(finalTotal, freeShippingThreshold)));
    document.querySelector("#shipping-progress-fill").style.width = `${Math.min(100, finalTotal / freeShippingThreshold * 100)}%`;
    document.querySelector("#cart-shipping-note").textContent = hasFreeShipping
      ? "Envío gratis aplicado"
      : `Envío gratis desde ${formatCLP.format(freeShippingThreshold)} con IVA`;
  }
  document.querySelector("#cart-items").innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `<article class="cart-item"><div class="cart-item-image" aria-hidden="true">IMAGEN<br>PENDIENTE</div>
    <div><h3 class="cart-item-name">${product.name}</h3><span class="cart-item-price">Neto: ${formatCLP.format(product.price)}</span>
        <div class="quantity-control" aria-label="Cantidad de ${product.name}"><button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Quitar una unidad de ${product.name}">−</button><span>${item.quantity}</span><button type="button" data-quantity="${product.id}" data-change="1" aria-label="Agregar una unidad de ${product.name}">＋</button></div>
      </div><button class="remove-item" type="button" data-remove="${product.id}" aria-label="Quitar ${product.name}">Quitar</button></article>`;
  }).join("");
  const checkoutItems = document.querySelector("#checkout-items");
  if (checkoutItems) {
    checkoutItems.innerHTML = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.id);
      return `<article class="order-line"><div><h3>${product.name}</h3><span>${item.quantity} × ${formatCLP.format(product.price)} neto</span></div><strong>${formatCLP.format(product.price * item.quantity)}</strong></article>`;
    }).join("");
    document.querySelector("#checkout-empty").hidden = cart.length > 0;
    document.querySelector("#checkout-subtotal").textContent = formatCLP.format(subtotal);
    document.querySelector("#checkout-iva").textContent = formatCLP.format(iva);
    document.querySelector("#checkout-total").textContent = formatCLP.format(finalTotal);
    document.querySelector("#checkout-shipping").textContent = finalTotal >= freeShippingThreshold
      ? "Envío gratis aplicado a este pedido."
      : `Envío gratis desde ${formatCLP.format(freeShippingThreshold)} con IVA; el resto se coordina al habilitar los despachos.`;
  }
}
function addToCart(productId, openDrawer = true) {
  const item = cart.find((entry) => entry.id === productId);
  if (item) item.quantity += 1;
  else cart.push({ id: productId, quantity: 1 });
  saveCart();
  renderCart();
  if (openDrawer) setCartOpen(true);
}
function openProductDetail(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) return;
  window.location.href = `producto.html?id=${encodeURIComponent(product.id)}`;
}
function renderProductDetail() {
  if (!productDetail) return;
  selectedProductId = new URLSearchParams(window.location.search).get("id");
  const product = products.find((entry) => entry.id === selectedProductId);
  if (!product) {
    document.querySelector("#product-not-found").hidden = false;
    return;
  }
  productDetail.hidden = false;
  document.title = `${product.name} | MST — Mister Technology Society`;
  document.querySelector("#product-breadcrumb").textContent = product.name;
  document.querySelector("#product-category").textContent = `${product.category} / ${product.tag}`;
  document.querySelector("#product-name").textContent = product.name;
  document.querySelector("#product-code").textContent = product.code;
  document.querySelector("#product-description").textContent = product.description;
  document.querySelector("#product-price").textContent = formatCLP.format(product.price);
  document.querySelector("#product-price-note").textContent = "Precio neto · IVA (19%) se suma en el carrito";
  document.querySelector("#product-image").setAttribute("aria-label", `Espacio reservado para imagen de ${product.name}`);
}
function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("is-open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  cartOverlay.hidden = !isOpen;
  document.body.classList.toggle("cart-open", isOpen);
  if (isOpen) document.querySelector("#close-cart").focus();
}
if (productGrid) {
  const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
  if (searchInput) searchInput.value = initialQuery;
  renderProducts(initialQuery);
  document.querySelector("#product-filters").addEventListener("click", (event) => {
    const filterButton = event.target.closest("[data-filter]");
    if (!filterButton) return;
    activeCategory = filterButton.dataset.filter;
    document.querySelectorAll("#product-filters [data-filter]").forEach((button) => {
      const isActive = button === filterButton;
      button.classList.toggle("category-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderProducts(searchInput ? searchInput.value : initialQuery);
  });
  productGrid.addEventListener("click", (event) => {
    const detailButton = event.target.closest("[data-view]");
    if (detailButton) {
      openProductDetail(detailButton.dataset.view);
      return;
    }
    const button = event.target.closest("[data-add]");
    if (!button) return;
    addToCart(button.dataset.add);
  });
}
if (searchForm && searchInput && searchSuggestions) {
  searchInput.addEventListener("input", () => {
    renderSearchSuggestions(searchInput.value);
    if (productGrid) renderProducts(searchInput.value);
  });
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    closeSearchSuggestions();
    window.location.href = `productos.html?q=${encodeURIComponent(query)}`;
  });
  searchSuggestions.addEventListener("click", (event) => {
    const suggestion = event.target.closest("[data-search-product]");
    if (suggestion) window.location.href = `producto.html?id=${encodeURIComponent(suggestion.dataset.searchProduct)}`;
  });
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSearchSuggestions();
  });
  document.addEventListener("click", (event) => {
    if (!searchForm.contains(event.target)) closeSearchSuggestions();
  });
}
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      return;
    }
  });
}
if (productDetail) {
  document.querySelector("#product-add").addEventListener("click", () => {
    if (selectedProductId) addToCart(selectedProductId);
  });
  document.querySelector("#product-buy").addEventListener("click", () => {
    if (!selectedProductId) return;
    addToCart(selectedProductId, false);
    window.location.href = "pago.html";
  });
}
document.querySelector("#cart-items").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) {
    const item = cart.find((entry) => entry.id === quantityButton.dataset.quantity);
    item.quantity += Number(quantityButton.dataset.change);
    if (item.quantity <= 0) cart = cart.filter((entry) => entry !== item);
  }
  if (removeButton) cart = cart.filter((entry) => entry.id !== removeButton.dataset.remove);
  saveCart(); renderCart();
});
document.querySelector("#open-cart").addEventListener("click", () => setCartOpen(true));
document.querySelector("#close-cart").addEventListener("click", () => setCartOpen(false));
cartOverlay.addEventListener("click", () => setCartOpen(false));
document.querySelector("#browse-products").addEventListener("click", () => setCartOpen(false));
document.querySelector("#checkout-link").addEventListener("click", () => setCartOpen(false));
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) setCartOpen(false); });
if (checkoutForm) {
  initializeAddressSelectors();
  const paymentMethod = document.querySelector("#payment-method");
  paymentMethod.addEventListener("change", () => {
    document.querySelector("#bank-transfer-note").hidden = paymentMethod.value !== "transferencia";
  });
  document.querySelector("#save-profile").addEventListener("click", () => {
    const fields = [...document.querySelectorAll("[data-profile-field]")];
    const invalidField = fields.find((field) => !field.checkValidity());
    if (invalidField) {
      invalidField.reportValidity();
      return;
    }
    const profile = Object.fromEntries(fields.map((field) => [field.name, field.value.trim()]));
    try {
      localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      document.querySelector("#clear-profile").hidden = false;
      document.querySelector("#profile-feedback").textContent = "Tus datos de contacto y entrega quedaron guardados en este dispositivo.";
    } catch {
      document.querySelector("#profile-feedback").textContent = "No fue posible guardar los datos en este navegador.";
    }
  });
  document.querySelector("#clear-profile").addEventListener("click", () => {
    try {
      localStorage.removeItem(profileStorageKey);
      document.querySelectorAll("[data-profile-field]").forEach((field) => { field.value = ""; });
      document.querySelector("#customer-region").dispatchEvent(new Event("change"));
      document.querySelector("#clear-profile").hidden = true;
      document.querySelector("#profile-feedback").textContent = "Se eliminaron los datos guardados en este dispositivo.";
    } catch {
      document.querySelector("#profile-feedback").textContent = "No fue posible eliminar los datos guardados.";
    }
  });
  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const feedback = document.querySelector("#form-feedback");
    if (cart.length === 0) { feedback.textContent = "Agrega al menos un producto antes de continuar."; return; }
    if (!checkoutForm.reportValidity()) return;
    feedback.textContent = "Pedido de demostración listo. No se realizó ningún cobro.";
  });
  restoreProfile();
}
renderProductDetail();
renderCart();
