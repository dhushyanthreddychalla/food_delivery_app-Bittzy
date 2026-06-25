/**
 * js/recs.js
 * Smart Recommendation Engine
 */
const RECS = (function() {
    const HISTORY_KEY = "fd_order_history";

    function getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
        catch { return []; }
    }

    function getTopCategories() {
        const history = getHistory();
        const counts = {};
        history.forEach(order => {
            order.items.forEach(item => {
                counts[item.cat] = (counts[item.cat] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a,b) => b[1] - a[1]).map(e => e[0]);
    }

    function getRecommendations(restaurants) {
        const topCats = getTopCategories();
        if (topCats.length === 0) return restaurants.slice(0, 4); // Default trending

        // Priority 1: Restaurants matching top categories
        let recs = restaurants.filter(r => topCats.includes(r.tag.toLowerCase()));
        
        // Priority 2: High rated restaurants
        if (recs.length < 4) {
            const others = restaurants.filter(r => !recs.includes(r))
                .sort((a,b) => b.rating - a.rating);
            recs = [...recs, ...others.slice(0, 4 - recs.length)];
        }

        return recs.slice(0, 6);
    }

    return {
        getRecommendations
    };
})();
