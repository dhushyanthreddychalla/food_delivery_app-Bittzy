// js/auth.js
// =====================================
// AUTH + NAVBAR + CART BADGE (FINAL)
// =====================================

const AUTH = {
  // ----- storage keys -----
  keyLoggedIn: "fd_logged_in",
  keyEmail: "fd_user_email",
  cartKey: "fd_cart",

  // ----- auth status -----
  isLoggedIn() {
    return localStorage.getItem(this.keyLoggedIn) === "true";
  },

  login(email) {
    localStorage.setItem(this.keyLoggedIn, "true");
    localStorage.setItem(this.keyEmail, email || "Guest");
  },

  logout() {
    localStorage.removeItem(this.keyLoggedIn);
    localStorage.removeItem(this.keyEmail);
  },

  getEmail() {
    return localStorage.getItem(this.keyEmail) || "Guest";
  },

  // ----- route guard (cart / checkout) -----
  requireLogin() {
    if (!this.isLoggedIn()) {
      const next = encodeURIComponent(
        window.location.pathname.split("/").pop()
      );
      window.location.href = `login.html?next=${next}`;
      return false;
    }
    return true;
  },

  // ----- cart helpers -----
  getCart() {
    return JSON.parse(localStorage.getItem(this.cartKey) || "[]");
  },

  getCartCount() {
    const cart = this.getCart();
    // sum of quantities
    return cart.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  },

  // ----- cart badge update -----
  updateCartBadge(animate = true) {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    const newCount = this.getCartCount();
    const oldCount = Number(badge.textContent || 0);

    badge.textContent = newCount;

    // hide when zero
    badge.style.display = newCount > 0 ? "inline-grid" : "none";

    // bump animation when changed
    if (animate && newCount !== oldCount) {
      badge.classList.remove("bump");
      void badge.offsetWidth; // force reflow
      badge.classList.add("bump");
    }
  },

  // ----- navbar sync -----
  syncNavbar() {
    const userBadge = document.getElementById("userBadge");
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    // user badge
    if (userBadge) {
      const email = this.getEmail();
      const isLogged = this.isLoggedIn();
      if (isLogged) {
        userBadge.innerHTML = `<a href="profile.html" style="text-decoration:none; color:inherit; display:flex; align-items:center; gap:8px;">👤 ${email}</a>`;
        userBadge.style.cursor = "pointer";
      } else {
        userBadge.textContent = "👤 Guest";
        userBadge.style.cursor = "default";
      }
    }

    // login / logout buttons
    if (loginBtn) {
      loginBtn.style.display = this.isLoggedIn() ? "none" : "inline-flex";
    }

    if (logoutBtn) {
      logoutBtn.style.display = this.isLoggedIn() ? "inline-flex" : "none";
      logoutBtn.onclick = () => {
        this.logout();
        window.location.href = "index.html";
      };
    }

    // initial cart badge render
    this.updateCartBadge(false);
  }
};

// ----- init on page load -----
document.addEventListener("DOMContentLoaded", () => {
  AUTH.syncNavbar();
});

// ----- sync badge across tabs / windows -----
window.addEventListener("storage", (e) => {
  if (e.key === AUTH.cartKey) {
    AUTH.updateCartBadge(true);
  }
});
