/**
 * Notification Center System
 * Manages notifications in localStorage and handles UI updates.
 */

const NOTIFS_KEY = "fd_notifications";

const NOTIFICATIONS = {
  get() {
    return JSON.parse(localStorage.getItem(NOTIFS_KEY) || "[]");
  },

  add(title, message, type = "info") {
    const notifs = this.get();
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      time: "Just now",
      read: false
    };
    notifs.unshift(newNotif);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
    this.updateCount();
    this.render();
  },

  markAllAsRead() {
    const notifs = this.get().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
    this.updateCount();
    this.render();
  },

  updateCount() {
    const unread = this.get().filter(n => !n.read).length;
    document.querySelectorAll(".notifBadge").forEach(b => {
      b.textContent = unread;
      b.style.display = unread > 0 ? "flex" : "none";
    });
  },

  init() {
    // Initial mock notifications if empty
    if (this.get().length === 0) {
      this.add("Welcome to Food Delivery!", "Get 30% OFF on your first order with code FIRST30.", "offer");
      this.add("Gold Membership Benefits", "Tap your Gold Badge to see what you get!", "info");
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest("#notifBtn")) {
        this.toggleDrawer();
      } else if (e.target.closest("#closeNotifs") || e.target.classList.contains("drawer-overlay")) {
        this.closeDrawer();
      }
    });

    this.updateCount();
  },

  toggleDrawer() {
    let drawer = document.getElementById("notifDrawer");
    let overlay = document.getElementById("drawerOverlay");

    if (!drawer) {
      this.createDrawer();
      drawer = document.getElementById("notifDrawer");
      overlay = document.getElementById("drawerOverlay");
    }

    const isOpen = drawer.classList.contains("open");
    if (isOpen) {
      this.closeDrawer();
    } else {
      overlay.style.display = "block";
      setTimeout(() => {
        drawer.classList.add("open");
        overlay.classList.add("active");
        this.render();
      }, 10);
      this.markAllAsRead();
    }
  },

  closeDrawer() {
    const drawer = document.getElementById("notifDrawer");
    const overlay = document.getElementById("drawerOverlay");
    if (drawer) {
      drawer.classList.remove("open");
      overlay.classList.remove("active");
      setTimeout(() => {
        overlay.style.display = "none";
      }, 300);
    }
  },

  createDrawer() {
    const overlay = document.createElement("div");
    overlay.id = "drawerOverlay";
    overlay.className = "drawer-overlay";
    document.body.appendChild(overlay);

    const drawer = document.createElement("div");
    drawer.id = "notifDrawer";
    drawer.className = "notif-drawer";
    drawer.innerHTML = `
      <div class="drawer-header">
        <h3>Notifications 🔔</h3>
        <button id="closeNotifs" class="btn-close">✕</button>
      </div>
      <div id="notifList" class="drawer-content"></div>
    `;
    document.body.appendChild(drawer);
  },

  render() {
    const list = document.getElementById("notifList");
    if (!list) return;
    const notifs = this.get();

    if (notifs.length === 0) {
      list.innerHTML = `<div class="empty-state">No notifications yet</div>`;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? 'read' : 'unread'}">
        <div class="notif-icon">${n.type === 'offer' ? '🎁' : '🔔'}</div>
        <div class="notif-text">
          <div class="notif-title">${n.title}</div>
          <div class="notif-message">${n.message}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join("");
  }
};

document.addEventListener("DOMContentLoaded", () => NOTIFICATIONS.init());
window.NOTIFICATIONS = NOTIFICATIONS;
