// js/cart.js (NO imports) - premium cart with animations
(function () {
  const CART_KEY = "fd_cart";
  const DISCOUNT_KEY = "fd_discount";

  const list = document.getElementById("cartList");
  const subEl = document.getElementById("sub");
  const discEl = document.getElementById("disc");
  const totEl = document.getElementById("tot");
  const msg = document.getElementById("msg");
  const badge = document.getElementById("cartCount");
  const itemsMini = document.getElementById("itemsMini");

  const couponInput = document.getElementById("coupon");
  const applyBtn = document.getElementById("applyCoupon");
  const toastEl = document.getElementById("toast");

  let discount = Number(localStorage.getItem(DISCOUNT_KEY) || 0);

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
  }
  function cartCount() {
    return getCart().reduce((a, x) => a + (Number(x.qty) || 0), 0);
  }
  function money(n){ return "₹" + (Number(n)||0).toFixed(0); }

  function toast(text){
    if(!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(window.__t);
    window.__t = setTimeout(()=> toastEl.classList.remove("show"), 1100);
  }

  function calcTotals(cart){
    const sub = cart.reduce((a,x)=>a + (Number(x.price)||0)*(Number(x.qty)||0), 0);
    const total = Math.max(0, sub - discount);

    subEl.textContent = money(sub);
    discEl.textContent = "-" + money(discount);
    totEl.textContent = money(total);

    const count = cartCount();
    if (badge) badge.textContent = String(count);
    if (itemsMini) itemsMini.textContent = `${count} items`;

    // clear coupon message if cart empty
    if(!cart.length){
      msg.textContent = "";
      msg.className = "msg";
    }
    // update split if open
    if (typeof updateSplitUI === 'function') {
      updateSplitUI(total);
    }
  }

  function itemHtml(x){
    return `
      <div class="item" data-row="${x.id}">
        <div class="left">
          <img class="thumb" src="${x.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}" alt="">
          <div class="meta">
            <div class="name">${x.name || "Item"}</div>
            <div class="sub">${money(x.price)} <span class="each">each</span></div>
          </div>
        </div>

        <div class="right">
          <div class="qty">
            <button class="qbtn" data-dec="${x.id}" aria-label="decrease">-</button>
            <span class="qval">${x.qty}</span>
            <button class="qbtn" data-inc="${x.id}" aria-label="increase">+</button>
          </div>
          <div class="lineTotal">${money((Number(x.price)||0) * (Number(x.qty)||0))}</div>
          <button class="rm" data-del="${x.id}">Remove</button>
        </div>
      </div>
    `;
  }

  function render(){
    const cart = getCart();

    if(!cart.length){
      list.innerHTML = `
        <div class="empty stagger-in">
          <div style="font-size: 80px; margin-bottom: 20px;">🛒</div>
          <h3 style="font-size: 24px; font-weight: 1000;">Your cart is empty</h3>
          <p style="color: var(--muted); font-weight: 700;">Add some delicious items from our menu!</p>
          <a class="goMenu" href="menu.html" style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: var(--orange); color: white; border-radius: 14px; text-decoration: none; font-weight: 1000; box-shadow: 0 10px 20px rgba(252,128,25,0.2);">Go to Menu</a>
        </div>
      `;
      discount = 0;
      localStorage.removeItem(DISCOUNT_KEY);
      calcTotals(cart);
      return;
    }

    list.innerHTML = cart.map((x, i) => `
      <div class="stagger-in" style="animation-delay: ${i * 0.1}s">
        ${itemHtml(x)}
      </div>
    `).join("");
    
    // Smooth counter for total
    animatePriceCounter();
    calcTotals(cart);
  }

  function animatePriceCounter() {
    const totEl = document.getElementById("tot");
    if (!totEl) return;
    
    const cart = getCart();
    const sub = cart.reduce((a,x)=>a + (Number(x.price)||0)*(Number(x.qty)||0), 0);
    const target = Math.max(0, sub - discount);
    
    const current = parseInt(totEl.textContent.replace(/\D/g, '')) || 0;
    if (current === target) return;

    let start = current;
    const duration = 500;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const val = Math.floor(start + (target - start) * ease);
      totEl.textContent = money(val);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function bumpRow(id){
    const row = document.querySelector(`[data-row="${id}"]`);
    if(!row) return;
    row.animate(
      [{transform:"scale(1)"},{transform:"scale(0.98)"},{transform:"scale(1)"}],
      {duration:220,easing:"ease-out"}
    );
  }

  // + / - / remove
  document.addEventListener("click", (e)=>{
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const del = e.target.closest("[data-del]");

    if(inc){
      const id = inc.dataset.inc;
      const cart = getCart();
      const it = cart.find(x=>x.id===id);
      if(it) it.qty = (Number(it.qty)||0)+1;
      saveCart(cart);
      bumpRow(id);
      toast("Quantity updated ✅");
      render();
    }

    if(dec){
      const id = dec.dataset.dec;
      const cart = getCart();
      const it = cart.find(x=>x.id===id);
      if(it) it.qty = (Number(it.qty)||0)-1;
      const filtered = cart.filter(x=>(Number(x.qty)||0)>0);
      saveCart(filtered);
      bumpRow(id);
      toast("Quantity updated ✅");
      render();
    }

    if(del){
      const id = del.dataset.del;
      const row = document.querySelector(`[data-row="${id}"]`);
      // nice remove animation
      if(row){
        row.animate([{opacity:1, transform:"translateY(0)"},{opacity:0, transform:"translateY(8px)"}],
          {duration:220,easing:"ease-out"}
        ).onfinish = () => {
          const cart = getCart().filter(x=>x.id!==id);
          saveCart(cart);
          toast("Removed ✅");
          render();
        };
      } else {
        const cart = getCart().filter(x=>x.id!==id);
        saveCart(cart);
        render();
      }
    }
  });

  // clear cart
  document.getElementById("clearCart")?.addEventListener("click", ()=>{
    saveCart([]);
    discount = 0;
    localStorage.removeItem(DISCOUNT_KEY);
    toast("Cart cleared 🧹");
    render();
  });

  // coupon
  applyBtn?.addEventListener("click", ()=>{
    const cart = getCart();
    const sub = cart.reduce((a,x)=>a + (Number(x.price)||0)*(Number(x.qty)||0), 0);
    const code = (couponInput.value || "").trim().toUpperCase();

    if(code === "FIRST30" && sub >= 200){
      discount = Math.round(sub * 0.30);
      localStorage.setItem(DISCOUNT_KEY, String(discount));
      msg.textContent = "✅ Coupon applied: 30% OFF";
      msg.className = "msg ok";
      toast("Coupon applied 🎉");
    } else if (code === "WELCOME50" && sub >= 400) {
      discount = Math.round(sub * 0.50);
      localStorage.setItem(DISCOUNT_KEY, String(discount));
      msg.textContent = "✅ Coupon applied: 50% OFF";
      msg.className = "msg ok";
      toast("Coupon applied 🎊");
    } else {
      discount = 0;
      localStorage.removeItem(DISCOUNT_KEY);
      msg.textContent = code === "WELCOME50" ? "❌ WELCOME50 needs min ₹400" : "❌ Invalid coupon (FIRST30, min ₹200)";
      msg.className = "msg bad";
      toast("Invalid coupon ❌");
    }
    calcTotals(cart);
  });

  // click a coupon tag to fill the input
  const tags = document.querySelectorAll(".couponTag");
  tags.forEach(t => {
    t.addEventListener("click", () => {
      couponInput.value = t.dataset.code;
      // optional visual feedback
      t.style.transform = "scale(0.95)";
      setTimeout(() => t.style.transform="scale(1)", 150);
    });
  });

  // ✅ checkout click -> open checkout page (address + payment)
  document.getElementById("goCheckout")?.addEventListener("click", ()=>{
    const cart = getCart();
    if(!cart.length) return alert("Cart empty!");
    // keep discount for checkout summary
    localStorage.setItem(DISCOUNT_KEY, String(discount || 0));
    window.location.href = "checkout.html";
  });

  // Split Bill Logic
  const splitBtn = document.getElementById("splitBillBtn");
  const splitUI = document.getElementById("splitUI");
  const splitCount = document.getElementById("splitCount");
  const splitAmt = document.getElementById("splitAmt");
  const splitDec = document.getElementById("splitDec");
  const splitInc = document.getElementById("splitInc");
  
  let splitPeople = 2;
  
  window.updateSplitUI = function(passedTotal) {
    if(!splitUI || splitUI.style.display === "none") return;
    
    let total = passedTotal;
    if(total === undefined) {
        const cart = getCart();
        const sub = cart.reduce((a,x)=>a + (Number(x.price)||0)*(Number(x.qty)||0), 0);
        total = Math.max(0, sub - discount);
    }
    
    if (total === 0) {
        splitAmt.textContent = "₹0.00";
    } else {
        const perPerson = total / splitPeople;
        splitAmt.textContent = "₹" + perPerson.toFixed(2);
    }
    splitCount.textContent = splitPeople;
  };
  
  splitBtn?.addEventListener("click", () => {
    splitUI.style.display = splitUI.style.display === "none" ? "block" : "none";
    updateSplitUI();
  });
  
  splitDec?.addEventListener("click", () => {
    if(splitPeople > 1) {
        splitPeople--;
        updateSplitUI();
    }
  });
  
  splitInc?.addEventListener("click", () => {
    splitPeople++;
    updateSplitUI();
  });

  // Theme Toggle
  const themeToggle = document.getElementById("themeToggle");
  themeToggle?.addEventListener("click", () => {
    const next = window.toggleGlobalTheme();
    if(themeToggle) themeToggle.textContent = next === "dark" ? "☀️ Light" : "🌙 Dark";
  });
  const currentTheme = localStorage.getItem("fd_theme") || "light";
  if(themeToggle) themeToggle.textContent = currentTheme === "dark" ? "☀️ Light" : "🌙 Dark";

  // Green Delivery Logic
  const greenToggle = document.getElementById("greenToggle");
  const earthIcon = document.getElementById("earthIcon");
  const greenBox = document.getElementById("greenDeliveryBox");
  
  greenToggle?.addEventListener("change", () => {
    const isGreen = greenToggle.checked;
    localStorage.setItem("fd_green_delivery", isGreen);
    
    if (isGreen) {
      earthIcon.style.transform = "scale(1.5) rotate(360deg)";
      greenBox.style.background = "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))";
      greenBox.style.borderColor = "#22c55e";
      toast("Green Warrior mode activated! 🌍✨");
      addGreenBadge();
    } else {
      earthIcon.style.transform = "scale(1) rotate(0deg)";
      greenBox.style.background = "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))";
      greenBox.style.borderColor = "rgba(34,197,94,0.2)";
      removeGreenBadge();
    }
  });

  function addGreenBadge() {
    if (document.getElementById("greenBadge")) return;
    const navRight = document.querySelector(".navRight");
    if (!navRight) return;
    const badge = document.createElement("div");
    badge.id = "greenBadge";
    badge.className = "pill";
    badge.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
    badge.style.color = "white";
    badge.style.fontWeight = "1000";
    badge.style.fontSize = "11px";
    badge.style.padding = "6px 12px";
    badge.style.borderRadius = "999px";
    badge.style.marginRight = "10px";
    badge.style.boxShadow = "0 4px 10px rgba(34,197,94,0.3)";
    badge.textContent = "🌍 GREEN WARRIOR";
    navRight.insertBefore(badge, navRight.firstChild);
  }

  function removeGreenBadge() {
    document.getElementById("greenBadge")?.remove();
  }

  // Init green delivery state
  const initGreen = localStorage.getItem("fd_green_delivery") === "true";
  if (greenToggle) {
    greenToggle.checked = initGreen;
    if (initGreen) {
      earthIcon.style.transform = "scale(1.5) rotate(360deg)";
      addGreenBadge();
    }
  }

  // init
  render();
  window.addEventListener("focus", render);
})();