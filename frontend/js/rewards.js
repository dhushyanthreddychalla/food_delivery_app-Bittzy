/**
 * Daily Reward System - Spin the Wheel logic
 */
const REWARDS = {
  KEY: "fd_daily_reward_last_spin",
  COUPONS_KEY: "fd_coupons",
  WALLET_KEY: "fd_wallet_balance",
  TRANSACTIONS_KEY: "fd_transactions",

  prizes: [
    { label: "₹10 Wallet", type: "wallet", val: 10, color: "#ff4d4d" },
    { label: "30% OFF", type: "coupon", val: "SPIN30", color: "#fc8019" },
    { label: "₹50 Wallet", type: "wallet", val: 50, color: "#4ade80" },
    { label: "FREE DEL", type: "coupon", val: "FREESHIP", color: "#6c63ff" },
    { label: "₹5 Wallet", type: "wallet", val: 5, color: "#3b82f6" },
    { label: "Better Luck", type: "none", val: 0, color: "#94a3b8" }
  ],

  canSpin() {
    const last = localStorage.getItem(this.KEY);
    if (!last) return true;
    const lastDate = new Date(parseInt(last)).toDateString();
    const today = new Date().toDateString();
    return lastDate !== today;
  },

  spin() {
    if (!this.canSpin()) return null;
    
    // Randomly pick a prize
    const idx = Math.floor(Math.random() * this.prizes.length);
    const prize = this.prizes[idx];
    
    localStorage.setItem(this.KEY, Date.now().toString());
    
    if (prize.type === "wallet") {
      this.addWallet(prize.val);
    } else if (prize.type === "coupon") {
      this.addCoupon(prize.val);
    }
    
    return { ...prize, index: idx };
  },

  addWallet(amt) {
    let bal = parseFloat(localStorage.getItem(this.WALLET_KEY) || "0");
    bal += amt;
    localStorage.setItem(this.WALLET_KEY, bal.toFixed(2));
    
    const txs = JSON.parse(localStorage.getItem(this.TRANSACTIONS_KEY) || "[]");
    txs.unshift({
      type: "credit",
      desc: "Daily Reward Win",
      amount: amt,
      date: "Just now"
    });
    localStorage.setItem(this.TRANSACTIONS_KEY, JSON.stringify(txs.slice(0, 10)));
  },

  addCoupon(code) {
    const coupons = JSON.parse(localStorage.getItem(this.COUPONS_KEY) || "[]");
    if (!coupons.includes(code)) {
      coupons.push(code);
      localStorage.setItem(this.COUPONS_KEY, JSON.stringify(coupons));
    }
  }
};

window.DailyRewards = REWARDS;
