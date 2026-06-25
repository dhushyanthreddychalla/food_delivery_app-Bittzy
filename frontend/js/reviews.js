/**
 * js/reviews.js
 * Handles order review submission and management
 */
const REVIEWS = (function() {
    let activeReviewOrderId = null;
    let selectedRating = 0;

    function init() {
        const reviewModal = document.getElementById("reviewModal");
        const starPicker = document.getElementById("reviewStarPicker");
        const submitBtn = document.getElementById("submitOrderReview");
        const cancelBtn = document.getElementById("cancelOrderReview");
        const closeBtn = document.getElementById("closeReviewModal");
        const reviewText = document.getElementById("reviewOrderText");

        if (!reviewModal || !starPicker) return;

        // Star Selection
        starPicker.addEventListener("click", (e) => {
            const star = e.target.closest(".star-item");
            if (!star) return;
            selectedRating = parseInt(star.dataset.val);
            updateStars(selectedRating);
        });

        // Submit
        submitBtn.onclick = () => {
            const comment = reviewText.value.trim();
            if (selectedRating === 0) {
                showNotification("Please select a rating!");
                return;
            }
            if (!comment) {
                showNotification("Please write a comment!");
                return;
            }

            const review = { 
                stars: selectedRating, 
                comment, 
                date: new Date().toISOString() 
            };
            localStorage.setItem(`fd_order_review_${activeReviewOrderId}`, JSON.stringify(review));
            
            // Add to a global list of reviews for "Recent Activity"
            const globalReviews = JSON.parse(localStorage.getItem("fd_all_reviews") || "[]");
            globalReviews.unshift({
                orderId: activeReviewOrderId,
                ...review,
                user: localStorage.getItem("fd_user_email") || "Guest"
            });
            localStorage.setItem("fd_all_reviews", JSON.stringify(globalReviews.slice(0, 10)));

            closeModal();
            showNotification("Review posted successfully! ✅", "success");
            
            // Reload if on profile page to show update
            if (window.location.pathname.includes("profile.html")) {
                setTimeout(() => window.location.reload(), 1000);
            }
        };

        const closeModal = () => {
            reviewModal.style.display = "none";
            resetForm();
        };

        const resetForm = () => {
            selectedRating = 0;
            reviewText.value = "";
            updateStars(0);
        };

        cancelBtn.onclick = closeModal;
        closeBtn.onclick = closeModal;

        window.onclick = (e) => {
            if (e.target === reviewModal) closeModal();
        };
    }

    function updateStars(rating) {
        const stars = document.querySelectorAll("#reviewStarPicker .star-item");
        stars.forEach((s, i) => {
            s.style.opacity = (i < rating) ? "1" : "0.3";
            s.style.transform = (i < rating) ? "scale(1.2)" : "scale(1)";
            s.style.color = (i < rating) ? "#ffb800" : "inherit";
        });
    }

    function openReviewModal(orderId) {
        activeReviewOrderId = orderId;
        const title = document.getElementById("reviewOrderTitle");
        const modal = document.getElementById("reviewModal");
        if (title) title.textContent = `Rate Order #${orderId}`;
        if (modal) modal.style.display = "flex";
    }

    function showNotification(msg, type = "error") {
        if (window.NOTIFICATIONS) {
            window.NOTIFICATIONS.show(msg, type);
        } else {
            alert(msg);
        }
    }

    return {
        init,
        openReviewModal
    };
})();

document.addEventListener("DOMContentLoaded", REVIEWS.init);
