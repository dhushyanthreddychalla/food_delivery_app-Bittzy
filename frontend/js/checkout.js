// js/checkout.js
// Checkout: show summary + validate address + payment + place order

if (!AUTH.requireLogin()) return;

const cartKey = "fd_cart";
const couponKey = "fd_coupon";

const sumList = document.getElementById("sumList");
const subEl = document.getElementById("sub");
const delEl = document.getElementById("del");
const discEl = document.getElementById("disc");
const totEl = document.getElementById("tot");
const msg = document.getElementById("msg");

const form = document.getElementById("checkoutForm");
const upiBox = document.getElementById("upiBox");
const cardBox = document.getElementById("cardBox");

const couponInput = document.getElementById("couponInput");
const applyBtn = document.getElementById("applyCoupon");
const couponMsg = document.getElementById("couponMsg");

function getCart(){ return JSON.parse(localStorage.getItem(cartKey) || "[]"); }
function money(n){ return "₹" + Math.max(0, Math.round(n)); }

function calcSubtotal(cart){
  return cart.reduce((s,it)=> s + (Number(it.qty)||0)*(Number(it.price)||0), 0);
}

function calcDiscount(subtotal){
  const code = (localStorage.getItem(couponKey) || "").trim().toUpperCase();
  if(!code || subtotal <= 0) return 0;

  if(code === "FIRST30"){
    return Math.min(Math.round(subtotal * 0.30), 120);
  }
  if(code === "FDGOLD"){
    return Math.min(Math.round(subtotal * 0.50), 200);
  }
  if(code === "FREEDEL"){
    return 30; // covers delivery fee
  }
  return 0;
}

function renderSummary(){
  const cart = getCart();
  if(cart.length === 0){
    alert("Cart is empty");
    window.location.href = "menu.html";
    return;
  }

  sumList.innerHTML = "";
  cart.forEach(it=>{
    const row = document.createElement("div");
    row.className = "sumRow";
    row.innerHTML = `
      <div>
        <b>${it.name}</b><br/>
        <span class="small">${it.qty} × ₹${it.price}</span>
      </div>
      <b style="color:#ff6a00;">${money(it.qty*it.price)}</b>
    `;
    sumList.appendChild(row);
  });

  const subtotal = calcSubtotal(cart);
  const discount = calcDiscount(subtotal);
  const deliveryFee = 30;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  subEl.textContent = money(subtotal);
  delEl.textContent = money(deliveryFee);
  discEl.textContent = "-" + money(discount);
  totEl.textContent = money(total);

  // Update coupon UI
  const currentCode = localStorage.getItem(couponKey);
  if(currentCode){
    couponInput.value = currentCode;
    couponMsg.textContent = "✅ Coupon Applied!";
    couponMsg.style.color = "var(--ok)";
  }

  // Update Wallet Display
  const walletDisp = document.getElementById("walletDisp");
  if (walletDisp) {
    const bal = parseFloat(localStorage.getItem("fd_wallet_balance") || "0");
    walletDisp.textContent = `Bal: ₹${bal.toFixed(2)}`;
  }
}

applyBtn?.addEventListener("click", ()=>{
  const code = couponInput.value.trim().toUpperCase();
  if(!code){
    localStorage.removeItem(couponKey);
    couponMsg.textContent = "";
    renderSummary();
    return;
  }

  const valid = ["FIRST30", "FDGOLD", "FREEDEL"];
  if(valid.includes(code)){
    localStorage.setItem(couponKey, code);
    couponMsg.textContent = "🎉 Awesome! Code applied.";
    couponMsg.style.color = "var(--ok)";
    renderSummary();
  } else {
    couponMsg.textContent = "❌ Invalid coupon code.";
    couponMsg.style.color = "var(--bad)";
  }
});

function showPaymentBoxes(){
  const pay = document.querySelector('input[name="pay"]:checked')?.value || "COD";
  upiBox.style.display = (pay === "UPI") ? "block" : "none";
  cardBox.style.display = (pay === "CARD") ? "block" : "none";
}

document.querySelectorAll('input[name="pay"]').forEach(r=>{
  r.addEventListener("change", showPaymentBoxes);
});

