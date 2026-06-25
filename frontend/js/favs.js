/**
 * Favorites Management System
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof AUTH !== 'undefined' && !AUTH.isLoggedIn()) {
    window.location.href = "login.html?next=favorites.html";
    return;
  }

  const favGrid = document.getElementById("favGrid");

  // Mock Menu Data (to resolve IDs) - Shared or centrally managed in a real app
  const menuData = [
    { id: "p1", name: "Margherita Pizza", price: 199, img: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?w=400" },
    { id: "p2", name: "Farmhouse Pizza", price: 299, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
    { id: "b1", name: "Classic Burger", price: 149, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
    { id: "s1", name: "Chocolate Shake", price: 129, img: "img/shakes.png" },
    { id: "pa1", name: "Creamy Pasta", price: 189, img: "img/pasta.png" }
  ];

  const renderFavs = () => {
    const currentFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!favGrid) return;

    if (currentFavs.length === 0) {
      favGrid.innerHTML = `
        <div class="card card-anim" style="grid-column: 1/-1; text-align:center; padding:40px;">
          <div style="font-size:48px; margin-bottom:15px;">❤️</div>
          <h3 style="margin:0;">No favorites yet</h3>
          <p class="desc" style="color:var(--muted); margin-top:8px;">Go to Menu and tap 🤍 to save items here!</p>
          <div class="actions" style="justify-content:center; margin-top:20px;">
            <a class="btn" href="menu.html" style="background:var(--orange); color:white; padding:12px 24px; border-radius:12px; text-decoration:none; font-weight:1000;">Open Menu</a>
          </div>
        </div>
      `;
      return;
    }

    favGrid.innerHTML = currentFavs.map((id, i) => {
      const item = menuData.find(m => m.id === id) || { id, name: "Special Item", price: 199, img: "https://via.placeholder.com/400x300?text=Food" };
      return `
        <div class="fav-item-card tilt-card stagger-in" style="animation-delay: ${i * 0.1}s">
          <img class="fav-img" src="${item.img}" alt="${item.name}">
          <div class="fav-info">
            <div class="fav-name">${item.name}</div>
            <div class="fav-price">₹${item.price}</div>
            <div class="fav-actions">
              <button class="pill btn-premium" style="height:36px; color:white; border:none; flex:1; font-weight:800; cursor:pointer;" onclick="addToCartFromFav('${item.id}', '${item.name}', ${item.price})">🛒 Add</button>
              <button class="pill ghost" style="height:36px; border:1px solid rgba(255,0,0,0.1); color:#ff4d4d; width:40px; cursor:pointer;" onclick="removeFromFav('${item.id}')">✕</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    if (window.UI) window.UI.init3DTilt();
  };

  // Floating Icons Init
  const foodEmojis = ['🍕', '🍔', '🍣', '🍱', '🥟', '🥘', '🥙', '🍰', '🍦'];
  const container = document.getElementById('floatingIcons');
  if (container) {
    for (let i = 0; i < 15; i++) {
      const el = document.createElement('div');
      el.className = 'floating-food';
      el.textContent = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = Math.random() * 100 + 'vh';
      el.style.animationDelay = Math.random() * 5 + 's';
      el.style.fontSize = (Math.random() * 20 + 20) + 'px';
      container.appendChild(el);
    }
  }

  window.addToCartFromFav = (id, name, price) => {
    const cart = JSON.parse(localStorage.getItem("fd_cart") || "[]");
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price, qty: 1 });
    localStorage.setItem("fd_cart", JSON.stringify(cart));
    if (window.updateCartBadge) window.updateCartBadge();
    if (window.toast) window.toast("Added to cart! 🛒");
    else alert("Added to cart! 🛒");
  };

  window.removeFromFav = (id) => {
    let currentFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
    currentFavs = currentFavs.filter(f => f !== id);
    localStorage.setItem("favorites", JSON.stringify(currentFavs));
    renderFavs();
    if (window.toast) window.toast("Removed from favorites ❤️");
  };

  renderFavs();
});
