// js/menu.js (NO modules) - FULL PREMIUM (9 Restaurants Ãƒâ€” 9 Items each = 81 items)
(function () {
  const CART_KEY = "fd_cart";
  const FAV_KEY = "fd_favs";
  const SELECTED_REST_KEY = "fd_selected_rest";

  function getFavs(){
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch { return []; }
  }
  function setFavs(arr){
    localStorage.setItem(FAV_KEY, JSON.stringify(arr));
  }
  function toggleFav(id){
    let favs = getFavs();
    if(favs.includes(id)){
      favs = favs.filter(x => x !== id);
      toast("Removed from Favorites 🤍");
    } else {
      favs.push(id);
      toast("Added to Favorites ❤️");
    }
    setFavs(favs);
    render();
  }

  // ---------- helpers ----------
  function qs(id){ return document.getElementById(id); }
  function money(n){ return "₹" + Number(n).toFixed(0); }

  function getCart(){
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function setCart(arr){
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
  }
  function cartCount(){
    return getCart().reduce((a,x)=> a + (Number(x.qty)||0), 0);
  }
  function updateBadge() {
    const total = String(cartCount());
    
    // Desktop badge
    const b = qs("cartCount");
    if (b) {
      b.textContent = total;
      b.classList.remove("animate-bounce");
      void b.offsetWidth;
      b.classList.add("animate-bounce");
      b.style.display = cartCount() > 0 ? "inline-block" : "none";
    }

    // Mobile badge
    const mob = qs("navCartCountMobile");
    if (mob) {
      mob.textContent = total;
      mob.style.display = cartCount() > 0 ? "inline-block" : "none";
    }
  }

  // ---------- toast ----------
  const toastEl = qs("toast");
  function toast(t){
    if(!toastEl) return;
    toastEl.textContent = t;
    toastEl.classList.add("show");
    clearTimeout(window.__menu_t);
    window.__menu_t = setTimeout(()=>toastEl.classList.remove("show"), 1200);
  }

  // ---------- restaurants (same ids as home.js) ----------
  const restaurants = DATA.restaurants;

  // ---------- URL rest id ----------
  const url = new URL(window.location.href);
  let restId = url.searchParams.get("rest") || url.searchParams.get("restaurant") || null;

  // ---------- show restaurant name/address ----------
  function fillRest(){
    // prefer URL id
    const r = restId ? restaurants.find(x => x.id === restId) : null;

    if (r) {
      updateRichHeader(r.id);
    } else {
      const rn = qs("restName");
      const ra = qs("restAddr");
      if(rn) rn.textContent = "✨ Explore All Dishes";
      if(ra) ra.textContent = "📍 Top items from all restaurants in Nellore";
    }
  }
  fillRest();

  // ---------- ITEMS (81) ----------
  // fields: id, restId, name, cat, veg("veg"/"nonveg"), price, rating, eta, img
  const items = DATA.items;

  // ---------- state ----------
  const grid = qs("itemsGrid");
  const searchBox = document.getElementById("searchMenu");
  const chips = document.querySelectorAll(".chip");
  const vegBtn = qs("vegBtn");
  const nonVegBtn = qs("nonVegBtn");
  const clearBtn = qs("clearBtn");
  const favFilterBtn = qs("favFilterBtn");
  const sortMenu = qs("sortMenu");
  const themeToggle = qs("themeToggle");

  const state = {
    q: "",
    cat: url.searchParams.get("cat") || "all",
    veg: "all", // all | veg | nonveg
    favsOnly: false,
    sort: "default",
    loading: true
  };

  // Simulate premium loading
  setTimeout(() => {
    state.loading = false;
    render();
  }, 1000);

  function stars(r){
    const n = Math.max(1, Math.min(5, Math.round(r)));
    return "⭐".repeat(n);
  }

  function safeImg(url, alt){
    return `
      <img
        src="${url}"
        alt="${alt}"
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';"
      />
    `;
  }

  function highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  function card(it){
    const badgeVeg = it.veg === "veg" ? "🟢 Veg" : "🔴 Non-Veg";
    const r = restaurants.find(x => x.id === it.restId);
    const restName = r ? r.name : "Unknown";
    const restAddr = r ? (r.area || r.addr) : "Unknown";
    const isFav = getFavs().includes(it.id);
    
    // Highlight matching name if searching
    const displayName = highlight(it.name, state.q);

    return `
      <div class="mcard" data-id="${it.id}">
        <div class="mimg">
          ${safeImg(it.img, it.name)}
          <button class="favBtn" data-fav="${it.id}">
            ${isFav ? '❤️' : '🤍'}
          </button>
          <div class="mbadges">
            <span class="mbadge">${badgeVeg}</span>
            <span class="mbadge">${stars(it.rating)} ${it.rating.toFixed(1)}</span>
            ${it.dietary ? it.dietary.map(d => {
              if(d === 'vegan') return `<span class="mbadge mini-badge" title="Vegan">🌱</span>`;
              if(d === 'nut-free') return `<span class="mbadge mini-badge" title="Nut-Free">🥜</span>`;
              if(d === 'gluten-free') return `<span class="mbadge mini-badge" title="Gluten-Free">🌾</span>`;
              return '';
            }).join('') : ''}
          </div>
        </div>

        <div class="mbody">
          <div class="mname">${displayName}</div>
          <div style="font-size:12px; color:var(--muted); margin-top:6px; font-weight:800; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; gap:6px; align-items:start;">
              <span>🏠</span> <span style="line-height:1.2">${restName}</span>
            </div>
            <div style="display:flex; gap:6px; align-items:start;">
              <span>📍</span> <span style="line-height:1.2">${restAddr}</span>
            </div>
          </div>

          <div class="mmeta">
            <span class="mpill">${money(it.price)}</span>
            <span class="mpill">⏱️ ${it.eta}</span>
            <span class="mpill">🏷️ ${String(it.cat).toUpperCase()}</span>
          </div>

          <button class="madd" data-add="${it.id}">Add +</button>
        </div>
      </div>
    `;
  }

  function applyFilters(list){
    let out = list.slice();

    // restaurant filter (ONLY if a restaurant is viewed)
    if (restId) {
      out = out.filter(x => x.restId === restId);
    }

    // category
    if(state.cat !== "all"){
      if(state.cat === "veg"){
        out = out.filter(x => x.veg === "veg");
      } else {
        out = out.filter(x => x.cat === state.cat);
      }
    }

    // veg/nonveg button filter
    if(state.veg !== "all"){
      out = out.filter(x => x.veg === state.veg);
    }

    // favs filter
    if(state.favsOnly){
      const favs = getFavs();
      out = out.filter(x => favs.includes(x.id));
    }

    // search
    if(state.q){
      const q = state.q.toLowerCase();
      out = out.filter(x =>
        x.name.toLowerCase().includes(q) ||
        x.cat.toLowerCase().includes(q) ||
        x.veg.toLowerCase().includes(q)
      );
    }

    // sort
    if(state.sort === "price_low"){
      out.sort((a,b) => a.price - b.price);
    } else if(state.sort === "price_high"){
      out.sort((a,b) => b.price - a.price);
    } else if(state.sort === "rating"){
      out.sort((a,b) => b.rating - a.rating);
    } else if(state.sort === "time"){
      // e.g. "15-25 min" -> parse 15
      const getMin = (eta) => Number(eta.split("-")[0].replace(/\D/g, '')) || 99;
      out.sort((a,b) => getMin(a.eta) - getMin(b.eta));
    }

    return out;
  }

  function render(){
    if(!grid) return;
    grid.innerHTML = "";

    // Skeleton check
    if (state.loading) {
      for (let i = 0; i < 4; i++) {
        const skel = document.createElement("div");
        skel.className = "mcard";
        skel.innerHTML = `
          <div class="mimg skeleton" style="height:200px; border-radius:24px 24px 0 0;"></div>
          <div class="mbody">
            <div class="skeleton skeleton-text" style="width:70%; height:22px; margin-bottom:12px;"></div>
            <div class="skeleton skeleton-text" style="width:40%; height:14px; margin-bottom:20px;"></div>
            <div class="skeleton" style="width:100px; height:36px; border-radius:12px;"></div>
          </div>
        `;
        grid.appendChild(skel);
      }
      return;
    }

    const show = applyFilters(items);
    if (!show.length) {
      grid.innerHTML = `<div style="padding:40px; font-weight:1000; color:var(--muted); text-align:center;">No items found here 😶</div>`;
      return;
    }

    grid.innerHTML = show.map((it, i) => `
      <div class="stagger-in" style="animation-delay: ${Math.min(i * 0.05, 0.4)}s">
        ${card(it)}
      </div>
    `).join("");

    // Re-initialize dynamic effects after grid update
    setTimeout(() => {
        initTiltCards();
        initRipples();
        if(window.UI && window.UI.initScrollAnimations) window.UI.initScrollAnimations();
    }, 100);

    initChefSpotlight();
    initSpinWheel();
  }

  // ---------- SPIN THE WHEEL LOGIC ----------
  let currentRotation = 0;
  let isSpinning = false;
  let wheelItems = [];

  function initSpinWheel() {
    const openBtn = qs("openWheelBtn");
    const overlay = qs("wheelOverlay");
    const closeBtn = qs("closeWheel");
    const spinBtn = qs("spinBtn");
    const wheel = qs("wheelCanvas");
    const resultDiv = qs("wheelResult");
    const addBtn = qs("wheelAddToCart");

    if (!openBtn || !overlay) return;

    openBtn.onclick = () => {
      overlay.classList.add("show");
      setupWheelSections();
    };

    closeBtn.onclick = () => overlay.classList.remove("show");
    overlay.onclick = (e) => { if(e.target === overlay) overlay.classList.remove("show"); };

    function setupWheelSections() {
      // Pick 8 random top items
      wheelItems = items.filter(it => it.rating >= 4.4).sort(() => 0.5 - Math.random()).slice(0, 8);
      wheel.innerHTML = '<div class="wheel-pointer">📍</div>';
      
      wheelItems.forEach((it, i) => {
        const section = document.createElement("div");
        section.className = "wheel-section";
        section.style.transform = `rotate(${i * 45}deg) skewY(-45deg)`;
        section.style.background = i % 2 === 0 ? 'rgba(255,255,255,0.1)' : 'transparent';
        
        const label = document.createElement("div");
        label.style.transform = "skewY(45deg) rotate(22.5deg)";
        label.textContent = it.name.substring(0, 10) + "...";
        section.appendChild(label);
        wheel.appendChild(section);
      });
    }

    spinBtn.onclick = () => {
      if (isSpinning) return;
      isSpinning = true;
      resultDiv.style.display = "none";
      resultDiv.style.transform = "scale(0)";

      const extraRounds = 5 + Math.floor(Math.random() * 5);
      const randomDegree = Math.floor(Math.random() * 360);
      currentRotation += (extraRounds * 360) + randomDegree;
      
      wheel.style.transform = `rotate(${currentRotation}deg)`;

      setTimeout(() => {
        isSpinning = false;
        const actualDeg = currentRotation % 360;
        // The wheel rotates clockwise, pointer is at top (0 deg)
        // items are placed every 45 deg starting from 0.
        // We need to find which item is under the pointer.
        // pointer index = floor((360 - (actualDeg % 360)) / 45)
        const itemIdx = Math.floor(((360 - (actualDeg % 360)) % 360) / 45);
        const winner = wheelItems[itemIdx];

        qs("resultName").textContent = winner.name;
        resultDiv.style.display = "block";
        setTimeout(() => {
            resultDiv.style.transform = "scale(1)";
        }, 50);

        addBtn.onclick = (e) => {
          addToCart(winner.id, e);
          overlay.classList.remove("show");
        };
      }, 4000);
    };
  }

  function initChefSpotlight() {
    const spotSection = qs("chefSpotlight");
    const spotGrid = qs("spotlightGrid");
    if (!spotSection || !spotGrid) return;

    // Only show spotlight if no specific restaurant is selected
    if (restId) {
      spotSection.style.display = "none";
      return;
    }

    // Pick top 3 rated items
    const spotlightItems = items
      .filter(it => it.rating >= 4.5)
      .sort(() => 0.5 - Math.random()) // Shuffle a bit
      .slice(0, 3);

    if (spotlightItems.length > 0) {
      spotSection.style.display = "block";
      spotGrid.innerHTML = spotlightItems.map(it => `
        <div class="mcard spotlight-card" onclick="openModal('${it.id}')" style="flex-direction:row; height:140px; border:2px solid gold; overflow:hidden;">
            <div style="width:120px; height:100%; position:relative;">
                <img src="${it.img}" style="width:100%; height:100%; object-fit:cover;">
                <div style="position:absolute; inset:0; background:linear-gradient(to right, transparent, var(--card));"></div>
            </div>
            <div style="padding:16px; flex:1; display:flex; flex-direction:column; justify-content:center;">
                <div style="font-size:10px; font-weight:1000; color:gold; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">✨ Chef's Top Pick</div>
                <div style="font-weight:1000; font-size:16px;">${it.name}</div>
                <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:1000; color:var(--accent);">${money(it.price)}</span>
                    <span style="font-size:12px; font-weight:800;">⭐ ${it.rating}</span>
                </div>
            </div>
        </div>
      `).join("");
    }
  }

  // ---------- modal ----------
  const modal = qs("modalOverlay");
  const mImg = qs("modalImg");
  const mName = qs("modalName");
  const mRest = qs("modalRest");
  const mPrice = qs("modalPrice");
  const mAdd = qs("modalAdd");
  const mClose = qs("modalClose");
  const mRecs = qs("modalRecs");
  const mReviews = qs("modalReviews");

  // Review Form Elements
  const writeReviewBtn = qs("writeReviewBtn");
  const reviewForm = qs("reviewForm");
  const starPicker = qs("starPicker");
  const submitReview = qs("submitReview");
  const cancelReview = qs("cancelReview");
  const reviewText = qs("reviewText");
  let selectedRating = 0;

  function openModal(itemId) {
    const it = items.find(x => x.id === itemId);
    if (!it) return;
    const r = restaurants.find(x => x.id === it.restId);

    mImg.src = it.img;
    mName.textContent = it.name;
    mRest.textContent = `${r?.name || 'Restaurant'} • ${r?.area || 'Location'}`;
    mPrice.textContent = money(it.price);
    
    // Reset review form
    if(reviewForm) reviewForm.style.display = "none";
    selectedRating = 0;
    if(reviewText) reviewText.value = "";
    resetStars();

    // Smart Recommendations: same category, different item
    const recs = items
      .filter(x => x.cat === it.cat && x.id !== it.id)
      .slice(0, 4);

    if (mRecs) {
      mRecs.innerHTML = recs.map(ri => `
        <div class="rec-card" onclick="openModal('${ri.id}')" style="flex:0 0 100px; cursor:pointer;">
          <img src="${ri.img}" style="width:100px; height:70px; object-fit:cover; border-radius:12px;"/>
          <div style="font-size:11px; font-weight:900; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${ri.name}</div>
          <div style="font-size:10px; font-weight:800; color:var(--accent);">${money(ri.price)}</div>
        </div>
      `).join("");
    }

    // Render Reviews
    function renderReviews() {
      if (!mReviews) return;
      const mockReviews = [
        { name: "Dhushyanth", date: "2 days ago", comment: `Best ${it.name} I've ever had! The quality is top notch.`, stars: 5 },
        { name: "Anjali S.", date: "1 week ago", comment: "Delicious and fresh. Highly recommend the pairing!", stars: 4 }
      ];
      
      const userReviews = JSON.parse(localStorage.getItem("fd_user_reviews_" + itemId) || "[]");
      const allReviews = [...userReviews, ...mockReviews];

      mReviews.innerHTML = allReviews.map(rev => `
        <div style="background:rgba(0,0,0,.02); padding:10px; border-radius:12px; font-size:13px; transform: translateY(0); transition: .2s ease;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <b style="font-weight:900;">${rev.name}</b>
            <span style="font-size:11px; color:var(--muted);">${rev.date}</span>
          </div>
          <div style="color:#ffb800; margin:2px 0;">${"⭐".repeat(rev.stars)}</div>
          <div style="color:var(--muted); font-weight:700;">${rev.comment}</div>
        </div>
      `).join("");
    }
    renderReviews();

    // Review Form Handlers
    writeReviewBtn.onclick = () => {
      reviewForm.style.display = reviewForm.style.display === "none" ? "block" : "none";
    };

    cancelReview.onclick = () => {
      reviewForm.style.display = "none";
    };

    submitReview.onclick = () => {
      const text = reviewText.value.trim();
      if(selectedRating === 0) return toast("Please select a star rating! ⭐");
      if(!text) return toast("Comment cannot be empty! ✍️");

      const newRev = {
        name: "You (Reviewer)",
        date: "Just now",
        comment: text,
        stars: selectedRating
      };

      const userReviews = JSON.parse(localStorage.getItem("fd_user_reviews_" + itemId) || "[]");
      userReviews.unshift(newRev);
      localStorage.setItem("fd_user_reviews_" + itemId, JSON.stringify(userReviews));

      reviewForm.style.display = "none";
      renderReviews();
      toast("Review posted! 🎉");
    };

    mAdd.onclick = (e) => {
      addToCart(it.id, e);
      closeModal();
    };

    modal.classList.add("show");
  }

  // Star Picker Logic
  starPicker?.addEventListener("click", (e) => {
    const star = e.target.closest(".star-input");
    if(!star) return;
    selectedRating = parseInt(star.dataset.val);
    updateStars(selectedRating);
  });

  function updateStars(val) {
    const stars = starPicker.querySelectorAll(".star-input");
    stars.forEach((s, i) => {
      s.style.opacity = (i < val) ? "1" : "0.3";
      s.style.transform = (i < val) ? "scale(1.2)" : "scale(1)";
    });
  }

  function resetStars() {
    const stars = starPicker?.querySelectorAll(".star-input");
    stars?.forEach(s => { s.style.opacity = "0.3"; s.style.transform = "scale(1)"; });
  }

  function closeModal() {
    modal.classList.remove("show");
  }

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  mClose?.addEventListener("click", closeModal);

  // ---------- rich restaurant header ----------
  function updateRichHeader(rId) {
    const r = restaurants.find(x => x.id === rId);
    if (!r) return;

    const richHeader = qs("richRestHeader");
    const restName = qs("restName");
    const restAddr = qs("restAddr");
    const restRating = qs("restRating");
    const restTime = qs("restTime");
    const restCover = qs("restCover");

    if (richHeader) {
      richHeader.style.display = "block";
      restName.textContent = r.name;
      restAddr.textContent = r.area;
      restRating.textContent = r.rating || (4.2 + Math.random() * 0.5).toFixed(1);
      restTime.textContent = `⏱️ ${r.time || '25-35'} min`;
      if(restCover && r.img) restCover.style.backgroundImage = `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.6)), url('${r.img}')`;
    }
  }

  // ---------- CART DRAWER LOGIC ----------
  const cartDrawer = qs("cartDrawer");
  const cartOverlay = qs("cartOverlay");
  const closeDrawer = qs("closeDrawer");
  const drawerList = qs("drawerList");
  const drawerSub = qs("drawerSub");
  const cartTarget = qs("cartTarget");

  function renderDrawer() {
    if (!drawerList) return;
    const cart = getCart();
    if (cart.length === 0) {
      drawerList.innerHTML = `<div style="text-align:center; margin-top:40px; color:var(--muted); font-weight:800;">Your cart is empty</div>`;
      drawerSub.textContent = money(0);
      return;
    }

    drawerList.innerHTML = cart.map(it => `
      <div class="drawer-item">
        <img src="${it.img}" alt="${it.name}">
        <div class="drawer-item-info">
          <div class="drawer-item-title">${it.name}</div>
          <div style="font-size:12px; font-weight:1000; color:var(--accent);">${money(it.price)}</div>
          <div class="drawer-qty-controls">
            <button class="qty-btn" onclick="updateDrawerQty('${it.id}', -1)">-</button>
            <span style="font-weight:1000; font-size:14px;">${it.qty}</span>
            <button class="qty-btn" onclick="updateDrawerQty('${it.id}', 1)">+</button>
          </div>
        </div>
        <div style="font-weight:1000; font-size:14px;">${money(it.price * it.qty)}</div>
      </div>
    `).join("");

    const total = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
    drawerSub.textContent = money(total);
  }

  window.updateDrawerQty = (id, delta) => {
    let cart = getCart();
    const idx = cart.findIndex(x => x.id === id);
    if (idx > -1) {
      cart[idx].qty = (Number(cart[idx].qty)||0) + delta;
      if (cart[idx].qty <= 0) cart.splice(idx, 1);
      setCart(cart);
      renderDrawer();
      updateBadge();
    }
  };

  function toggleDrawer(show) {
    cartDrawer?.classList.toggle("show", show);
    cartOverlay?.classList.toggle("show", show);
  }

  cartTarget?.addEventListener("click", (e) => {
    e.preventDefault();
    renderDrawer();
    toggleDrawer(true);
  });

  closeDrawer?.addEventListener("click", () => toggleDrawer(false));
  cartOverlay?.addEventListener("click", () => toggleDrawer(false));

  // ---------- add to cart with animation ----------
  function addToCart(itemId, event){
    const it = items.find(x => x.id === itemId);
    if(!it) return;

    // Fly animation logic using unified ui.js
    if (event && event.target && window.UI && window.UI.flyToCart) {
      window.UI.flyToCart(event.target, it.img);
    }

    const cart = getCart();
    const idx = cart.findIndex(x => x.id === it.id);

    if(idx >= 0){
      cart[idx].qty = (Number(cart[idx].qty)||0) + 1;
    } else {
      cart.push({
        id: it.id,
        name: it.name,
        price: it.price,
        qty: 1,
        img: it.img,
        restId: it.restId,
        veg: it.veg,
        cat: it.cat
      });
    }

    setCart(cart);
    updateBadge();
    renderDrawer();
    toast(`${it.name} added ✅`);

    // Auto-open drawer on first add or if small screen
    if(cart.length === 1) setTimeout(() => toggleDrawer(true), 1200);
  }

  // ---------- events ----------
  searchBox?.addEventListener("input", (e) => {
    state.q = e.target.value.toLowerCase().trim();
    render();
    showMenuSuggestions(state.q);
  });

  function showMenuSuggestions(q) {
    let wrap = document.getElementById("menuSuggest");
    if(!wrap) {
      wrap = document.createElement("div");
      wrap.id = "menuSuggest";
      wrap.className = "suggest-card";
      searchBox.parentNode.appendChild(wrap);
    }

    if(!q) {
      wrap.innerHTML = `
        <div style="padding:12px; font-weight:800; font-size:11px; color:var(--muted); text-transform:uppercase;">Top Rated</div>
        <div class="s-item" data-val="Pizza">🍕 Special Pizzas</div>
        <div class="s-item" data-val="Biryani">🥘 Spicy Biryanis</div>
      `;
    } else {
      const suggestions = ["Pizza", "Burger", "Pasta", "Noodles", "Shake", "Biryani"]
        .filter(s => s.toLowerCase().includes(q.toLowerCase()));
      if(!suggestions.length) {
        wrap.style.display = "none";
        return;
      }
      wrap.innerHTML = suggestions.map(s => `<div class="s-item" data-val="${s}">🔍 Search for ${s}</div>`).join("");
    }

    wrap.style.display = "block";
    wrap.querySelectorAll(".s-item").forEach(i => {
      i.onclick = () => {
        searchBox.value = i.dataset.val;
        state.q = i.dataset.val.toLowerCase();
        wrap.style.display = "none";
        render();
      };
    });
  }

  document.addEventListener("click", (e) => {
    if(!e.target.closest("#searchMenu") && !e.target.closest("#menuSuggest")) {
      if(document.getElementById("menuSuggest")) document.getElementById("menuSuggest").style.display = "none";
    }
  });

  searchBox?.addEventListener("focus", () => showMenuSuggestions(searchBox.value));

  chips.forEach(c=>{
    c.addEventListener("click", ()=>{
      chips.forEach(x=>x.classList.remove("active"));
      c.classList.add("active");
      state.cat = c.dataset.cat || "all";
      render();
    });
  });

  vegBtn?.addEventListener("click", ()=>{
    state.veg = (state.veg === "veg") ? "all" : "veg";
    vegBtn.classList.toggle("active", state.veg === "veg");
    nonVegBtn?.classList.remove("active");
    render();
  });

  nonVegBtn?.addEventListener("click", ()=>{
    state.veg = (state.veg === "nonveg") ? "all" : "nonveg";
    nonVegBtn.classList.toggle("active", state.veg === "nonveg");
    vegBtn?.classList.remove("active");
    render();
  });

  favFilterBtn?.addEventListener("click", ()=>{
    state.favsOnly = !state.favsOnly;
    favFilterBtn.classList.toggle("active", state.favsOnly);
    render();
  });

  sortMenu?.addEventListener("change", (e)=>{
    state.sort = e.target.value;
    render();
  });

  clearBtn?.addEventListener("click", ()=>{
    state.q = "";
    state.cat = "all";
    state.veg = "all";
    state.sort = "default";
    state.favsOnly = false;

    if(searchBox) searchBox.value = "";
    if(sortMenu) sortMenu.value = "default";
    chips.forEach(x=>x.classList.remove("active"));
    document.querySelector('.chip[data-cat="all"]')?.classList.add("active");

    vegBtn?.classList.remove("active");
    nonVegBtn?.classList.remove("active");
    favFilterBtn?.classList.remove("active");

    toast("Cleared ✅");
    render();
  });

  document.addEventListener("click", (e)=>{
    const favB = e.target.closest("[data-fav]");
    if(favB) {
      toggleFav(favB.dataset.fav);
      return;
    }

    const b = e.target.closest("[data-add]");
    if(b) {
      addToCart(b.dataset.add, e);
      return;
    }

    const card = e.target.closest(".mcard");
    if(card) {
      openModal(card.dataset.id);
    }
  });

  themeToggle?.addEventListener("click", () => {
    const next = window.toggleGlobalTheme();
    if(themeToggle) themeToggle.textContent = next === "dark" ? "☀️ Light" : "🌙 Dark";
  });

  // ---------------- PREMIUM EFFECTS (SPLASH / PROGRESS) ----------------
  function initSplashScreen() {
      const splash = qs("splashScreen");
      if (!splash) return;
      setTimeout(() => {
          splash.style.opacity = "0";
          splash.style.visibility = "hidden";
      }, 1500);
  }


  // ---------------- 3D TILT CARDS ----------------
  function initTiltCards() {
      setTimeout(() => {
          const cards = document.querySelectorAll('.mcard');
          cards.forEach(card => {
              card.addEventListener('mousemove', (e) => {
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const tiltX = (y - centerY) / 20;
                  const tiltY = (centerX - x) / 20;
                  card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
              });
              card.addEventListener('mouseleave', () => {
                  card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
              });
          });
      }, 500); // allow time for render
  }

  // ---------------- RIPPLE ANIMATION ----------------
  function initRipples() {
    const elements = document.querySelectorAll('.btn, .chip, .madd, .miniBtn, .premium-filter, .qty-btn, .favBtn');
    elements.forEach(el => {
      // Avoid adding multiple listeners if called multiple times
      if(el.dataset.rippleInited) return; 
      el.dataset.rippleInited = "true";
      el.classList.add('ripple');
      
      el.addEventListener('mousedown', function(e) {
        const span = document.createElement('span');
        span.classList.add('ripple-span');
        
        // Use dark ripple on light buttons
        const bg = getComputedStyle(el).backgroundColor;
        if (bg === 'rgb(255, 255, 255)' || bg === 'rgba(0, 0, 0, 0)' || el.classList.contains('chip')) {
            span.classList.add('ripple-dark');
        }
        
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        span.style.width = span.style.height = size + 'px';
        span.style.left = e.clientX - rect.left - size / 2 + 'px';
        span.style.top = e.clientY - rect.top - size / 2 + 'px';
        
        el.appendChild(span);
        setTimeout(() => span.remove(), 600);
      });
    });
  }


  // ---------------- PARTICLES ----------------
  function initParticles() {
    const container = document.getElementById("particles");
    if(!container) return;
    
    // Create 15 particles
    for(let i=0; i<15; i++) {
        const p = document.createElement("div");
        p.classList.add("particle");
        
        // Random size between 20px and 80px
        const size = Math.random() * 60 + 20;
        p.style.width = size + "px";
        p.style.height = size + "px";
        
        // Random horizontal position
        p.style.left = Math.random() * 100 + "vw";
        
        // Random animation duration between 10s and 25s
        p.style.animationDuration = (Math.random() * 15 + 10) + "s";
        
        // Random animation delay so they don't all start at once
        p.style.animationDelay = (Math.random() * 10) + "s";
        
        container.appendChild(p);
    }
  }

  // ---------- init ----------
  const currentTheme = localStorage.getItem("fd_theme") || "light";
  if(themeToggle) themeToggle.textContent = currentTheme === "dark" ? "☀️ Light" : "🌙 Dark";

  updateBadge();
  initParticles();
  render();
  setTimeout(initRipples, 200);
  
  window.addEventListener("load", initSplashScreen);
  if(document.readyState === 'complete') initSplashScreen();

  window.addEventListener("focus", updateBadge);
})();
