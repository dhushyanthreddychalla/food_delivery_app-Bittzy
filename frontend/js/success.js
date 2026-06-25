/**
 * js/success.js - Success Page Logic V2
 * Handles complex tracking animations, order loading, and interactivity.
 */
(function() {
    const orderData = JSON.parse(localStorage.getItem("fd_last_order") || "null");
    
    // UI Elements
    const heroLine = document.getElementById("heroLine");
    const orderIdEl = document.getElementById("orderId");
    const paymentEl = document.getElementById("payment");
    const itemsCountEl = document.getElementById("itemsCount");
    const totalEl = document.getElementById("total");
    const addressEl = document.getElementById("caddr");
    
    function money(n) { return "₹" + (Number(n) || 0).toFixed(0); }

    // Initialize Order Data
    if (!orderData) {
        if (heroLine) heroLine.textContent = "Order data not found. Please try ordering again.";
    } else {
        const cart = orderData.cart || [];
        const sub = cart.reduce((a, x) => a + (x.price || 0) * (x.qty || 0), 0);
        const disc = Number(orderData.discount || 0);
        const total = Math.max(0, sub - disc);

        if (heroLine) heroLine.textContent = `Order #${orderData.id} placed at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        if (orderIdEl) orderIdEl.textContent = orderData.id;
        if (paymentEl) paymentEl.textContent = orderData.payment || "Cash on Delivery";
        if (itemsCountEl) itemsCountEl.textContent = cart.reduce((a, x) => a + (x.qty || 0), 0);
        if (totalEl) totalEl.textContent = money(total);
        if (addressEl) addressEl.textContent = orderData.address?.addr || "Building No 42, Floor 4, Bengaluru";
    }

    // --- Tracking System ---
    const stages = [
        { pct: 15, title: "Order Placed", sub: "We've received your request", step: 1, riderPct: 0, eta: "35 min", m: "Order received by restaurant 📝" },
        { pct: 35, title: "Preparing", sub: "Chef is works their magic 🧑‍🍳", step: 2, riderPct: 10, eta: "25 min", m: "Chef started preparing your meal 🧑‍🍳" },
        { pct: 65, title: "Picked Up", sub: "Rider is heading to you 🛵", step: 3, riderPct: 50, eta: "12 min", m: "Rider picked up your order! 🛵" },
        { pct: 85, title: "Near You", sub: "Almost there! Rider is nearby 📍", step: 3, riderPct: 85, eta: "3 min", m: "Rider is almost at your location 📍" },
        { pct: 100, title: "Delivered", sub: "Bon Appétit! Order delivered ✅", step: 4, riderPct: 100, eta: "Delivered", m: "Order delivered! Enjoy your meal 🍕" }
    ];

    let currentStage = 0;

    function updateTracking() {
        if (currentStage >= stages.length) return;
        const stage = stages[currentStage];
        
        // Update Static Text
        document.getElementById("statusText").textContent = stage.title;
        document.getElementById("statusSub").textContent = stage.sub;
        document.getElementById("eta").textContent = `ETA: ${stage.eta}`;
        
        // Update Steps UI
        const stepEls = document.querySelectorAll(".step");
        stepEls.forEach((el, index) => {
            const stepNum = index + 1;
            el.classList.toggle("active", stepNum === stage.step);
            el.classList.toggle("done", stepNum < stage.step || (stage.step === 4 && stepNum === 4));
        });

        // Milestone Popup
        if (stage.m) {
            const mPop = document.getElementById("milestonePopup");
            const mText = document.getElementById("milestoneText");
            if (mPop && mText) {
                mText.textContent = stage.m;
                mPop.classList.add("active");
                setTimeout(() => mPop.classList.remove("active"), 4000);
            }
        }

        // Update Map / Dash
        const dashProgress = document.getElementById("progressPath");
        const riderGroup = document.getElementById("riderGroup");
        
        if (dashProgress && riderGroup) {
            const totalLen = dashProgress.getTotalLength();
            dashProgress.style.strokeDashoffset = totalLen - (totalLen * (stage.pct / 100));
            
            // Move rider along path
            const point = dashProgress.getPointAtLength(totalLen * (stage.pct / 100));
            riderGroup.setAttribute("transform", `translate(${point.x}, ${point.y - 15})`);
        }

        // Delivered Moment
        if (stage.title === "Delivered") {
            triggerConfetti();
            showRating();
            const tick = document.querySelector(".tick-container");
            if (tick) tick.style.animation = "none"; 
        }

        currentStage++;
        const nextDelay = currentStage === 1 ? 2000 : (currentStage === 4 ? 6000 : 5000);
        setTimeout(updateTracking, nextDelay);
    }

    // --- Confetti Engine ---
    const canvas = document.getElementById("confetti");
    function triggerConfetti() {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const colors = ["#fc8019", "#ff5252", "#10b981", "#6366f1", "#fbbf24"];
        const pieces = [];
        for (let i = 0; i < 150; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: 6 + Math.random() * 6,
                h: 10 + Math.random() * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: -2 + Math.random() * 4,
                vy: 5 + Math.random() * 5,
                r: Math.random() * Math.PI
            });
        }

        const step = () => {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.y += p.vy;
                p.x += p.vx;
                p.r += 0.1;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.r);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
                ctx.restore();
            });
            if (pieces[0].y < canvas.height + 100) requestAnimationFrame(step);
        };
        step();
    }

    // --- Rating System ---
    function showRating() {
        const rating = document.getElementById("ratingSection");
        if (rating) rating.style.display = "block";
    }

    window.rate = function(emoji, el) {
        document.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("active"));
        el.classList.add("active");
        
        const starsMap = { 'Angry': 1, 'Neutral': 3, 'Happy': 4, 'Love': 5 };
        const stars = starsMap[emoji] || 5;
        const orderId = orderData ? orderData.id : "GUEST-" + Date.now();

        const review = { 
            stars: stars, 
            comment: `Emoji feedback: ${emoji}`, 
            date: new Date().toISOString() 
        };
        
        // Save to specific order and global list
        localStorage.setItem(`fd_order_review_${orderId}`, JSON.stringify(review));
        
        const globalReviews = JSON.parse(localStorage.getItem("fd_all_reviews") || "[]");
        globalReviews.unshift({ orderId, ...review, user: localStorage.getItem("fd_user_email") || "Guest" });
        localStorage.setItem("fd_all_reviews", JSON.stringify(globalReviews.slice(0, 10)));

        if (window.toast) window.toast(`Thanks for the ${emoji}! ❤️`, "success");
        else alert("Thanks for your feedback!");

        // Hide rating section after some time
        setTimeout(() => {
            const rs = document.getElementById("ratingSection");
            if(rs) rs.style.display = "none";
        }, 3000);
    };

    // --- Rider Chat Logic ---
    const chatModal = document.getElementById("chatModal");
    const chatBody = document.getElementById("chatBody");
    const chatInput = document.getElementById("chatInput");

    window.openRiderChat = function() {
        if (chatModal) chatModal.style.display = "flex";
    };

    window.closeRiderChat = function() {
        if (chatModal) chatModal.style.display = "none";
    };

    window.sendUserMsg = function() {
        if (!chatInput || !chatBody) return;
        const msg = chatInput.value.trim();
        if (!msg) return;

        // User Message
        const uDiv = document.createElement("div");
        uDiv.className = "msg user";
        uDiv.textContent = msg;
        chatBody.appendChild(uDiv);
        chatInput.value = "";
        chatBody.scrollTop = chatBody.scrollHeight;

        // Rider Response (simulated)
        setTimeout(() => {
            const rDiv = document.createElement("div");
            rDiv.className = "msg rider";
            const responses = [
                "Sure thing! I'll be there soon. 👍",
                "Understood, thanks for letting me know!",
                "I'm at the traffic signal now, will reach in 5 mins.",
                "Yes, I'll make sure it's delivered carefully."
            ];
            rDiv.textContent = responses[Math.floor(Math.random() * responses.length)];
            chatBody.appendChild(rDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 1500);
    };

    // --- Download Receipt ---
    window.downloadReceipt = function() {
        if (!orderData) return toast("No order data to download!", "error");
        
        const items = (orderData.cart || []).map(it => `${it.qty}x ${it.name} - ₹${it.qty * it.price}`).join("\n");
        const receiptText = `
FOOD DELIVERY PREMIUM - ORDER RECEIPT
--------------------------------------
Order ID: #${orderData.id}
Date: ${new Date().toLocaleString()}
Status: DELIVERED

ITEMS:
${items}

TOTAL PAID: ${totalEl ? totalEl.textContent : "N/A"}
PAYMENT: ${paymentEl ? paymentEl.textContent : "N/A"}
DELIVER TO: ${addressEl ? addressEl.textContent : "N/A"}

Thank you for ordering with Food Delivery Premium!
        `.trim();

        const blob = new Blob([receiptText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Receipt_FD_${orderData.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if(window.toast) window.toast("Receipt downloaded! 📄", "success");
    };

    // --- Theme Toggle Integration ---
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const next = window.toggleGlobalTheme();
            themeBtn.textContent = next === "dark" ? "☀️ Light" : "🌙 Dark";
        });
        const current = localStorage.getItem("fd_theme") || "light";
        themeBtn.textContent = current === "dark" ? "☀️ Light" : "🌙 Dark";
    }

    // Start Simulation
    setTimeout(() => {
        const path = document.getElementById("progressPath");
        if (path) path.style.strokeDashoffset = path.getTotalLength(); // Reset
        updateTracking();
    }, 800);

})();