form.addEventListener("submit", (e)=>{
  e.preventDefault();

  const cart = getCart();
  if(cart.length === 0){
    alert("Cart empty");
    return;
  }

  // address validate
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const house = document.getElementById("house").value.trim();
  const area = document.getElementById("area").value.trim();
  const city = document.getElementById("city").value.trim();
  const pin = document.getElementById("pin").value.trim();
  const landmark = document.getElementById("landmark").value.trim();

  if(!name || !phone || !house || !area || !city || !pin){
    msg.textContent = "❌ Please fill all required address fields.";
    return;
  }
  if(!/^\d{10}$/.test(phone)){
    msg.textContent = "❌ Phone must be 10 digits.";
    return;
  }
  if(!/^\d{6}$/.test(pin)){
    msg.textContent = "❌ Pincode must be 6 digits.";
    return;
  }

  // payment validate
  const pay = document.querySelector('input[name="pay"]:checked')?.value || "COD";
  if(pay === "UPI"){
    const upi = document.getElementById("upi").value.trim();
    if(!upi || !upi.includes("@")){
      msg.textContent = "❌ Enter valid UPI ID.";
      return;
    }
  }
  if(pay === "CARD"){
    const cardNo = document.getElementById("cardNo").value.trim();
    const exp = document.getElementById("exp").value.trim();
    const holder = document.getElementById("holder").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    if(!/^\d{16}$/.test(cardNo)){
      msg.textContent = "❌ Card number must be 16 digits.";
      return;
    }
    if(!/^\d{2}\/\d{2}$/.test(exp)){
      msg.textContent = "❌ Expiry must be MM/YY.";
      return;
    }
    if(!holder){
      msg.textContent = "❌ Card holder name required.";
      return;
    }
    if(!/^\d{3}$/.test(cvv)){
      msg.textContent = "❌ CVV must be 3 digits.";
      return;
    }
  }

  const subtotal = calcSubtotal(cart);
  const discount = calcDiscount(subtotal);
  const total = Math.max(0, subtotal + 30 - discount);

  if(pay === "WALLET"){
    const bal = parseFloat(localStorage.getItem("fd_wallet_balance") || "0");
    if(bal < total){
      msg.textContent = `❌ Insufficient wallet balance (Current: ₹${bal.toFixed(2)}). Please use another method.`;
      return;
    }
  }

  // ALL OK - Place Order
  const overlay = document.getElementById("processingOverlay");
  const loaderFood = document.getElementById("loaderFood");
  const foods = ['🥘', '🍕', '🍔', '🍣', '🍱', '🥟'];
  let foodIdx = 0;
  let foodInterval = null;

  if (overlay) {
    overlay.classList.add("active");
    msg.textContent = ""; 

    foodInterval = setInterval(() => {
      foodIdx = (foodIdx + 1) % foods.length;
      if (loaderFood) loaderFood.textContent = foods[foodIdx];
    }, 400);
  } else {
    msg.textContent = "✅ Processing Payment...";
    msg.className = "msg ok";
  }

  const orderObj = {
    id: "ORD" + Math.floor(Math.random()*.9e10),
    payment: pay,
    cart: cart,
    discount: discount,
    address: {
      name, phone, addr: house+" "+area, city, pin
    }
  };

  // Simulate API delay
  setTimeout(() => {
    if (foodInterval) clearInterval(foodInterval);
    localStorage.setItem("fd_last_order", JSON.stringify(orderObj));
    
    // Maintain Order History
    try {
      const history = JSON.parse(localStorage.getItem("fd_order_history") || "[]");
      history.unshift(orderObj);
      localStorage.setItem("fd_order_history", JSON.stringify(history.slice(0, 50)));
    } catch(e) { console.error("History error", e); }

    // Deduct Wallet Balance if used
    if (pay === "WALLET") {
        let bal = parseFloat(localStorage.getItem("fd_wallet_balance") || "0");
        bal -= total;
        localStorage.setItem("fd_wallet_balance", bal.toFixed(2));

        const transactions = JSON.parse(localStorage.getItem("fd_transactions") || "[]");
        transactions.unshift({
            type: "debit",
            desc: `Ordered: #${orderObj.id}`,
            amount: total,
            date: "Just now"
        });
        localStorage.setItem("fd_transactions", JSON.stringify(transactions.slice(0, 10)));
    }

    localStorage.removeItem(cartKey);
    localStorage.removeItem(couponKey);
    
    // Trigger Notification
    if (window.NOTIFICATIONS) {
      window.NOTIFICATIONS.add("Order Placed! 📝", `Your order #${orderObj.id} is being prepared.`, "info");
    }

    // Open success page
    window.location.href = "success.html";
  }, 1500);
});

// Init
renderSummary();
showPaymentBoxes();
