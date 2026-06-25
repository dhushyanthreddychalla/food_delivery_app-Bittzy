(function () {
  // Page in
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("page-in");
    
    // --- PREMIUM GOLD THEME ---
    window.applyPremiumGold = function(active) {
      if (active) {
          document.documentElement.classList.add("gold-theme");
          document.documentElement.style.setProperty('--accent', '#FFD700');
          document.documentElement.style.setProperty('--accent-hover', '#DAA520');
      } else {
          document.documentElement.classList.remove("gold-theme");
          // Reset to defaults based on theme (simplified, should ideally read from :root)
          const isDark = document.documentElement.classList.contains("dark");
          document.documentElement.style.setProperty('--accent', '#fc8019');
          document.documentElement.style.setProperty('--accent-hover', '#e06b12');
      }
    };

    // Init Gold Theme
    const isGold = localStorage.getItem("fd_premium_gold") === "true";
    window.applyPremiumGold(isGold);

    // Universal Scroll Progress
    const bar = document.getElementById("scrollProgress");
    if (bar) {
      window.addEventListener("scroll", () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        bar.style.width = scrolled + "%";
      }, { passive: true });
    }

    // Universal Scroll Reveal Animations
    window.UI.initScrollAnimations();
  });

  window.UI = window.UI || {};

  window.UI.initScrollAnimations = function() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view', 'visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Select common elements that should reveal on scroll
    const selectors = '.promo-banner, .sectionHead, .mf-grid > div, .rcard, .mcard, .scroll-reveal, .fade-on-scroll, .stagger-in, .col-card, .hero, .offerBox';
    document.querySelectorAll(selectors).forEach(el => {
      observer.observe(el);
    });
  };

  // Page transitions for internal links
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;
    if (href.startsWith("#") || href.startsWith("http") || a.target === "_blank") return;

    e.preventDefault();
    document.body.classList.remove("page-in");
    document.body.classList.add("page-out");
    setTimeout(() => (window.location.href = href), 180);
  });

  // Toast
  function ensureToastRoot() {
    let root = document.getElementById("toastRoot");
    if (!root) {
      root = document.createElement("div");
      root.id = "toastRoot";
      root.className = "toast-root";
      document.body.appendChild(root);
    }
    return root;
  }

  window.toast = function toast(message, type = "success") {
    const root = ensureToastRoot();
    const t = document.createElement("div");
    t.className = `toast ${type}`;
    t.innerHTML = `
      <div class="toast-dot"></div>
      <div class="toast-msg">${message}</div>
      <button class="toast-x" aria-label="close">✕</button>
    `;
    root.appendChild(t);

    const close = () => {
      t.classList.add("hide");
      setTimeout(() => t.remove(), 180);
    };

    t.querySelector(".toast-x").onclick = close;
    setTimeout(close, 2400);
  };

  // FD Gold Modal
  Object.assign(window.UI, {
    showGoldModal() {
      const modal = document.createElement("div");
      modal.className = "modal-overlay active";
      modal.innerHTML = `
        <div class="modal-content" style="max-width:400px; padding:0; overflow:hidden; border-radius:32px;">
          <div style="background:linear-gradient(135deg,#ffd700,#ffa500); padding:40px 20px; text-align:center; position:relative;">
            <div style="font-size:64px; margin-bottom:10px;">🏆</div>
            <h2 style="margin:0; color:#000; font-size:28px; font-weight:1000;">FD GOLD</h2>
            <div style="color:rgba(0,0,0,0.6); font-weight:800; font-size:12px; text-transform:uppercase; letter-spacing:2px;">Exclusive Member Perks</div>
            <button class="modal-close" style="top:20px; right:20px; background:rgba(0,0,0,0.1); color:#000;">✕</button>
          </div>
          <div style="padding:30px; background:var(--bg-white);">
            <div style="display:grid; gap:20px;">
              <div style="display:flex; gap:16px; align-items:center;">
                <div style="width:44px; height:44px; background:rgba(255,215,0,0.1); border-radius:14px; display:grid; place-items:center; font-size:20px;">🛵</div>
                <div>
                  <div style="font-weight:1000; font-size:15px;">Free Delivery</div>
                  <div style="font-size:12px; color:var(--muted);">On all orders above ₹199</div>
                </div>
              </div>
              <div style="display:flex; gap:16px; align-items:center;">
                <div style="width:44px; height:44px; background:rgba(255,215,0,0.1); border-radius:14px; display:grid; place-items:center; font-size:20px;">💎</div>
                <div>
                  <div style="font-weight:1000; font-size:15px;">VIP Support</div>
                  <div style="font-size:12px; color:var(--muted);">Priority resolution for your queries</div>
                </div>
              </div>
              <div style="display:flex; gap:16px; align-items:center;">
                <div style="width:44px; height:44px; background:rgba(255,215,0,0.1); border-radius:14px; display:grid; place-items:center; font-size:20px;">🏷️</div>
                <div>
                  <div style="font-weight:1000; font-size:15px;">Extra 10% OFF</div>
                  <div style="font-size:12px; color:var(--muted);">Above all existing restaurant offers</div>
                </div>
              </div>
            </div>
            <button class="modal-close-btn" style="width:100%; margin-top:30px; padding:14px; border-radius:16px; background:#000; color:#fff; border:none; font-weight:1000; cursor:pointer;">Got it!</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
      };
      modal.querySelector(".modal-close").onclick = close;
      modal.querySelector(".modal-close-btn").onclick = close;
      modal.onclick = (e) => { if (e.target === modal) close(); };
    },

    showQuickView(restId) {
      const itArr = DATA.items.filter(x => x.restId === restId).slice(0, 9);
      if (!itArr.length) return;
      const r = DATA.restaurants.find(x => x.id === restId);

      const modal = document.createElement("div");
      modal.className = "modal-overlay active";
      modal.style.zIndex = "2100";
      modal.innerHTML = `
        <div class="modal-content" style="max-width:600px; padding:0; overflow:hidden; border-radius:32px; animation: slideUp 0.3s ease;">
          <div style="height:180px; position:relative;">
             <img src="${r.img}" style="width:100%; height:100%; object-fit:cover; filter: brightness(0.7);">
             <button class="modal-close" style="top:20px; right:20px; background:rgba(0,0,0,0.5); color:white; border-radius:50%; width:36px; height:36px; padding:0; z-index:10;">✕</button>
             <div style="position:absolute; bottom:20px; left:25px; color:white;">
                <h2 style="margin:0; font-size:28px; font-weight:1000;">${r.name}</h2>
                <div style="font-size:14px; font-weight:800; opacity:0.9;">📍 ${r.area} • ⭐ ${r.rating}</div>
             </div>
          </div>
          <div style="padding:25px; background:var(--bg-white); max-height:450px; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0; font-weight:1000; font-size:18px;">Popular Dishes (${itArr.length})</h3>
                <a href="menu.html?rest=${restId}" style="color:var(--orange); font-weight:1000; font-size:13px; text-decoration:none;">View Full Menu →</a>
            </div>
            <div style="display:grid; grid-template-columns: 1fr; gap:16px;">
              ${itArr.map(it => `
                <div style="display:flex; gap:15px; align-items:center; background:rgba(0,0,0,0.03); padding:12px; border-radius:18px;">
                  <img src="${it.img}" style="width:70px; height:70px; border-radius:14px; object-fit:cover;">
                  <div style="flex:1">
                    <div style="font-weight:1000; font-size:15px;">${it.name}</div>
                    <div style="color:var(--muted); font-size:12px; font-weight:800;">${it.veg === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'} • ${it.cat.toUpperCase()}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-weight:1000; font-size:15px; color:var(--accent);">₹${it.price}</div>
                    <button class="smallPill" style="margin-top:4px; padding:4px 10px; border:none; background:var(--orange); color:white; cursor:pointer;" onclick="window.__addToCart('${it.id}')">Add +</button>
                  </div>
                </div>
              `).join("")}
            </div>
            <button class="pill modal-close-btn" style="width:100%; height:50px; margin-top:20px; background:rgba(0,0,0,0.05); border:none; font-weight:1000; font-size:16px; cursor:pointer;">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
      };

      // Add dummy basket link for now
      window.__addToCart = (id) => {
          toast("Item added to cart! 🛒");
          // In index.html/home.js we'd normally call the actual cart logic
      };

      modal.querySelector(".modal-close").onclick = close;
      modal.querySelector(".modal-close-btn").onclick = close;
      modal.onclick = (e) => { if (e.target === modal) close(); };
    },

    showVoiceSearch() {
      const modal = document.createElement("div");
      modal.className = "modal-overlay active";
      modal.style.zIndex = "2500";
      modal.innerHTML = `
        <div class="modal-content" style="max-width:320px; text-align:center; padding:50px 30px; border-radius:40px; background:rgba(255,255,255,0.9); backdrop-filter:blur(20px);">
          <div style="position:relative; width:80px; height:80px; margin:0 auto 30px;">
            <div class="listening-ripple"></div>
            <div class="listening-ripple" style="animation-delay:0.5s"></div>
            <div style="position:absolute; inset:0; background:var(--orange); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow:0 10px 30px rgba(252,128,25,0.4);">🎤</div>
          </div>
          <h2 style="margin:0; font-size:24px; font-weight:1000;">Listening...</h2>
          <p style="color:var(--muted); font-size:14px; margin-top:10px; font-weight:800;">"Find best pizza near me"</p>
          <button class="pill modal-close-btn" style="width:100%; height:50px; margin-top:30px; background:#000; color:#fff; border:none; font-weight:1000;">Cancel</button>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
      };
      modal.querySelector(".modal-close-btn").onclick = close;

      // Simulate recognition
      setTimeout(() => {
          if (document.body.contains(modal)) {
              close();
              toast("Search: 'Biryani' recognized! 🍲");
              const input = document.getElementById("q");
              if (input) {
                  input.value = "Biryani";
                  input.dispatchEvent(new Event('input', { bubbles: true }));
              }
          }
      }, 3000);
    },

    showSurpriseModal() {
      const modal = document.createElement("div");
      modal.className = "modal-overlay active";
      modal.style.zIndex = "3000";
      modal.innerHTML = `
        <div class="modal-content" style="max-width:360px; text-align:center; padding:40px 20px; border-radius:32px; background:linear-gradient(to bottom, #fff, #f8faff);">
          <div style="font-size:50px; margin-bottom:10px; animation: pop 0.5s ease;">🎲</div>
          <h2 style="margin:0; font-weight:1000; font-size:24px; color:#6c63ff;">Surprise Me!</h2>
          <p style="color:var(--muted); font-size:14px; font-weight:800; margin-top:8px;">Can't decide? Let us pick a delicious combo for you.</p>
          
          <div style="margin-top:24px; text-align:left;">
            <label style="font-weight:900; font-size:13px; color:var(--muted);">Select your budget</label>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:10px;" id="budgetOptions">
              <button class="pill budget-btn active" data-max="200" style="border:2px solid #6c63ff; background:rgba(108,99,255,0.1); color:#6c63ff; padding:10px; font-weight:800; cursor:pointer;">₹200</button>
              <button class="pill budget-btn" data-max="400" style="border:1px solid rgba(0,0,0,0.1); background:var(--bg-white); color:var(--muted); padding:10px; font-weight:800; cursor:pointer;">₹400</button>
              <button class="pill budget-btn" data-max="9999" style="border:1px solid rgba(0,0,0,0.1); background:var(--bg-white); color:var(--muted); padding:10px; font-weight:800; cursor:pointer;">Any</button>
            </div>
          </div>

          <div style="margin-top:20px; text-align:left;">
             <label style="font-weight:900; font-size:13px; color:var(--muted);">Preference</label>
             <div style="display:flex; gap:15px; margin-top:10px;">
                <label style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                  <input type="radio" name="surp_p" value="all" checked style="accent-color:#6c63ff; width:18px; height:18px;"> Anything
                </label>
                <label style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                  <input type="radio" name="surp_p" value="veg" style="accent-color:#16a34a; width:18px; height:18px;"> Veg Only
                </label>
             </div>
          </div>

          <button id="spinBtn" style="width:100%; margin-top:30px; padding:16px; border-radius:18px; background:linear-gradient(135deg, #6c63ff, #8b5cf6); color:white; border:none; font-weight:1000; font-size:16px; cursor:pointer; box-shadow:0 8px 20px rgba(108,99,255,0.4); transition: transform 0.2s;">
            Build My Meal 🪄
          </button>
          <button class="modal-close-btn" style="width:100%; margin-top:10px; padding:14px; border-radius:18px; background:transparent; color:var(--muted); border:none; font-weight:900; font-size:14px; cursor:pointer;">Cancel</button>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
      };

      modal.querySelector(".modal-close-btn").onclick = close;
      
      const budgetBtns = modal.querySelectorAll(".budget-btn");
      let selectedMax = 200;
      budgetBtns.forEach(b => {
         b.onclick = () => {
            budgetBtns.forEach(bx => {
               bx.style.border = "1px solid rgba(0,0,0,0.1)"; 
               bx.style.background = "var(--bg-white)"; 
               bx.style.color = "var(--muted)";
            });
            b.style.border = "2px solid #6c63ff";
            b.style.background = "rgba(108,99,255,0.1)";
            b.style.color = "#6c63ff";
            selectedMax = parseInt(b.dataset.max);
         };
      });

      modal.querySelector("#spinBtn").onclick = () => {
         const isVeg = modal.querySelector('input[name="surp_p"]:checked').value === "veg";
         
         let items = window.DATA?.items || [];
         if(isVeg) items = items.filter(x => x.veg === "veg");
         
         const mains = items.filter(x => x.cat !== "drinks" && x.cat !== "desserts");
         const sides = items.filter(x => x.cat === "drinks" || x.cat === "desserts");
         
         const shuffle = arr => arr.sort(() => 0.5 - Math.random());
         
         let chosenMain = null;
         let chosenSide = null;
         let found = false;
         
         const shuffledMains = shuffle([...mains]);
         const shuffledSides = shuffle([...sides]);
         
         for(let m of shuffledMains) {
            if(selectedMax < 300 && m.price > selectedMax) continue;
            for(let s of shuffledSides) {
               if(m.price + s.price <= selectedMax) {
                  chosenMain = m;
                  chosenSide = s;
                  found = true;
                  break;
               }
            }
            if(found) break;
            
            if(m.price <= selectedMax) {
                chosenMain = m;
            }
         }
         
         if(!chosenMain && !found) {
             toast("No combos found for this strict budget! Trying a higher budget...", "error");
             return;
         }

         const content = modal.querySelector(".modal-content");
         content.innerHTML = `
            <div style="font-size:40px; margin-bottom:10px; animation: pop 0.5s ease;">🎉</div>
            <h2 style="margin:0; font-weight:1000; font-size:22px;">Here's your surprise meal!</h2>
            
            <div style="margin-top:20px; text-align:left; background:white; border-radius:18px; border:1px solid rgba(0,0,0,0.05); padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                <div style="display:flex; gap:12px; align-items:center;">
                   <img src="${chosenMain.img}" style="width:60px; height:60px; border-radius:14px; object-fit:cover;">
                   <div style="flex:1;">
                      <div style="font-weight:900; font-size:15px;">${chosenMain.name}</div>
                      <div style="color:var(--muted); font-size:12px; font-weight:800;">₹${chosenMain.price} • Main</div>
                   </div>
                </div>
                ${chosenSide ? `
                <div style="height:1px; background:rgba(0,0,0,0.05); margin:12px 0;"></div>
                <div style="display:flex; gap:12px; align-items:center;">
                   <img src="${chosenSide.img}" style="width:60px; height:60px; border-radius:14px; object-fit:cover;">
                   <div style="flex:1;">
                      <div style="font-weight:900; font-size:15px;">${chosenSide.name}</div>
                      <div style="color:var(--muted); font-size:12px; font-weight:800;">₹${chosenSide.price} • Add-on</div>
                   </div>
                </div>
                ` : ''}
            </div>
            
            <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:14px; color:var(--muted); font-weight:800;">Total Estimate</div>
                <div style="font-size:24px; font-weight:1000; color:#6c63ff;">₹${chosenMain.price + (chosenSide ? chosenSide.price : 0)}</div>
            </div>

            <button id="addSurpriseBtn" style="width:100%; margin-top:24px; padding:16px; border-radius:18px; background:linear-gradient(135deg, #16a34a, #22c55e); color:white; border:none; font-weight:1000; font-size:16px; cursor:pointer; box-shadow:0 8px 20px rgba(34,197,94,0.3);">
               Add to Cart 🛒
            </button>
            <button class="modal-close-btn" style="width:100%; margin-top:10px; padding:14px; border-radius:18px; background:transparent; color:var(--muted); border:none; font-weight:900; font-size:14px; cursor:pointer;">Maybe next time</button>
         `;
         
         content.querySelector(".modal-close-btn").onclick = close;
         content.querySelector("#addSurpriseBtn").onclick = () => {
             const cart = JSON.parse(localStorage.getItem("fd_cart") || "[]");
             const pushItem = (it) => {
                 const idx = cart.findIndex(x => x.id === it.id);
                 if(idx >= 0) cart[idx].qty = (cart[idx].qty||0) + 1;
                 else cart.push({
                    id: it.id, name: it.name, price: it.price, qty: 1, img: it.img, restId: it.restId, veg: it.veg, cat: it.cat
                 });
             };
             pushItem(chosenMain);
             if(chosenSide) pushItem(chosenSide);
             localStorage.setItem("fd_cart", JSON.stringify(cart));
             
             toast("Surprise meal added! 🎉");
             close();
             setTimeout(() => window.location.reload(), 800);
         };
      };
    },

    showSpinWheel() {
      const modal = document.createElement("div");
      modal.className = "spin-modal-overlay active";
      modal.innerHTML = `
        <div class="spin-modal">
           <button class="modal-close-btn" style="position:absolute; top:20px; right:20px; background:rgba(0,0,0,0.1); color:var(--text); border:none; width:36px; height:36px; border-radius:50%; font-size:16px; cursor:pointer; z-index:10;">✕</button>
           
           <h2 style="margin:0 0 5px; font-size:28px; font-weight:1000; background:linear-gradient(135deg, #ff9800, #f44336); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Spin to Win!</h2>
           <p style="margin:0 0 20px; color:var(--muted); font-size:14px; font-weight:800;">Spin the wheel to win a daily discount coupon.</p>
           
           <div class="wheel-container">
              <div class="wheel-pin"></div>
              <div class="wheel" id="spinWheelElement">
                 <!-- Label text would normally SVG, simplified visual here -->
                 <div style="position:absolute; inset:0; display:flex; justify-content:center; align-items:center; font-weight:1000; font-size:40px; color:rgba(255,255,255,0.8); z-index:2; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5)); pointer-events:none;">?</div>
              </div>
           </div>
           
           <button id="spinActionBtn" class="spin-btn">SPIN NOW</button>
           <div id="spinResult" style="margin-top:20px; font-size:18px; font-weight:1000; color:var(--accent); min-height:24px;"></div>
        </div>
      `;
      document.body.appendChild(modal);

      const close = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
      };
      modal.querySelector(".modal-close-btn").onclick = close;

      const wheel = modal.querySelector("#spinWheelElement");
      const spinBtn = modal.querySelector("#spinActionBtn");
      const resultText = modal.querySelector("#spinResult");

      // Check if spun today
      const lastSpin = localStorage.getItem("fd_last_spin");
      const today = new Date().toDateString();
      if (lastSpin === today) {
          spinBtn.disabled = true;
          spinBtn.textContent = "COME BACK TOMORROW";
          resultText.textContent = "You already spun today!";
          return;
      }

      spinBtn.onclick = () => {
          spinBtn.disabled = true;
          spinBtn.textContent = "SPINNING...";
          resultText.textContent = "";

          // The wheel has 6 segments: 60 degrees each.
          // 0: FREE DELIVERY, 1: 10% OFF, 2: ₹50 OFF, 3: BETTER LUCK, 4: 20% OFF, 5: BETTER LUCK
          
          // Force a win for demo: hit segment 0, 1, 2 or 4.
          const winningSegments = [0, 1, 2, 4];
          const targetSegment = winningSegments[Math.floor(Math.random() * winningSegments.length)];
          
          // Formula: 5 full spins (360 * 5) + (segment offset to center it under pin)
          // Segment 0 is at top (0-60deg), but we want center so ~30deg.
          // Because wheel rotates clockwise, pin is at 0deg. 
          // To land on segment N (where 0 is yellow, 1 is orange, etc), we need to rotate so segment N is at top.
          const segmentAngle = 60;
          const targetAngle = 360 - (targetSegment * segmentAngle) - (segmentAngle / 2); // Center of segment
          const totalRotation = (360 * 5) + targetAngle;
          
          wheel.style.transform = `rotate(${totalRotation}deg)`;

          setTimeout(() => {
              const prizes = {
                  0: "🎉 You won FREE DELIVERY!",
                  1: "🎉 You won 10% OFF! (Code: WIN10)",
                  2: "🎉 You won ₹50 OFF! (Code: FLAT50)",
                  4: "🎉 You won 20% OFF! (Code: WIN20)"
              };
              
              const prize = prizes[targetSegment];
              resultText.innerHTML = prize;
              spinBtn.textContent = "CLAIMED!";
              
              // Save so they can't spam
              localStorage.setItem("fd_last_spin", today);
              
              // Throw confetti
              toast("Congratulations! " + prize.split("!")[0] + "!");
          }, 4000); // 4 seconds string match the CSS transition
      };
    },
    
    flyToCart(startElement, imageSrc) {
        if (!startElement || !imageSrc) return;
        
        const cartIcon = document.getElementById("cartCount") || document.getElementById("navCartCountMobile");
        if (!cartIcon) return;
        
        const startRect = startElement.getBoundingClientRect();
        const endRect = cartIcon.getBoundingClientRect();
        
        // Create the flying image clone
        const flyer = document.createElement("img");
        flyer.src = imageSrc || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80';
        flyer.className = "creative-flyer";
        
        // Initial positioning
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;

        flyer.style.left = `${startX}px`;
        flyer.style.top = `${startY}px`;
        
        document.body.appendChild(flyer);
        
        // Particle trail interval
        const trailInterval = setInterval(() => {
            const rect = flyer.getBoundingClientRect();
            this.createParticleTrail(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }, 50);

        // Animate with a custom cubic-bezier for the arc effect
        // We'll use CSS for the primary transition but can enhance with JS if needed
        setTimeout(() => {
            flyer.style.left = `${endX}px`;
            flyer.style.top = `${endY}px`;
            flyer.style.transform = "scale(0.2) rotate(720deg)";
            flyer.style.opacity = "0.5";
        }, 10);

        // Cleanup after animation
        setTimeout(() => {
            clearInterval(trailInterval);
            if (document.body.contains(flyer)) flyer.remove();
            
            // Pop effect for cart badge
            cartIcon.classList.remove("cart-pop");
            void cartIcon.offsetWidth; 
            cartIcon.classList.add("cart-pop");
        }, 1000);
    },

    createParticleTrail(x, y) {
        const p = document.createElement("div");
        p.className = "fly-particle";
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        
        // Random drift
        const dx = (Math.random() - 0.5) * 20;
        const dy = (Math.random() - 0.5) * 20;
        p.style.setProperty('--dx', `${dx}px`);
        p.style.setProperty('--dy', `${dy}px`);
        
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
    },

    init3DTilt() {
      const cards = document.querySelectorAll('.tilt-card');
      cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const xc = rect.width / 2;
          const yc = rect.height / 2;
          const dx = x - xc;
          const dy = y - yc;
          const rx = dy / -10;
          const ry = dx / 10;
          card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
      });
    }
  });

  // Bottom nav active
  window.setActiveBottomNav = function () {
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".bottom-nav a").forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      link.classList.toggle("active", href === page);
    });
  };
})();
