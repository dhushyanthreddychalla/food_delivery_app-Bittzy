const CART_KEY = "fd_cart";
const FAV_KEY = "favorites";

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}
function getFav(){
  return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
}

/* Cart badge */
function updateCartBadge(){
  const cart = getCart();
  const count = cart.reduce((a,x)=>a + (x.qty || 1), 0);

  document.querySelectorAll(".cart-badge").forEach(b=>{
    b.textContent = count;
    b.style.display = count > 0 ? "inline-flex" : "none";
  });
}

/* Fav badge (future use) */
function updateFavBadge(){
  const favs = getFav();
  document.querySelectorAll(".fav-badge").forEach(b=>{
    b.textContent = favs.length;
    b.style.display = favs.length > 0 ? "inline-flex" : "none";
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  updateCartBadge();
  updateFavBadge();
});
