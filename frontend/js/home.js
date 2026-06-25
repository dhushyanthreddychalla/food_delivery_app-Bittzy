// js/home.js (NO modules) - FULL PREMIUM (FOOD IMAGES + OPEN MENU)
(function () {
  const CART_KEY = "fd_cart";

  // ---------------- CART BADGE ----------------
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function cartCount() {
    return getCart().reduce((a, x) => a + (Number(x.qty) || 0), 0);
  }
  function updateBadge() {
    const total = String(cartCount());
    
    const b = document.getElementById("cartCount");
    if (b) {
      b.textContent = total;
      b.classList.remove("animate-bounce");
      void b.offsetWidth;
      b.classList.add("animate-bounce");
      b.style.display = total > 0 ? "inline-block" : "none";
    }

    const mob = document.getElementById("navCartCountMobile");
    if (mob) {
      mob.textContent = total;
      mob.style.display = total > 0 ? "inline-block" : "none";
    }
  }

  // ---------------- TOAST ----------------
  const toastEl = document.getElementById("toast");
  function toast(t) {
    if (!toastEl) return;
    toastEl.textContent = t;
    toastEl.classList.add("show");
    clearTimeout(window.__t);
    window.__t = setTimeout(() => toastEl.classList.remove("show"), 1200);
  }

  // ---------------- RESTAURANTS (FOOD IMAGES) ----------------
  // NOTE: If you run on file:// some browsers block net images.
  // Use VS Code Live Server for best result.
  const restaurants = DATA.restaurants;

  // ---------------- DOM ----------------
  const grid = document.getElementById("restGrid");
  const search = document.getElementById("searchRest");
  const chips = document.querySelectorAll(".chip");
  const themeToggle = document.getElementById("themeToggle");

  const state = {
    q: "",
    cat: "All",
    sort: "default",
    loading: true,
    mouseX: 0,
    mouseY: 0,
    recsInited: false
  };

  // Simulate premium load
  setTimeout(() => {
    state.loading = false;
    render();
  }, 1200);

  function stars(r) {
    const n = Math.max(1, Math.min(5, Math.round(r)));
    return "⭐".repeat(n);
  }

  function safeImg(url, alt) {
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

  function card(r) {
    return `
      <div class="rcard">
        <div class="rimg">
          ${safeImg(r.img, r.name)}
          <div class="rtagRow">
            <span class="rtag">📍 ${r.area}</span>
            <span class="rtag">${stars(r.rating)} ${r.rating.toFixed(1)}</span>
          </div>
        </div>

        <div class="rbody">
          <div class="rname">${r.name}</div>
          <div class="raddr">${r.addr}</div>

          <div class="rmeta">
            <div class="left">
              <span class="smallPill">⏱️ ${r.eta}</span>
              <span class="smallPill">🏷️ ${String(r.tag).toUpperCase()}</span>
            </div>

            <div style="display:flex; gap:8px;">
               <button class="smallPill" onclick="window.UI.showQuickView('${r.id}')" style="cursor:pointer; background:rgba(0,0,0,0.05); border:none;">⚡ View Items</button>
               <button class="openBtn" data-open="${r.id}">Open Menu</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function applyFilters(list) {
    let out = list.slice();

    // category filter
    if (state.cat !== "All") out = out.filter(x => x.tag === state.cat.toLowerCase());

    // search
    if(state.q){
      const q = state.q.toLowerCase();
      out = out.filter(x =>
        x.name.toLowerCase().includes(q) ||
        x.area.toLowerCase().includes(q) ||
        (x.tag && x.tag.toLowerCase().includes(q))
      );
    }

    // sort
    if(state.sort === "rating"){
      out.sort((a,b) => b.rating - a.rating);
    } else if(state.sort === "time"){
      // parse "20-30 min" into 20
      const getMin = (eta) => Number(eta.split("-")[0].replace(/\D/g, '')) || 99;
      out.sort((a,b) => getMin(a.eta) - getMin(b.eta));
    }

    return out;
  }

  function render() {
    if (!grid) return;
    grid.innerHTML = "";
    
    // Skeleton check
    if (state.loading) {
      for (let i = 0; i < 6; i++) {
        const skel = document.createElement("div");
        skel.className = "card skeleton-card";
        skel.innerHTML = `
          <div class="skeleton" style="height:180px; border-radius:24px 24px 0 0; margin-bottom:12px;"></div>
          <div style="padding:0 16px 16px;">
            <div class="skeleton skeleton-text" style="width:70%; height:20px; margin-bottom:10px;"></div>
            <div class="skeleton skeleton-text" style="width:50%; height:14px;"></div>
          </div>
        `;
        grid.appendChild(skel);
      }
      return;
    }

    const show = applyFilters(restaurants);

    if (!show.length) {
      grid.innerHTML = `<div style="padding:16px;font-weight:1000;color:#333">No restaurants found 😶</div>`;
      return;
    }
    
    grid.innerHTML = show.map((r, i) => `
        <div class="stagger-in" style="animation-delay: ${i * 0.1}s">
            ${card(r)}
        </div>
    `).join("");
    
    // Also init recs and order again if first time
    if (!state.recsInited) {
        initRecs();
        initOrderAgain();
        state.recsInited = true;
    }
    
    // Attach 3D tilt after render
    if(typeof initTiltCards === 'function') initTiltCards();
    if(window.UI && window.UI.initScrollAnimations) window.UI.initScrollAnimations();
  }

  function initOrderAgain() {
    const orderAgainSection = document.getElementById("orderAgainSection");
    const orderAgainGrid = document.getElementById("orderAgainGrid");
    if (!orderAgainSection || !orderAgainGrid) return;
    
    const history = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || "[]");
    
    // Get unique restaurants from the last 3 orders
    const recentOrders = history.slice(-3).reverse();
    
    const uniqueOrderData = [];
    const seenRestIds = new Set();
    
    recentOrders.forEach(order => {
        // Find main restaurant from the cart items
        if(order.cart && order.cart.length > 0) {
            let restId = order.cart[0].restId || order.cart[0].id.substring(0,2); // Fallback assumption
            if (!seenRestIds.has(restId)) {
                let rest = restaurants.find(r => r.id === restId);
                if(rest) {
                    seenRestIds.add(restId);
                    uniqueOrderData.push({
                         rest: rest,
                         orderInfo: order,
                         topItems: order.cart.slice(0, 2).map(i => `${i.qty}x ${i.name}`).join(', ') + (order.cart.length > 2 ? '...' : '')
                    });
                }
            }
        }
    });

    if (uniqueOrderData.length > 0) {
        orderAgainSection.style.display = "block";
        orderAgainGrid.innerHTML = uniqueOrderData.map(data => `
            <div class="rcard">
                <div style="display:flex; gap:12px; padding:12px; border-bottom:1px solid rgba(0,0,0,0.05);">
                   <div style="width:60px; height:60px; border-radius:12px; overflow:hidden; flex-shrink:0;">
                      <img src="${data.rest.img}" style="width:100%; height:100%; object-fit:cover;" />
                   </div>
                   <div style="flex:1;">
                      <div class="rname" style="font-size:14px; margin-bottom:4px;">${data.rest.name}</div>
                      <div style="font-size:11px; color:var(--muted); line-height:1.4;">${data.topItems}</div>
                   </div>
                </div>
                <div style="padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
                   <div style="font-size:11px; font-weight:800; color:var(--orange);">Last order: ${new Date(data.orderInfo.id).toLocaleDateString()}</div>
                   <button class="openBtn" data-open="${data.rest.id}" style="padding:6px 14px; font-size:12px; width:auto;">Reorder</button>
                </div>
            </div>
        `).join("");
    }
  }

  function initTrendingItems() {
      const container = document.getElementById("trendingItemsGrid");
      if (!container) return;

      // Filter high rated items across all restaurants
      const trending = DATA.items.filter(item => item.rating >= 4.5).slice(0, 8);
      
      container.innerHTML = trending.map((item, i) => `
          <div class="rcard stagger-in" style="animation-delay: ${i * 0.1}s">
              <div class="rimg" style="height:140px">
                  ${safeImg(item.img, item.name)}
                  <div class="rtagRow">
                      <span class="rtag">⭐ ${item.rating}</span>
                      <span class="rtag" style="background:#4cd137; color:white;">TRENDING</span>
                  </div>
              </div>
              <div class="rbody" style="padding:12px">
                  <div class="rname" style="font-size:16px">${item.name}</div>
                  <div style="font-size:12px; color:var(--muted); margin-top:4px;">${restaurants.find(r => r.id === item.restId)?.name || 'Restaurant'}</div>
                  <div class="rmeta" style="margin-top:10px">
                      <div class="rname" style="font-size:16px; color:var(--orange);">₹${item.price}</div>
                      <button class="openBtn" data-open="${item.restId}" style="padding:6px 14px; font-size:12px; width:auto;">Order Now</button>
                  </div>
              </div>
          </div>
      `).join("");
  }

  function initRecs() {
    const recsSection = document.getElementById("recsSection");
    const recsGrid = document.getElementById("recsGrid");
    if (!recsSection || !recsGrid) return;

    const recommended = RECS.getRecommendations(restaurants);
    if (recommended.length > 0) {
        recsSection.style.display = "block";
        recsGrid.innerHTML = recommended.map(r => `
            <div class="rcard" style="transform: scale(0.95);">
                <div class="rimg" style="height:140px">
                    ${safeImg(r.img, r.name)}
                </div>
                <div class="rbody" style="padding:12px">
                    <div class="rname" style="font-size:16px">${r.name}</div>
                    <div class="rmeta" style="margin-top:8px">
                        <span class="smallPill">⭐ ${r.rating}</span>
                        <button class="smallPill" onclick="window.UI.showQuickView('${r.id}')" style="padding:4px 10px; font-size:12px; cursor:pointer; background:var(--orange); color:white; border:none; font-weight:1000;">View</button>
                    </div>
                </div>
            </div>
        `).join("");
    }
    // Also init trending items after recs
    initTrendingItems();
  }

  // ---------------- TOP BRANDS ----------------
  function initBrands() {
      const bGrid = document.getElementById("brandsGrid");
      if (!bGrid) return;
      
      // Select 6 premium partnered restaurants for "Top Brands"
      const premiumRests = restaurants.filter(r => r.rating >= 4.5).slice(0, 6);
      
      bGrid.innerHTML = premiumRests.map((r, i) => `
          <div class="brand-circle stagger-in" style="animation-delay: ${i*0.05}s; cursor:pointer;" onclick="window.location.href='menu.html?rest=${r.id}'">
             <div style="width:100%; aspect-ratio:1/1; border-radius:50%; overflow:hidden; background:white; box-shadow:0 8px 24px rgba(0,0,0,0.06); padding:4px; margin-bottom:8px; border:1px solid rgba(0,0,0,0.05); transition:transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); display:grid; place-items:center;">
                 <img src="${r.img}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">
             </div>
             <div style="font-weight:900; font-size:12px; color:var(--text); line-height:1.2; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                 ${r.name.split(' ')[0]}
             </div>
             <div style="font-weight:800; font-size:10px; color:var(--muted); margin-top:2px;">
                 ${r.eta}
             </div>
          </div>
      `).join("");
      
      // Attach hover effect JS manually to avoid messy inline CSS on hover
      const circles = bGrid.querySelectorAll(".brand-circle > div:first-child");
      circles.forEach(c => {
          c.addEventListener("mouseenter", () => c.style.transform = "scale(1.1) translateY(-4px)");
          c.addEventListener("mouseleave", () => c.style.transform = "scale(1) translateY(0)");
      });
  }

  // ---------------- RESTAURANT STORIES ----------------
  function initStories() {
      const container = document.getElementById("storiesContainer");
      if (!container) return;
      
      // Select 6 highly rated restaurants for stories
      const storyRests = [...restaurants].sort((a,b) => b.rating - a.rating).slice(0, 6);
      
      container.innerHTML = storyRests.map((r, i) => `
         <div class="story-avatar-wrap" onclick="openStory('${r.id}')" style="animation: pop 0.4s ease forwards; animation-delay: ${i*0.05}s; opacity:0; transform:translateY(10px);">
             <div class="story-ring">
                 <img src="${r.img}" alt="${r.name}">
             </div>
             <div style="font-size:11px; font-weight:800; text-align:center; width:74px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.name.split(' ')[0]}</div>
         </div>
      `).join("");
  }
  
  let currentStoryTimer = null;
  let currentStoryItems = [];
  let currentStoryIndex = 0;
  let currentStoryRest = null;

  window.openStory = function(restId) {
      const r = restaurants.find(x => x.id === restId);
      if (!r) return;
      
      currentStoryRest = r;
      currentStoryItems = DATA.items.filter(x => x.restId === restId).slice(0, 3); // Top 3 items
      if (currentStoryItems.length === 0) return;
      
      document.getElementById("storyViewer").style.display = "flex";
      renderStorySlide(0);
  };
  
  function renderStorySlide(index) {
      if (index >= currentStoryItems.length) {
          closeStory();
          return;
      }
      if (index < 0) index = 0;
      
      currentStoryIndex = index;
      const item = currentStoryItems[index];
      const viewer = document.getElementById("storyViewer");
      
      document.getElementById("storyAvatar").src = currentStoryRest.img;
      document.getElementById("storyName").textContent = currentStoryRest.name;
      document.getElementById("storyBg").src = item.img;
      document.getElementById("storyImg").src = item.img;
      document.getElementById("storyItemName").textContent = item.name + " - ₹" + item.price;
      
      // Render Progress Bars
      const progContainer = document.getElementById("storyProgressContainer");
      progContainer.innerHTML = currentStoryItems.map((_, i) => `
          <div style="flex:1; height:3px; background:rgba(255,255,255,0.3); border-radius:3px; overflow:hidden;">
              <div id="sprog-${i}" style="height:100%; width:${i < index ? '100%' : '0%'}; background:white; ${i === index ? 'transition: width 5s linear;' : ''}"></div>
          </div>
      `).join("");
      
      // Order Button Logic
      const orderBtn = document.getElementById("storyOrderBtn");
      orderBtn.onclick = () => {
          closeStory();
          window.location.href = `menu.html?rest=${currentStoryRest.id}`;
      };
      
      // Start Animation
      clearTimeout(currentStoryTimer);
      setTimeout(() => {
          const bar = document.getElementById(`sprog-${index}`);
          if (bar) bar.style.width = "100%";
      }, 50);
      
      currentStoryTimer = setTimeout(() => {
          renderStorySlide(index + 1);
      }, 5000); // 5 seconds per story
  }
  
  function closeStory() {
      document.getElementById("storyViewer").style.display = "none";
      clearTimeout(currentStoryTimer);
  }
  
  document.getElementById("closeStoryBtn")?.addEventListener("click", closeStory);
  document.getElementById("storyLeftTap")?.addEventListener("click", () => renderStorySlide(currentStoryIndex - 1));
  document.getElementById("storyRightTap")?.addEventListener("click", () => {
      const bar = document.getElementById(`sprog-${currentStoryIndex}`);
      if(bar) { bar.style.transition = 'none'; bar.style.width = "100%"; }
      renderStorySlide(currentStoryIndex + 1);
  });

  // ---------------- EVENTS ----------------
  search?.addEventListener("input", (e) => {
    state.q = (e.target.value || "").trim();
    render();
    showSuggestions(state.q);
  });

  function showSuggestions(q) {
    let suggestWrap = document.getElementById("searchSuggest");
    if(!suggestWrap) {
      suggestWrap = document.createElement("div");
      suggestWrap.id = "searchSuggest";
      suggestWrap.className = "suggest-card";
      search.parentNode.appendChild(suggestWrap);
    }

    if(!q || q.length < 1) {
      suggestWrap.innerHTML = `
        <div style="padding:12px; font-weight:800; font-size:11px; color:var(--muted); text-transform:uppercase;">Trending Dishes</div>
        <div class="s-item" data-val="Biryani">🍲 Nellore Dum Biryani</div>
        <div class="s-item" data-val="Pizza">🍕 Margherita Pizza</div>
        <div class="s-item" data-val="Burger">🍔 Loaded Cheese Burger</div>
      `;
    } else {
      const matches = restaurants.filter(r => r.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3);
      if(matches.length === 0) {
        suggestWrap.style.display = "none";
        return;
      }
      suggestWrap.innerHTML = matches.map(m => `
        <div class="s-item" data-val="${m.name}">🏢 ${m.name}</div>
      `).join("");
    }

    suggestWrap.style.display = "block";
    
    // Suggestion click
    suggestWrap.querySelectorAll(".s-item").forEach(item => {
      item.onclick = () => {
        search.value = item.dataset.val;
        state.q = item.dataset.val;
        suggestWrap.style.display = "none";
        render();
      };
    });
  }

  document.addEventListener("click", (e) => {
    if(!e.target.closest("#searchRest") && !e.target.closest("#searchSuggest")) {
      document.getElementById("searchSuggest") && (document.getElementById("searchSuggest").style.display = "none");
    }
  });

  search?.addEventListener("focus", () => showSuggestions(search.value));

  chips.forEach(c => {
    c.addEventListener("click", () => {
      chips.forEach(x => x.classList.remove("active"));
      c.classList.add("active");
      state.cat = c.dataset.filter || c.dataset.cat || "all";
      render();
    });
  });

  const sortMenu = document.getElementById("sortMenu");
  sortMenu?.addEventListener("change", (e)=>{
    state.sort = e.target.value;
    render();
  });

  // Open restaurant -> menu filtered by restaurant id
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (!btn) return;

    const id = btn.dataset.open;
    const selected = restaurants.find(x => x.id === id);
    if (selected) localStorage.setItem("fd_selected_rest", JSON.stringify(selected));

    toast("Opening menu ✅");
    window.location.href = `menu.html?rest=${encodeURIComponent(id)}`;
  });

  // Collections scroller logic
  document.getElementById("collections")?.addEventListener("click", (e) => {
    const item = e.target.closest(".col-card");
    if (!item) return;
    const cat = item.dataset.cat;
    toast(`Opening ${cat} collection... 🚀`);
    setTimeout(() => {
        // Find chip and click it if on homepage
        const targetChip = Array.from(chips).find(c => (c.dataset.filter === cat || c.dataset.cat === cat));
        if (targetChip) {
            targetChip.click();
            window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
        } else {
            window.location.href = `menu.html?cat=${encodeURIComponent(cat)}`;
        }
    }, 600);
  });

  // ---------------- LIVE ORDER TRACKING ----------------
  const ORDER_HISTORY_KEY = "fd_order_history";
  let trackingInterval = null;

  function initLiveTracking() {
    const container = document.getElementById("liveOrderContainer");
    const card = document.getElementById("trackingCard");
    const history = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || "[]");
    
    // Check for "Active" order (most recent one in last 5 minutes)
    const activeOrder = history.length > 0 ? history[history.length - 1] : null;
    const isRecentlyPlaced = activeOrder && (Date.now() - new Date(activeOrder.id).getTime() < 5 * 60 * 1000);

    if (!isRecentlyPlaced || activeOrder.status === "Delivered") {
      if (container) container.style.display = "none";
      return;
    }

    if (container) container.style.display = "block";
    updateTrackingUI(activeOrder, card);

    // Simulate progress
    if (!trackingInterval) {
      trackingInterval = setInterval(() => {
        const statuses = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
        let currentIdx = statuses.indexOf(activeOrder.status || "Placed");
        
        if (currentIdx < statuses.length - 1) {
          activeOrder.status = statuses[currentIdx + 1];
          // Update history
          const h = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || "[]");
          if (h.length > 0) {
            h[h.length - 1].status = activeOrder.status;
            localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(h));
          }
          updateTrackingUI(activeOrder, card);
          
          if (activeOrder.status === "Delivered") {
            NOTIFICATIONS?.add("Order Delivered! 🍕", `Your order #${activeOrder.id} has been delivered. Enjoy!`, "info");
            clearInterval(trackingInterval);
            setTimeout(() => { if (container) container.style.display = "none"; }, 5000);
          }
        }
      }, 10000); // Update every 10s
    }
  }

  function updateTrackingUI(order, card) {
    if (!card) return;
    const statuses = ["Placed", "Preparing", "Out for Delivery", "Delivered"];
    const currentIdx = statuses.indexOf(order.status || "Placed");
    const progress = ((currentIdx + 1) / statuses.length) * 100;
    
    // Calculate position for the scooter
    const scooterPos = Math.min(Math.max(progress - 10, 5), 90);

    card.innerHTML = `
      <div style="position:relative; z-index:2;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:20px;">
          <div>
            <div style="text-transform:uppercase; font-size:11px; font-weight:1000; letter-spacing:1px; color:rgba(255,255,255,0.6);">Current Status</div>
            <h3 style="margin:5px 0 0; font-size:24px;">${order.status || 'Placed'}...</h3>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px; color:rgba(255,255,255,0.6); font-weight:800;">Order ID</div>
            <div style="font-weight:1000; font-size:14px;">#${order.id}</div>
          </div>
        </div>

        <!-- NEW ADVANCED MAP TRACKING -->
        <div style="background:rgba(0,0,0,0.2); border-radius:16px; padding:18px 15px; margin-bottom:24px; position:relative; overflow:hidden;">
           <div style="font-size:10px; font-weight:1000; text-transform:uppercase; color:rgba(255,255,255,0.6); margin-bottom:15px; letter-spacing:1px; text-align:center;">Live Partner Location</div>
           
           <div style="position:relative; height:40px; display:flex; align-items:center;">
              <!-- Map Path Background -->
              <div style="position:absolute; left:15px; right:15px; height:4px; background:rgba(255,255,255,0.1); border-radius:4px;"></div>
              
              <!-- Map Path Fill -->
              <div style="position:absolute; left:15px; width:calc(${progress}% - 30px); height:4px; background:var(--orange); border-radius:4px; transition: width 1s ease-in-out; box-shadow:0 0 10px var(--orange);"></div>
              
              <!-- Restaurant Marker -->
              <div style="position:absolute; left:0; font-size:18px; background:white; border-radius:50%; width:32px; height:32px; display:grid; place-items:center; box-shadow:0 4px 8px rgba(0,0,0,0.3); z-index:2;">🏪</div>
              
              <!-- Scooter moving -->
              <div style="position:absolute; left:calc(${scooterPos}% - 15px); font-size:30px; transition: left 1s ease-in-out, transform 0.3s; transform: translateY(-4px) rotate(${currentIdx === 2 ? '5deg' : '0deg'}); text-shadow:0 4px 8px rgba(0,0,0,0.4); z-index:3;">🛵</div>
              
              <!-- Home Marker -->
              <div style="position:absolute; right:0; font-size:18px; background:white; border-radius:50%; width:32px; height:32px; display:grid; place-items:center; box-shadow:0 4px 8px rgba(0,0,0,0.3); z-index:2;">🏠</div>
           </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px;">
          ${statuses.map((s, i) => `
            <div style="text-align:center; opacity:${i <= currentIdx ? 1 : 0.4}; transition:0.3s;">
              <div style="font-size:20px; margin-bottom:8px;">${s === 'Placed' ? '📝' : s === 'Preparing' ? '👨‍🍳' : s === 'Out for Delivery' ? '🛵' : '✅'}</div>
              <div style="font-size:10px; font-weight:1000; text-transform:uppercase;">${s}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div style="position:absolute; right:-20px; bottom:-20px; font-size:120px; opacity:0.05; transform:rotate(-15deg); pointer-events:none;">🛵</div>
    `;
  }

  // ---------------- GOLD BADGE MODAL ----------------
  const goldBadge = document.getElementById("goldBadge");
  goldBadge?.addEventListener("click", () => {
    if (window.UI?.showGoldModal) {
      window.UI.showGoldModal();
    } else {
      toast("FD Gold Benefits: Free Delivery & Extra Discounts! 🏆");
    }
  });


  // ---------------- AUTO PROMO CAROUSEL ----------------
  function initPromoCarousel() {
      const carousel = document.querySelector('.promo-carousel');
      if (!carousel) return;

      let scrollSpeed = 1;
      let scrollInterval;

      const startScroll = () => {
          scrollInterval = setInterval(() => {
              carousel.scrollLeft += scrollSpeed;
              if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 1) {
                  // If we hit the end, smoothly bounce back or reset
                  carousel.scrollTo({ left: 0, behavior: 'smooth' });
              }
          }, 30); // ~30fps smooth scroll
      };

      startScroll();

      // Pause on hover so users can click
      carousel.addEventListener('mouseenter', () => clearInterval(scrollInterval));
      carousel.addEventListener('mouseleave', startScroll);
      carousel.addEventListener('touchstart', () => clearInterval(scrollInterval), {passive: true});
      carousel.addEventListener('touchend', startScroll, {passive: true});
  }

  // ---------------- GLASSMORPHIC QUICK VIEW MODAL ----------------
  window.UI = window.UI || {};
  window.UI.showQuickView = function(restId) {
      const rest = restaurants.find(r => r.id === restId);
      if(!rest) return;

      const items = DATA.items.filter(i => i.restId === restId).slice(0, 4); // Get top 4 items
      
      document.getElementById("qvRestName").textContent = rest.name;
      const grid = document.getElementById("qvItemsGrid");
      
      if(items.length === 0) {
          grid.innerHTML = `<div style="padding:20px; text-align:center; color:var(--muted); font-weight:800;">No items found.</div>`;
      } else {
          grid.innerHTML = items.map(item => `
              <div style="display:flex; gap:16px; align-items:center; background:var(--card); padding:12px; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                  <div style="width:80px; height:80px; border-radius:16px; overflow:hidden; flex-shrink:0;">
                      <img src="${item.img}" style="width:100%; height:100%; object-fit:cover;" />
                  </div>
                  <div style="flex:1;">
                      <div style="font-weight:1000; font-size:16px; margin-bottom:4px;">${item.name}</div>
                      <div style="font-weight:900; color:var(--orange);">₹${item.price}</div>
                  </div>
                  <button class="addBtn" style="padding:8px 16px; border-radius:12px; background:var(--orange); color:white; border:none; font-weight:1000; cursor:pointer;" onclick="event.stopPropagation(); window.location.href='menu.html?rest=${restId}'">Add +</button>
              </div>
          `).join("");
      }

      document.getElementById("qvFullMenuBtn").onclick = () => {
          window.location.href = `menu.html?rest=${restId}`;
      };

      const container = document.getElementById("quickViewContainer");
      const overlay = document.getElementById("quickViewOverlay");
      const modal = document.getElementById("quickViewModal");
      
      container.style.display = "flex";
      // trigger reflow
      void container.offsetWidth;
      
      overlay.style.opacity = "1";
      modal.style.transform = "translateY(0)";
      
      document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  function closeQuickView() {
      const overlay = document.getElementById("quickViewOverlay");
      const modal = document.getElementById("quickViewModal");
      
      overlay.style.opacity = "0";
      modal.style.transform = "translateY(100%)";
      
      document.body.style.overflow = "";
      
      setTimeout(() => {
          document.getElementById("quickViewContainer").style.display = "none";
      }, 400); // match transition duration
  }

  document.getElementById("closeQvBtn")?.addEventListener("click", closeQuickView);
  document.getElementById("quickViewOverlay")?.addEventListener("click", closeQuickView);

  // ---------------- PREMIUM EFFECTS (SPLASH / PROGRESS) ----------------
  function initSplashScreen() {
      const splash = document.getElementById("splashScreen");
      if (!splash) return;
      
      // Minimum loading time of 1.5s for premium feel, even if loaded fast
      setTimeout(() => {
          splash.style.opacity = "0";
          splash.style.visibility = "hidden";
      }, 1500);
  }


  // ---------------- 3D TILT CARDS ----------------
  function initTiltCards() {
      // Small delay to ensure cards are in DOM
      setTimeout(() => {
          const cards = document.querySelectorAll('.rcard');
          cards.forEach(card => {
              card.addEventListener('mousemove', (e) => {
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left; // x position within the element.
                  const y = e.clientY - rect.top;  // y position within the element.
  
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
  
                  // Max rotation amount (degrees)
                  const maxRotate = 8;
  
                  const rotateX = ((y - centerY) / centerY) * -maxRotate;
                  const rotateY = ((x - centerX) / centerX) * maxRotate;
  
                  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02) translateY(-8px)`;
                  card.style.transition = 'none'; // remove transition during mouse move for immediate response
              });
  
              card.addEventListener('mouseleave', () => {
                  card.style.transform = '';
                  card.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'; // restore smooth return
              });
          });
      }, 300);
  }

  // ---------------- NEW FEATURES & ANIMATIONS ----------------
  
  // 1. Scroll To Top Button
  function initScrollToTop() {
    const btn = document.getElementById("scrollTopBtn");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }, {passive:true});
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 1. Hyper-Premium Background Animations
  function initParticleBackground() {
    const container = document.querySelector('.mesh-bg');
    const glow = document.getElementById('cursorGlow');
    if (!container) return;

    // --- Cursor Follow Logic ---
    if (glow) {
      document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
      });
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    let elements = [];
    const particleCount = 30;
    const silhouetteCount = 12;
    const foodEmojis = ['🍕', '🍔', '🍟', '🌮', '🥗', '🥘', '🍜', '🍱', '🍦', '🍰', '🍩', '🍪'];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.3 + 0.1;
      }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;

          // Mouse Repulsion
          const dx = this.x - (state.mouseX || 0);
          const dy = this.y - (state.mouseY || 0);
          const dist = Math.sqrt(dx*dx + dy*dy);
          const radius = 150;
          if(dist < radius) {
            const force = (radius - dist) / radius;
            this.x += (dx / dist) * force * 5;
            this.y += (dy / dist) * force * 5;
          }

          if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
          if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        const isDark = document.documentElement.classList.contains('dark');
        const color = isDark ? '255, 255, 255' : '255, 105, 180';
        ctx.fillStyle = `rgba(${color}, ${this.opacity})`;
        ctx.fill();
      }
    }

    class Silhouette {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
        this.size = Math.random() * 40 + 40;
        this.speedX = (Math.random() - 0.5) * 0.25;
        this.speedY = (Math.random() - 0.5) * 0.25;
        this.opacity = Math.random() * 0.08 + 0.03;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.003;
        this.layer = Math.floor(Math.random() * 3); // Parallax layer
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotSpeed;
        if (this.x < -100 || this.x > canvas.width + 100) this.speedX *= -1;
        if (this.y < -100 || this.y > canvas.height + 100) this.speedY *= -1;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw Glassmorphic Bubble Ring
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Emoji
        ctx.font = `${this.size * 0.6}px serif`;
        ctx.globalAlpha = this.opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) elements.push(new Particle());
    for (let i = 0; i < silhouetteCount; i++) elements.push(new Silhouette());

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elements.forEach(el => {
        el.update();
        el.draw();
      });
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
  }

  // 2. Advanced Parallax Effects
  function initParallaxEffects() {
    document.addEventListener('mousemove', (e) => {
      const mouseX = (e.clientX / window.innerWidth - 0.5);
      const mouseY = (e.clientY / window.innerHeight - 0.5);

      // Blobs Parallax
      const blobs = document.querySelectorAll('.ambient-blob');
      blobs.forEach((blob, i) => {
        const factor = (i + 1) * 40;
        blob.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px)`;
      });

      // Hero Elements Parallax
      const heroTitle = document.querySelector('.heroText h1');
      const heroPara = document.querySelector('.heroText p');
      const heroGraphic = document.querySelector('.hero-graphic');
      
      if (heroTitle) heroTitle.style.transform = `translate(${mouseX * 15}px, ${mouseY * 10}px)`;
      if (heroPara) heroPara.style.transform = `translate(${mouseX * 10}px, ${mouseY * 5}px)`;
    });
  }

  // 3. Flash Deal Popup
  function initFlashDeal() {
    const toast = document.getElementById("flashDealToast");
    const closeBtn = document.getElementById("closeFlashBtn");
    if (!toast) return;
    
    // Show after 5 seconds if not dismissed previously in this session
    if (!sessionStorage.getItem("fd_flash_dismissed")) {
      setTimeout(() => {
        toast.classList.add("show");
      }, 5000);
    }
    
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        toast.classList.remove("show");
        sessionStorage.setItem("fd_flash_dismissed", "true");
      });
    }
  }

  // 3. Ripple Effect on Buttons/Cards
  function initRipples() {
    const elements = document.querySelectorAll('.btn, .openBtn, .chip, .promo-btn, .pad-item');
    elements.forEach(el => {
      el.classList.add('ripple');
      el.addEventListener('click', function(e) {
        const span = document.createElement('span');
        span.classList.add('ripple-span');
        
        // Use dark ripple on light buttons
        if (getComputedStyle(el).backgroundColor === 'rgb(255, 255, 255)') {
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

  // 4. Live Order Popups
  function initLiveOrders() {
    const toast = document.getElementById("liveOrderToast");
    const img = document.getElementById("loImg");
    const text = document.getElementById("loText");
    if (!toast) return;

    const items = [
      { name: "Chicken Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&q=80" },
      { name: "Margherita Pizza", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&q=80" },
      { name: "Chocolate Cake", img: "https://images.unsplash.com/photo-1578985545062-69928b1ea9be?w=100&q=80" },
      { name: "Spicy Noodles", img: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=100&q=80" }
    ];

    setInterval(() => {
      // Don't show if user is not on tab
      if(document.visibilityState !== 'visible') return;

      const rand = items[Math.floor(Math.random() * items.length)];
      img.src = rand.img;
      text.textContent = rand.name;
      
      toast.style.transform = "translateX(0)";
      
      setTimeout(() => {
        toast.style.transform = "translateX(-150%)";
      }, 4000);
    }, 12000); // pop up every 12 seconds
  }

  // 6. Surprise Me Logic
  window.UI.showSurpriseModal = () => {
    const modal = document.getElementById("surpriseModal");
    const container = document.getElementById("surpriseCard");
    if(!modal || !container) return;

    // Pick a random restaurant with high rating
    const topRests = restaurants.filter(r => r.rating >= 4.5);
    const rand = topRests[Math.floor(Math.random() * topRests.length)];
    
    container.innerHTML = card(rand);
    
    const goBtn = document.getElementById("surpriseGoBtn");
    if(goBtn) {
        goBtn.onclick = () => {
            window.location.href = `menu.html?rest=${rand.id}`;
        };
    }

    modal.classList.add("active");
  };

  window.UI.closeSurpriseModal = () => {
    const modal = document.getElementById("surpriseModal");
    if(modal) modal.classList.remove("active");
  };

  // 7. Voice Search Logic
  window.UI.showVoiceSearch = () => {
    const modal = document.getElementById("voiceModal");
    if(!modal) return;
    modal.classList.add("active");
    
    const status = document.getElementById("voiceStatus");
    const ripple = document.getElementById("voiceRipple");
    
    // Simulate recognition
    setTimeout(() => {
        if(status) status.textContent = "Processing...";
        setTimeout(() => {
            const terms = ["Biryani", "Pizza", "Burgers", "Desserts"];
            const term = terms[Math.floor(Math.random() * terms.length)];
            if(status) status.textContent = `Searching for '${term}'...`;
            
            setTimeout(() => {
                window.UI.closeVoiceSearch();
                const searchInput = document.getElementById("searchRest");
                if(searchInput) {
                    searchInput.value = term;
                    searchInput.dispatchEvent(new Event('input'));
                    window.scrollTo({ top: searchInput.offsetTop - 100, behavior: "smooth" });
                }
            }, 1000);
        }, 1500);
    }, 2000);
  };

  window.UI.closeVoiceSearch = () => {
    const modal = document.getElementById("voiceModal");
    if(modal) modal.classList.remove("active");
  };

  // 8. Spin Wheel Logic
  let isSpinning = false;
  
  window.UI.showSpinWheel = () => {
    const modal = document.getElementById("spinModal");
    if(modal) modal.classList.add("active");
  };
  
  window.UI.closeSpinWheel = () => {
    if(isSpinning) return;
    const modal = document.getElementById("spinModal");
    if(modal) modal.classList.remove("active");
  };

  function initSpinWheel() {
    const wheel = document.getElementById("wheel");
    const spinBtn = document.getElementById("spinBtn");
    if(!wheel || !spinBtn) return;

    spinBtn.addEventListener("click", () => {
      if(isSpinning) return;
      isSpinning = true;
      spinBtn.disabled = true;
      spinBtn.textContent = "Spinning...";

      const deg = Math.floor(Math.random() * 1080) + 1440;
      const currentRotation = parseInt(wheel.dataset.rotation || '0', 10);
      const newRotation = currentRotation + deg;
      wheel.dataset.rotation = newRotation;
      
      wheel.style.transform = `rotate(${newRotation}deg)`;
      
      setTimeout(() => {
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = "Spin to Win";
        
        const rewards = ["20% OFF", "Free Dessert", "Free Delivery", "₹100 Cashback", "Better Luck Next Time!"];
        const won = rewards[Math.floor(Math.random() * rewards.length)];
        
        if (won.includes("Better Luck")) {
            alert("🎡 " + won);
        } else {
            alert("🎉 Congratulations! You won: " + won + "!");
        }
        window.UI.closeSpinWheel();
      }, 4000);
    });
  }

  // 9. Mood Matcher Logic
  window.UI.triggerMood = (mood) => {
    // Show a toast or modal recommending a type of food based on mood
    const mData = {
      'sad': { emoji: '🍫', text: 'Nothing like a warm Triple Chocolate Brownie to lift your spirits! Adding to recommendations...' },
      'energy': { emoji: '🥗', text: 'Power up! We recommend a Protein-packed Grilled Chicken Salad. Adding to recommendations...' },
      'chill': { emoji: '🍕', text: 'Movie night ready! A large Pepperoni Pizza is the perfect companion. Adding to recommendations...' },
      'party': { emoji: '🌮', text: 'Let\'s go! A massive Taco Party Pack coming right up. Adding to recommendations...' }
    };

    if(mData[mood]) {
      const t = document.getElementById("toast");
      if(t) {
        t.textContent = `${mData[mood].emoji} ${mData[mood].text}`;
        t.classList.add("show");
        setTimeout(() => t.classList.remove("show"), 4000);
      }
    }
  };

  // 10. Standardized Ripple Effect
  function initRipples() {
    document.addEventListener('mousedown', function(e) {
      const el = e.target.closest('.btn, .chip, .rcard, .mood-card, .miniBtn, .pulse-glow-btn');
      if(!el) return;

      const span = document.createElement('span');
      span.classList.add('ripple-span');
      
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
  }

  // 11. 3D Tilt Cards
  function initTiltCards() {
    const cards = document.querySelectorAll('.rcard, .mood-card');
    cards.forEach(card => {
        if(card.dataset.tiltInited) return;
        card.dataset.tiltInited = "true";

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / 15;
            const tiltY = (centerX - x) / 15;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
  }

  // 12. Intersection Observer Scroll Animations
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) scale(1)";
        }
      });
    }, { threshold: 0.1 });

    const targets = document.querySelectorAll('.rcard, .mood-grid, .sectionHead, .heroCard, .promo-banner');
    targets.forEach(t => {
      t.classList.add('scroll-reveal');
      observer.observe(t);
    });
  }

  // 13. CSS Particles (Mirroring Menu Page)
  function initCSSParticles() {
    const container = document.getElementById("particles");
    if(!container) return;
    container.innerHTML = ""; // Clear existing
    
    for(let i=0; i<15; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        const size = Math.random() * 60 + 20;
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.left = Math.random() * 100 + "vw";
        p.style.animationDuration = (Math.random() * 15 + 10) + "s";
        p.style.animationDelay = (Math.random() * 5) + "s";
        container.appendChild(p);
    }
  }

  // 14. Interactive Background System
  let bubbleData = [];
  function initBubbles() {
    const container = document.getElementById("bubbles");
    if(!container) return;
    container.innerHTML = "";
    bubbleData = [];
    
    const totalHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    for(let i=0; i<60; i++) {
        const b = document.createElement("div");
        b.className = "bubble";
        
        const size = Math.random() * 60 + 60; // Medium size
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * totalHeight;
        
        b.style.width = size + "px";
        b.style.height = size + "px";
        b.style.left = x + "px";
        b.style.top = y + "px";
        
        const data = {
            el: b,
            x: x,
            y: y,
            originalX: x,
            originalY: y,
            size: size,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        };
        
        bubbleData.push(data);
        container.appendChild(b);
    }
    
    requestAnimationFrame(updateInteractiveElements);
  }

  function updateInteractiveElements() {
    const mouseX = state.mouseX || 0;
    const mouseY = state.mouseY || 0;
    
    // 1. Bubble Repulsion
    bubbleData.forEach(b => {
        // Natural drift
        b.x += b.vx;
        b.y += b.vy;
        
        // Repulsion from mouse (using page coords for absolute bubbles)
        const dx = b.x + b.size/2 - (state.pageX || 0);
        const dy = b.y + b.size/2 - (state.pageY || 0);
        const dist = Math.sqrt(dx*dx + dy*dy);
        const radius = 300;
        
        if (dist < radius) {
            const force = (radius - dist) / radius;
            b.x += dx / dist * force * 5;
            b.y += dy / dist * force * 5;
            b.el.classList.add('repelled');
        } else {
            // Return to original (drifted) path slowly
            b.el.classList.remove('repelled');
        }
        
        // Bounds check
        const totalHeight = Math.max(document.documentElement.scrollHeight, window.innerHeight);
        if(b.x < -b.size) b.x = window.innerWidth;
        if(b.x > window.innerWidth) b.x = -b.size;
        if(b.y < -b.size) b.y = totalHeight;
        if(b.y > totalHeight) b.y = -b.size;
        
        b.el.style.transform = `translate(${b.x - b.originalX}px, ${b.y - b.originalY}px)`;
    });
    
    // 2. Scroll Parallax for Mesh
    const scrollY = window.scrollY;
    const meshBg = document.querySelector('.mesh-bg');
    if(meshBg) {
        meshBg.style.transform = `translateY(${scrollY * 0.2}px) rotate(${scrollY * 0.05}deg)`;
    }

    requestAnimationFrame(updateInteractiveElements);
  }

  function initInteractiveEcosystem() {
    window.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX; // Viewport for fixed elements
        state.mouseY = e.clientY;
        state.pageX = e.pageX;   // Page for absolute elements
        state.pageY = e.pageY;
        
        // Magnetic Card Glow
        const cards = document.querySelectorAll('.rcard');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            if (e.clientX > rect.left && e.clientX < rect.right && e.clientY > rect.top && e.clientY < rect.bottom) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);
            }
        });
    });
  }


  // ---------------- MOOD DISCOVERY LOGIC ----------------
  window.UI = window.UI || {};
  window.UI.triggerMood = function(mood) {
    let tag = "all";
    let message = "Finding the perfect vibe for you... ✨";

    if (mood === 'sad') {
        tag = "desserts";
        message = "Sweet treats to cheer you up! 🍦";
    } else if (mood === 'energy') {
        tag = "biryani";
        message = "Fuel up with some heavy hitters! 🍛";
    } else if (mood === 'chill') {
        tag = "pizza";
        message = "The ultimate comfort food for your movie night! 🍕";
    } else if (mood === 'party') {
        tag = "south";
        message = "Spice up your celebration! 🌶️";
    }

    if(typeof toast === 'function') toast(message);
    state.cat = tag;
    
    // Update chips UI
    const chips = document.querySelectorAll(".chip");
    chips.forEach(c => {
        c.classList.remove("active");
        if ((c.dataset.filter || c.dataset.cat) === tag) c.classList.add("active");
    });

    render();
    const grid = document.getElementById("restGrid");
    if(grid) window.scrollTo({ top: grid.offsetTop - 100, behavior: 'smooth' });
  };

  // ---------------- FOODIE LEVEL LOGIC ----------------
  function updateFoodieLevel() {
    const history = JSON.parse(localStorage.getItem("fd_order_history") || "[]");
    const levelEl = document.getElementById("foodieLevel");
    if (!levelEl) return;

    const count = history.length;
    let label = "⭐ Foodie";
    let color = "linear-gradient(135deg, #FFD700, #FFA500)";
    
    if (count >= 10) {
        label = "👑 Master Chef";
        color = "linear-gradient(135deg, #8E2DE2, #4A00E0)";
        levelEl.style.color = "white";
    } else if (count >= 5) {
        label = "👨‍🍳 Gourmet";
        color = "linear-gradient(135deg, #00c6ff, #0072ff)";
        levelEl.style.color = "white";
    }

    levelEl.textContent = label;
    levelEl.style.background = color;
  }

  // ---------------- MAGIC REORDER LOGIC ----------------
  function initMagicReorder() {
    const history = JSON.parse(localStorage.getItem("fd_order_history") || "[]");
    const btn = document.getElementById("magicReorderBtn");
    if (!btn || history.length < 2) return;

    // Find most frequent restaurant
    const counts = {};
    history.forEach(order => {
        if (order.cart && order.cart[0]) {
            const rid = order.cart[0].restId || order.cart[0].id.substring(0,2);
            counts[rid] = (counts[rid] || 0) + 1;
        }
    });

    const frequentRestId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
    
    if (frequentRestId) {
        state.frequentRestId = frequentRestId;
        setTimeout(() => btn.classList.add("visible"), 3000);
    }
  }

  window.UI.triggerMagicReorder = function() {
    if (state.frequentRestId) {
        const rest = restaurants.find(r => r.id === state.frequentRestId);
        if(typeof toast === 'function') toast(`Magic Reorder: Opening ${rest ? rest.name : 'your favorite'}... 🪄`);
        setTimeout(() => {
            window.location.href = `menu.html?rest=${state.frequentRestId}`;
        }, 800);
    }
  };

  updateBadge();
  render();
  updateFoodieLevel();
  initDnaRecommendations();
  initMagicReorder();

  function initDnaRecommendations() {
    const history = JSON.parse(localStorage.getItem("fd_order_history") || "[]").slice(0, 20);
    const container = document.getElementById("dnaRecommendations");
    const grid = document.getElementById("dnaGrid");
    
    if (!container || !grid || history.length === 0) return;

    // 1. Analyze profile (Simplified from profile.html logic)
    let stats = { spicy: 0, comfort: 0, healthy: 0, sweet: 0 };
    history.forEach(order => {
        if (order.cart) {
            order.cart.forEach(item => {
                const cat = (item.cat || "").toLowerCase();
                if (["biryani", "south"].includes(cat)) stats.spicy++;
                else if (["pizza", "burger"].includes(cat)) stats.comfort++;
                else if (cat === "desserts") stats.sweet++;
                else if (cat === "veg") stats.healthy++;
            });
        }
    });

    // 2. Find top category
    const topCat = Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b);
    if (stats[topCat] === 0) return;

    // 3. Map to data.js categories
    const catMap = {
        spicy: ["Biryani", "South Indian"],
        comfort: ["Pizza", "Burger"],
        sweet: ["Desserts"],
        healthy: ["Veg"]
    };

    // 4. Get matching items from data.js
    const targetCats = catMap[topCat];
    const recs = items
        .filter(it => targetCats.includes(it.cat))
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

    if (recs.length > 0) {
        container.style.display = "block";
        grid.innerHTML = recs.map(it => `
            <div class="rcard stagger-in" onclick="window.location.href='menu.html?rest=${it.restId || 'p1'}'">
                <div class="rimg">
                    <img src="${it.img}" alt="${it.name}">
                    <div class="rtagRow">
                        <span class="rtag" style="background:var(--accent); color:white; border:none;">🧬 DNA Match</span>
                    </div>
                </div>
                <div class="rbody">
                    <div class="rname">${it.name}</div>
                    <div class="rmeta">
                        <div class="left">
                            <span class="smallPill">⭐ ${it.rating}</span>
                            <span class="smallPill">₹${it.price}</span>
                        </div>
                        <button class="openBtn">View Menu</button>
                    </div>
                </div>
            </div>
        `).join("");
    }
  }
  initParticleBackground(); // Canvas mesh
  initCSSParticles();      // Floating dots
  initBubbles();           // Soft large bubbles
  initParallaxEffects();
  initLiveTracking();
  initStories();
  initBrands();
  initPromoCarousel();
  initScrollToTop();
  initFlashDeal();
  initLiveOrders();
  initSpinWheel();
  initInteractiveEcosystem();
  
  // Wait for dynamic content
  setTimeout(() => {
    initTiltCards();
    initRipples();
    initMagneticButtons();
  }, 200);

  function initMagneticButtons() {
    const targets = document.querySelectorAll(".btn, .chip, .mood-card, .logo, .openBtn");
    
    targets.forEach(el => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Intensity of the pull
        const strength = 15; 
        const xMove = (x / rect.width) * strength;
        const yMove = (y / rect.height) * strength;
        
        el.style.transform = `translate(${xMove}px, ${yMove}px) scale(1.02)`;
        if (el.classList.contains("rcard")) el.style.transform += ` scale(1.02)`;
      });
      
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }
  
  // Start Splash Screen logic once everything is requested
  window.addEventListener("load", initSplashScreen);
  // Fallback if load already fired
  if(document.readyState === 'complete') initSplashScreen();

  initParallaxLayers();
  initScrollReveals();

  function initParallaxLayers() {
    const layers = document.querySelectorAll(".parallax-layer");
    
    window.addEventListener("scroll", () => {
        const scrolled = window.pageYOffset;
        layers.forEach(layer => {
            const speed = layer.dataset.speed || 0.1;
            const yPos = -(scrolled * speed);
            layer.style.transform = `translateY(${yPos}px)`;
        });
    });

    window.addEventListener("mousemove", (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 50;
        const y = (window.innerHeight / 2 - e.pageY) / 50;
        
        layers.forEach(layer => {
            const speed = layer.dataset.speed || 0.1;
            const xMove = x * speed * 20;
            const yMove = y * speed * 20;
            // Combined with scroll (CSS handles vertical baseline)
            layer.style.marginLeft = `${xMove}px`;
            layer.style.marginTop = `${yMove}px`;
        });
    });
  }

  function initScrollReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  }

  // Voice Search Global
  window.UI = window.UI || {};
  window.UI.showVoiceSearch = () => {
    const modal = document.getElementById("voiceModal");
    const status = document.getElementById("voiceStatus");
    if(!modal) return;
    
    modal.classList.add("active");
    if(status) {
        status.textContent = "Listening...";
        status.style.opacity = "0.6";
        
        // Simulate voice recognition
        const phrases = ["Biryani", "Cheesy Pizza", "Chocolate Cake", "Healthy Salad", "South Indian"];
        const result = phrases[Math.floor(Math.random() * phrases.length)];
        
        setTimeout(() => {
            status.textContent = `"${result}"`;
            status.style.opacity = "1";
            status.style.color = "var(--accent)";
            
            setTimeout(() => {
                const searchInput = document.getElementById("searchRest");
                if(searchInput) {
                    searchInput.value = result;
                    // Trigger search
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    if(typeof render === 'function') render();
                }
                window.UI.closeVoiceSearch();
            }, 1200);
        }, 2500);
    }
  };
  window.UI.closeVoiceSearch = () => {
    const modal = document.getElementById("voiceModal");
    if(modal) modal.classList.remove("active");
  };

  window.addEventListener("focus", () => {
    updateBadge();
    initLiveTracking();
    if(document.getElementById("orderAgainGrid")) {
        document.getElementById("orderAgainGrid").innerHTML = ""; // force re-render
        state.recsInited = false;
        render();
    }
  });

  document.getElementById("voiceBtn")?.addEventListener("click", () => {
      window.UI?.showVoiceSearch();
  });
})();
