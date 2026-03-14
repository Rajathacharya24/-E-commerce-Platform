const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const products = [
  {
    id: "idli-batter",
    name: "Stoneground Idli Batter",
    category: "Breakfast",
    price: 90,
    unit: "1 kg pack",
    description: "Freshly fermented batter prepared for soft idli and crispy dosa.",
    badge: "Daily fresh",
    palette: ["#9dc4e8", "#6fa4d7", "#ecf5ff"],
  },
  {
    id: "millet-rice",
    name: "Foxtail Millet Rice",
    category: "Grains",
    price: 299,
    unit: "2 kg bag",
    description: "Light and nutritious millet rice from farms near Ramanagara.",
    badge: "Farmer direct",
    palette: ["#ddaf58", "#f0d28a", "#fff8df"],
  },
  {
    id: "filter-coffee",
    name: "Mysore Filter Coffee",
    category: "Pantry",
    price: 220,
    unit: "250 g",
    description: "Bold South Indian roast and chicory blend for rich morning coffee.",
    badge: "House favorite",
    palette: ["#5d4032", "#8e654f", "#f1e4da"],
  },
  {
    id: "avarekalu-mix",
    name: "Avarekalu Masala Mix",
    category: "Prepared",
    price: 185,
    unit: "500 g",
    description: "Ready-to-cook seasonal hyacinth beans masala with fresh spice base.",
    badge: "Weekend special",
    palette: ["#93643f", "#c28d5a", "#f6ebde"],
  },
  {
    id: "groundnut-oil",
    name: "Cold-Pressed Groundnut Oil",
    category: "Pantry",
    price: 355,
    unit: "1 L bottle",
    description: "Traditional wood-pressed oil from a family-run local mill.",
    badge: "No preservatives",
    palette: ["#d49a53", "#f1c37f", "#fff3de"],
  },
  {
    id: "banana-chips",
    name: "Kerala Banana Chips",
    category: "Snacks",
    price: 140,
    unit: "200 g",
    description: "Crisp coconut-oil fried chips with just the right amount of salt.",
    badge: "Tea-time hit",
    palette: ["#e0b63c", "#f1d37a", "#fff8dc"],
  },
  {
    id: "mango-pickle",
    name: "Homestyle Mango Pickle",
    category: "Produce",
    price: 160,
    unit: "350 g jar",
    description: "Small-batch pickle made with gingelly oil and roasted spices.",
    badge: "Limited batch",
    palette: ["#9b4f2f", "#d37c4d", "#fde7dc"],
  },
  {
    id: "masala-dosa-kit",
    name: "Masala Dosa Dinner Kit",
    category: "Prepared",
    price: 260,
    unit: "serves 3",
    description: "Includes dosa batter, potato palya, and coconut chutney base.",
    badge: "Dinner ready",
    palette: ["#8c5a34", "#d29459", "#f8ebde"],
  },
];

const productGrid = document.querySelector("#product-grid");
const filtersContainer = document.querySelector("#filters");
const searchInput = document.querySelector("#search-input");
const cartPanel = document.querySelector("#cart-panel");
const cartToggle = document.querySelector("#cart-toggle");
const cartClose = document.querySelector("#cart-close");
const cartItems = document.querySelector("#cart-items");
const subtotalValue = document.querySelector("#subtotal-value");
const deliveryValue = document.querySelector("#delivery-value");
const totalValue = document.querySelector("#total-value");
const cartCount = document.querySelector("#cart-count");
const overlay = document.querySelector("#overlay");
const checkoutForm = document.querySelector("#checkout-form");
const confirmationDialog = document.querySelector("#confirmation-dialog");
const confirmationMessage = document.querySelector("#confirmation-message");
const confirmationClose = document.querySelector("#confirmation-close");

const storageKey = "namma-bazaar-cart";
let activeCategory = "All";
let searchTerm = "";
let cart = loadCart();

function loadCart() {
  const savedCart = window.localStorage.getItem(storageKey);

  if (!savedCart) {
    return {};
  }

  try {
    return JSON.parse(savedCart);
  } catch {
    return {};
  }
}

function saveCart() {
  window.localStorage.setItem(storageKey, JSON.stringify(cart));
}

function getCategories() {
  return ["All", ...new Set(products.map((product) => product.category))];
}

