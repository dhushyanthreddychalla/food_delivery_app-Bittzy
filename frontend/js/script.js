// ---------- TOAST ----------
function toast(msg, type=""){
  const t = document.getElementById("toast");
  if(!t) return;
  t.className = `toast ${type}`;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.classList.remove("show"), 2200);
}

// ---------- CART BADGE ----------
function getCart(){
  try { return JSON.parse(localStorage.getItem("fd_cart") || "[]"); }
  catch { return []; }
}
function cartCount(){
  return getCart().reduce((s,i)=> s + (i.qty || 1), 0);
}
function renderCartBadge(){
  const badge = document.getElementById("cartBadge");
  if(badge) badge.textContent = cartCount();
}

// ---------- RESTAURANTS DATA ----------
const restaurantsData = [
  { id:"pizza_hub", name:"Pizza Hub", loc:"Hyderabad", rating:4.5, time:"25–30 mins", tag:"Best Seller",
    desc:"Wood-fired pizzas, garlic breads & combos.", cats:["pizza"] },

  { id:"biryani_house", name:"Biryani House", loc:"Chennai", rating:4.6, time:"30–35 mins", tag:"Top Rated",
    desc:"Dum biryani, kebabs & spicy starters.", cats:["biryani"] },

  { id:"andhra_meals", name:"Andhra Meals", loc:"Vijayawada", rating:4.4, time:"20–25 mins", tag:"Fast Delivery",
    desc:"Authentic Andhra thali, meals & curries.", cats:["andhra"] },

  { id:"burger_bay", name:"Burger Bay", loc:"Bengaluru", rating:4.3, time:"25–35 mins", tag:"Juicy",
    desc:"Loaded burgers, fries & shakes.", cats:["burgers"] },

  { id:"green_bowl", name:"Green Bowl", loc:"Pune", rating:4.2, time:"20–30 mins", tag:"Healthy",
    desc:"Salads, bowls & high-protein meals.", cats:["healthy"] },

  { id:"sweet_tooth", name:"Sweet Tooth", loc:"Mumbai", rating:4.6, time:"20–30 mins", tag:"Desserts",
    desc:"Cakes, brownies, ice creams & more.", cats:["desserts"] },

  { id:"chinese_wok", name:"Chinese Wok", loc:"Delhi", rating:4.4, time:"25–35 mins", tag:"Hot & Spicy",
    desc:"Noodles, fried rice & manchurian.", cats:["chinese"] },

  { id:"juice_junction", name:"Juice Junction", loc:"Nellore", rating:4.5, time:"15–25 mins", tag:"Fresh",
    desc:"Fresh juices, mojitos & cool drinks.", cats:["drinks"] },

  { id:"tandoori_tales", name:"Tandoori Tales", loc:"Kolkata", rating:4.3, time:"30–40 mins", tag:"Tandoor",
    desc:"Tandoori chicken, naan & gravies.", cats:["biryani","andhra"] },
];

// ---------- RENDER ----------
const grid = document.getElementById("restaurants");
const countText = document.getElementById("countText");
const searchInput = document.getElementById("searchInput");

let activeCat = "all";

function renderRestaurants(list){
  if(!grid) return;
  grid.innerHTML = "";

  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="cardTop">
        <div>
          <h3>${r.name}</h3>
          <div class="tag">${r.tag}</div>
        </div>
      </div>

      <div class="meta">
        <span>📍 ${r.loc}</span>
        <span>⭐ ${r.rating}</span>
        <span>⏱️ ${r.time}</span>
      </div>

      <p class="desc">${r.desc}</p>

      <div class="actions">
        <a class="btn primary" href="menu.html?r=${encodeURIComponent(r.id)}">View Menu</a>
        <a class="btn ghost" href="cart.html">Go to Cart</a>
      </div>
    `;
    grid.appendChild(card);
  });

  if(countText) countText.textContent = list.length;
}

function applyFilters(){
  const q = (searchInput?.value || "").trim().toLowerCase();

  const filtered = restaurantsData.filter(r => {
    const inCat = (activeCat === "all") ? true : r.cats.includes(activeCat);
    const inText =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.loc.toLowerCase().includes(q) ||
      r.desc.toLowerCase().includes(q) ||
      r.cats.join(" ").toLowerCase().includes(q);

    return inCat && inText;
  });

  renderRestaurants(filtered);
}

// ---------- EVENTS ----------
document.getElementById("searchBtn")?.addEventListener("click", applyFilters);
document.getElementById("clearBtn")?.addEventListener("click", () => {
  if(searchInput) searchInput.value = "";
  activeCat = "all";
  document.querySelectorAll(".chipBtn").forEach(b => b.classList.remove("active"));
  document.querySelector('.chipBtn[data-cat="all"]')?.classList.add("active");
  applyFilters();
});

searchInput?.addEventListener("input", applyFilters);

// ✅ MAIN FIX: chips click using event delegation
const chipsWrap = document.getElementById("chips");
chipsWrap?.addEventListener("click", (e) => {
  const btn = e.target.closest(".chipBtn");
  if(!btn) return;

  document.querySelectorAll(".chipBtn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  activeCat = btn.dataset.cat || "all";
  applyFilters();
});

// Copy coupon
document.getElementById("copyCodeBtn")?.addEventListener("click", async () => {
  try{
    await navigator.clipboard.writeText("FIRST30");
    toast("✅ Copied: FIRST30", "success");
  }catch{
    toast("Copy not supported here", "warn");
  }
});

// ---------- INIT ----------
renderUserInHeader();
renderCartBadge();
applyFilters();