function createImage(product) {
  const [dark, mid, light] = product.palette;
  const label = product.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 420" role="img" aria-label="${product.name}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${dark}" />
          <stop offset="100%" stop-color="${mid}" />
        </linearGradient>
      </defs>
      <rect width="520" height="420" rx="40" fill="${light}" />
      <circle cx="106" cy="95" r="44" fill="${mid}" opacity="0.18" />
      <circle cx="431" cy="318" r="56" fill="${dark}" opacity="0.15" />
      <rect x="65" y="72" width="390" height="270" rx="34" fill="url(#g)" />
      <rect x="110" y="120" width="300" height="174" rx="26" fill="rgba(255,255,255,0.16)" />
      <text x="260" y="225" text-anchor="middle" font-family="Georgia, serif" font-size="76" fill="white">${label}</text>
      <text x="260" y="370" text-anchor="middle" font-family="Trebuchet MS, sans-serif" font-size="26" fill="${dark}">${product.category}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function filterProducts() {
  return products.filter((product) => {
    const categoryMatch = activeCategory === "All" || product.category === activeCategory;
    const searchMatch = `${product.name} ${product.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });
}

function renderFilters() {
  filtersContainer.innerHTML = getCategories()
    .map(
      (category) => `
        <button
          class="filter-chip ${category === activeCategory ? "is-active" : ""}"
          type="button"
          data-category="${category}"
        >
          ${category}
        </button>
      `
    )
    .join("");
}

function renderProducts() {
  const visibleProducts = filterProducts();

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = '<p class="empty-state">No products match that search. Try a different term or category.</p>';
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => `
        <article class="product-card">
          <img class="product-card__image" src="${createImage(product)}" alt="${product.name}" />
          <div class="product-card__meta">
            <h3>${product.name}</h3>
            <span class="product-card__tag">${product.badge}</span>
          </div>
          <p>${product.description}</p>
          <div class="product-card__footer">
            <div class="product-card__price">
              <strong>${currencyFormatter.format(product.price)}</strong>
              <span>${product.unit}</span>
            </div>
            <button class="product-card__button" type="button" data-add-id="${product.id}">Add to cart</button>
          </div>
        </article>
      `
    )
    .join("");
}

function getCartItems() {
  return Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = products.find((item) => item.id === productId);
      return product ? { ...product, quantity } : null;
    })
    .filter(Boolean);
}

function calculateTotals() {
  const subtotal = getCartItems().reduce((runningTotal, item) => runningTotal + item.price * item.quantity, 0);
  const pickupFee = subtotal > 0 && subtotal < 1200 ? 40 : 0;

  return {
    subtotal,
    pickupFee,
    total: subtotal + pickupFee,
  };
}

function renderCart() {
  const items = getCartItems();
  const { subtotal, pickupFee, total } = calculateTotals();
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  cartCount.textContent = String(itemCount);
  subtotalValue.textContent = currencyFormatter.format(subtotal);
  deliveryValue.textContent = pickupFee === 0 && subtotal > 0 ? "Free" : currencyFormatter.format(pickupFee);
  totalValue.textContent = currencyFormatter.format(total);

  if (items.length === 0) {
    cartItems.innerHTML = '<p class="empty-state">Your cart is empty. Add a few essentials to start the order.</p>';
    return;
  }

  cartItems.innerHTML = items
    .map(
      (item) => `
        <article class="cart-item">
          <div class="cart-item__top">
            <div>
              <h3 class="cart-item__title">${item.name}</h3>
              <p class="cart-item__description">${item.unit}</p>
            </div>
            <strong>${currencyFormatter.format(item.price * item.quantity)}</strong>
          </div>
          <div class="cart-item__actions">
            <div class="cart-item__qty" aria-label="Quantity controls">
              <button class="qty-button" type="button" data-change-id="${item.id}" data-change="-1">−</button>
              <span>${item.quantity}</span>
              <button class="qty-button" type="button" data-change-id="${item.id}" data-change="1">+</button>
            </div>
            <button class="remove-button" type="button" data-remove-id="${item.id}">Remove</button>
          </div>
        </article>
      `
    )
    .join("");
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(productId, amount) {
  const nextQuantity = (cart[productId] || 0) + amount;

  if (nextQuantity <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = nextQuantity;
  }

  saveCart();
  renderCart();
}

function removeItem(productId) {
  delete cart[productId];
  saveCart();
  renderCart();
}

function openCart() {
  document.body.classList.add("cart-open");
  cartPanel.setAttribute("aria-hidden", "false");
  cartToggle.setAttribute("aria-expanded", "true");
  overlay.hidden = false;
}

function closeCart() {
  document.body.classList.remove("cart-open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartToggle.setAttribute("aria-expanded", "false");
  overlay.hidden = true;
}

function confirmOrder(formData) {
  const { total } = calculateTotals();
  confirmationMessage.textContent = `${formData.get("name")}, your order totaling ${currencyFormatter.format(total)} is scheduled for ${formData.get("slot")}. We will contact you at ${formData.get("phone")} if anything changes.`;
  confirmationDialog.showModal();
}

filtersContainer.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");

  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;
  renderFilters();
  renderProducts();
});

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value.trim();
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-id]");

  if (!button) {
    return;
  }

  addToCart(button.dataset.addId);
});

cartItems.addEventListener("click", (event) => {
  const changeButton = event.target.closest("[data-change-id]");

  if (changeButton) {
    changeQuantity(changeButton.dataset.changeId, Number(changeButton.dataset.change));
    return;
  }

  const removeButton = event.target.closest("[data-remove-id]");

  if (removeButton) {
    removeItem(removeButton.dataset.removeId);
  }
});

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (getCartItems().length === 0) {
    window.alert("Add at least one product before placing the order.");
    return;
  }

  const formData = new FormData(checkoutForm);
  confirmOrder(formData);
  checkoutForm.reset();
  cart = {};
  saveCart();
  renderCart();
  closeCart();
});

confirmationClose.addEventListener("click", () => {
  confirmationDialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("cart-open")) {
    closeCart();
  }
});

renderFilters();
renderProducts();
renderCart();
