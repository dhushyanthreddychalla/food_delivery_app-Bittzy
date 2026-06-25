require('dotenv').config();
const mysql = require('mysql2/promise');

const restaurants = [
  { id: 1, name: "Nellore Dum Biryani House", tag: "biriyani", area: "Atmakur Road, Nellore", addr: "Near RTC Complex, Atmakur Rd, Nellore, AP 524001", rating: 4.6, eta: "25-35 min", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80" },
  { id: 2, name: "Domino Style Pizza Hub", tag: "nonveg", area: "Magunta Layout, Nellore", addr: "3rd Street, Magunta Layout, Nellore, AP 524003", rating: 4.5, eta: "20-30 min", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
  { id: 3, name: "Burger & Fries Corner", tag: "nonveg", area: "Vedayapalem, Nellore", addr: "Opp. Park, Vedayapalem, Nellore, AP 524004", rating: 4.4, eta: "25-40 min", img: "https://images.unsplash.com/photo-1550547660-d9450f859dd4?w=800&q=80" },
  { id: 4, name: "Sweet Desserts Studio", tag: "sweets", area: "Stonehousepet, Nellore", addr: "Main Bazar Rd, Stonehousepet, Nellore, AP 524002", rating: 4.7, eta: "15-25 min", img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80" },
  { id: 5, name: "South Spice Meals", tag: "tiffins", area: "Mini Bypass, Nellore", addr: "Mini Bypass Rd, Nellore, AP 524003", rating: 4.5, eta: "25-35 min", img: "https://images.unsplash.com/photo-1610192244261-3f33de7155e4?w=800&q=80" },
  { id: 6, name: "Andhra Chicken Special", tag: "nonveg", area: "Balaji Nagar, Nellore", addr: "Balaji Nagar, Nellore, AP 524002", rating: 4.6, eta: "30-40 min", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80" },
  { id: 7, name: "Cafe Cold Coffee", tag: "veg", area: "Ayyappa Society, Nellore", addr: "Ayyappa Society Rd, Nellore, AP 524001", rating: 4.3, eta: "15-25 min", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80" },
  { id: 8, name: "Paneer & Veg World", tag: "friedrice", area: "Kavali Road, Nellore", addr: "Kavali Rd, Nellore, AP 524001", rating: 4.4, eta: "20-30 min", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80" },
  { id: 9, name: "Family Restaurant & Biryani", tag: "biriyani", area: "AC Subba Reddy Nagar", addr: "AC Subba Reddy Nagar, Nellore, AP 524003", rating: 4.5, eta: "25-35 min", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80" }
];

const items = [
  // R1
  { restId: 1, name: "Chicken Dum Biryani", cat: "biryani", veg: "nonveg", price: 220, rating: 4.6, eta: "25-35 min", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80" },
  { restId: 1, name: "Mutton Dum Biryani", cat: "biryani", veg: "nonveg", price: 280, rating: 4.5, eta: "25-35 min", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80" },
  { restId: 1, name: "Egg Biryani", cat: "biryani", veg: "nonveg", price: 170, rating: 4.4, eta: "25-35 min", img: "https://images.unsplash.com/photo-1644833202976-578f14115167?w=800&q=80" },
  { restId: 1, name: "Paneer Biryani", cat: "biryani", veg: "veg", price: 190, rating: 4.3, eta: "25-35 min", img: "https://images.unsplash.com/photo-1633945274405-b6c3107b320v?w=800&q=80" },
  { restId: 1, name: "Chicken 65", cat: "south", veg: "nonveg", price: 180, rating: 4.5, eta: "20-30 min", img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80" },
  { restId: 1, name: "Raita", cat: "veg", veg: "veg", price: 30, rating: 4.2, eta: "10-20 min", img: "https://images.unsplash.com/photo-1579624590393-271d473b1be4?w=800&q=80" },
  { restId: 1, name: "Gulab Jamun", cat: "desserts", veg: "veg", price: 70, rating: 4.4, eta: "15-25 min", img: "https://images.unsplash.com/photo-1591016832264-071a7ca337bf?w=800&q=80" },
  { restId: 1, name: "Coke (500ml)", cat: "drinks", veg: "veg", price: 40, rating: 4.1, eta: "10-20 min", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80" },
  { restId: 1, name: "Chicken Fry Piece", cat: "south", veg: "nonveg", price: 160, rating: 4.3, eta: "20-30 min", img: "https://images.unsplash.com/photo-1562607311-28312007528c?w=800&q=80" },
  // R2
  { restId: 2, name: "Margherita Pizza", cat: "pizza", veg: "veg", price: 199, rating: 4.4, eta: "20-30 min", img: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad50?w=800&q=80" },
  { restId: 2, name: "Farmhouse Pizza", cat: "pizza", veg: "veg", price: 249, rating: 4.5, eta: "20-30 min", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
  { restId: 2, name: "Chicken Tikka Pizza", cat: "pizza", veg: "nonveg", price: 299, rating: 4.6, eta: "20-30 min", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" },
  { restId: 2, name: "Cheese Garlic Bread", cat: "pizza", veg: "veg", price: 129, rating: 4.3, eta: "20-30 min", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80" },
  { restId: 2, name: "Peri Peri Fries", cat: "burger", veg: "veg", price: 120, rating: 4.2, eta: "15-25 min", img: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=800&q=80" },
  { restId: 2, name: "Choco Lava Cake", cat: "desserts", veg: "veg", price: 99, rating: 4.5, eta: "15-25 min", img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80" },
  { restId: 2, name: "Pepsi (500ml)", cat: "drinks", veg: "veg", price: 40, rating: 4.1, eta: "10-20 min", img: "https://images.unsplash.com/photo-1581005662844-3b3bad097882?w=800&q=80" },
  { restId: 2, name: "Veg Pasta", cat: "south", veg: "veg", price: 160, rating: 4.2, eta: "20-30 min", img: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&q=80" },
  { restId: 2, name: "Chicken Wings (6 pcs)", cat: "burger", veg: "nonveg", price: 199, rating: 4.4, eta: "20-30 min", img: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&q=80" },
  // R3
  { restId: 3, name: "Classic Veg Burger", cat: "burger", veg: "veg", price: 99, rating: 4.2, eta: "25-40 min", img: "https://images.unsplash.com/photo-1550547660-d9450f859dd4?w=800&q=80" },
  { restId: 3, name: "Chicken Burger", cat: "burger", veg: "nonveg", price: 139, rating: 4.4, eta: "25-40 min", img: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=800&q=80" },
  { restId: 3, name: "Cheese Burger", cat: "burger", veg: "veg", price: 129, rating: 4.3, eta: "25-40 min", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
  { restId: 3, name: "French Fries", cat: "burger", veg: "veg", price: 79, rating: 4.1, eta: "20-35 min", img: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=800&q=80" },
  { restId: 3, name: "Chicken Nuggets", cat: "burger", veg: "nonveg", price: 149, rating: 4.2, eta: "20-35 min", img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80" },
  { restId: 3, name: "Brownie", cat: "desserts", veg: "veg", price: 90, rating: 4.3, eta: "15-25 min", img: "https://images.unsplash.com/photo-1606312619070-d48ab4a6c2a7?w=800&q=80" },
  { restId: 3, name: "Iced Lemon Soda", cat: "drinks", veg: "veg", price: 60, rating: 4.1, eta: "10-20 min", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80" },
  { restId: 3, name: "Veg Wrap", cat: "veg", veg: "veg", price: 120, rating: 4.0, eta: "20-35 min", img: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80" },
  { restId: 3, name: "Chicken Wrap", cat: "burger", veg: "nonveg", price: 150, rating: 4.2, eta: "20-35 min", img: "https://images.unsplash.com/photo-1553181232-2c6681023d6a?w=800&q=80" },
  // R4
  { restId: 4, name: "Black Forest Cake", cat: "desserts", veg: "veg", price: 220, rating: 4.5, eta: "15-25 min", img: "https://images.unsplash.com/photo-1512484776495-a09d92e100e1?w=800&q=80" },
  { restId: 4, name: "Butterscotch Cake", cat: "desserts", veg: "veg", price: 210, rating: 4.4, eta: "15-25 min", img: "https://images.unsplash.com/photo-1535141192574-5d4897c11610?w=800&q=80" },
  { restId: 4, name: "Chocolate Pastry", cat: "desserts", veg: "veg", price: 90, rating: 4.3, eta: "15-25 min", img: "https://images.unsplash.com/photo-1511910849309-0d5f2c18a52e?w=800&q=80" },
  { restId: 4, name: "Ice Cream Sundae", cat: "desserts", veg: "veg", price: 120, rating: 4.2, eta: "15-25 min", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80" },
  { restId: 4, name: "Fruit Salad", cat: "veg", veg: "veg", price: 110, rating: 4.1, eta: "15-25 min", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
  { restId: 4, name: "Cold Coffee", cat: "drinks", veg: "veg", price: 90, rating: 4.4, eta: "15-25 min", img: "https://images.unsplash.com/photo-1517701604599-bb21685994f3?w=800&q=80" },
  { restId: 4, name: "Milkshake (Chocolate)", cat: "drinks", veg: "veg", price: 120, rating: 4.3, eta: "15-25 min", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80" },
  { restId: 4, name: "Gulab Jamun (2 pcs)", cat: "desserts", veg: "veg", price: 70, rating: 4.4, eta: "15-25 min", img: "https://images.unsplash.com/photo-1591016832264-071a7ca337bf?w=800&q=80" },
  { restId: 4, name: "Mini Cup Cakes", cat: "desserts", veg: "veg", price: 130, rating: 4.2, eta: "15-25 min", img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&q=80" },
  // R5
  { restId: 5, name: "Andhra Veg Meals", cat: "south", veg: "veg", price: 180, rating: 4.4, eta: "25-35 min", img: "https://images.unsplash.com/photo-1610192244261-3f33de7155e4?w=800&q=80" },
  { restId: 5, name: "Chicken Curry + Rice", cat: "south", veg: "nonveg", price: 230, rating: 4.5, eta: "25-35 min", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80" },
  { restId: 5, name: "Sambar Idli", cat: "south", veg: "veg", price: 90, rating: 4.2, eta: "25-35 min", img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80" },
  { restId: 5, name: "Masala Dosa", cat: "south", veg: "veg", price: 110, rating: 4.4, eta: "25-35 min", img: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80" },
  { restId: 5, name: "Poori + Aloo Curry", cat: "south", veg: "veg", price: 95, rating: 4.1, eta: "25-35 min", img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80" },
  { restId: 5, name: "Chicken Fry Piece", cat: "south", veg: "nonveg", price: 160, rating: 4.3, eta: "25-35 min", img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80" },
  { restId: 5, name: "Curd Rice", cat: "south", veg: "veg", price: 80, rating: 4.1, eta: "25-35 min", img: "https://images.unsplash.com/photo-1626778480376-7901763ef4ed?w=800&q=80" },
  { restId: 5, name: "Butter Milk", cat: "drinks", veg: "veg", price: 40, rating: 4.0, eta: "15-25 min", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80" },
  { restId: 5, name: "Payasam", cat: "desserts", veg: "veg", price: 70, rating: 4.2, eta: "20-30 min", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" },
  // R6
  { restId: 6, name: "Andhra Chicken Curry", cat: "south", veg: "nonveg", price: 240, rating: 4.6, eta: "30-40 min", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80" },
  { restId: 6, name: "Mutton Curry", cat: "south", veg: "nonveg", price: 290, rating: 4.5, eta: "30-40 min", img: "https://images.unsplash.com/photo-1545247181-516773cae754?w=800&q=80" },
  { restId: 6, name: "Chicken 65", cat: "south", veg: "nonveg", price: 180, rating: 4.5, eta: "30-40 min", img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80" },
  { restId: 6, name: "Egg Curry", cat: "south", veg: "nonveg", price: 140, rating: 4.2, eta: "30-40 min", img: "https://images.unsplash.com/photo-1596797038530-2c39fa81b487?w=800&q=80" },
  { restId: 6, name: "Jeera Rice", cat: "veg", veg: "veg", price: 110, rating: 4.1, eta: "25-35 min", img: "https://images.unsplash.com/photo-1512058560366-cd242955a6d0?w=800&q=80" },
  { restId: 6, name: "Butter Naan", cat: "veg", veg: "veg", price: 45, rating: 4.0, eta: "25-35 min", img: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80" },
  { restId: 6, name: "Mixed Veg Curry", cat: "veg", veg: "veg", price: 130, rating: 4.1, eta: "20-30 min", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80" },
  { restId: 6, name: "Fresh Lime Soda", cat: "drinks", veg: "veg", price: 40, rating: 4.0, eta: "15-25 min", img: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80" },
  { restId: 6, name: "Double Ka Meetha", cat: "desserts", veg: "veg", price: 90, rating: 4.2, eta: "20-30 min", img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80" },
  // R7
  { restId: 7, name: "Cold Coffee", cat: "drinks", veg: "veg", price: 90, rating: 4.3, eta: "15-25 min", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&q=80" },
  { restId: 7, name: "Hot Coffee", cat: "drinks", veg: "veg", price: 60, rating: 4.2, eta: "15-25 min", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80" },
  { restId: 7, name: "Chocolate Milkshake", cat: "drinks", veg: "veg", price: 120, rating: 4.4, eta: "15-25 min", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80" },
  { restId: 7, name: "Lime Soda", cat: "drinks", veg: "veg", price: 60, rating: 4.1, eta: "15-25 min", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80" },
  { restId: 7, name: "Veg Sandwich", cat: "veg", veg: "veg", price: 110, rating: 4.1, eta: "15-25 min", img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80" },
  { restId: 7, name: "Chicken Sandwich", cat: "burger", veg: "nonveg", price: 140, rating: 4.2, eta: "15-25 min", img: "https://images.unsplash.com/photo-1553909489-cd47e0907d3f?w=800&q=80" },
  { restId: 7, name: "French Fries", cat: "burger", veg: "veg", price: 79, rating: 4.1, eta: "15-25 min", img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80" },
  { restId: 7, name: "Brownie", cat: "desserts", veg: "veg", price: 90, rating: 4.2, eta: "15-25 min", img: "https://images.unsplash.com/photo-1606312619070-d48ab4a6c2a7?w=800&q=80" },
  { restId: 7, name: "Oreo Shake", cat: "drinks", veg: "veg", price: 110, rating: 4.3, eta: "10-20 min", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80" },
  // R8
  { restId: 8, name: "Paneer Butter Masala", cat: "veg", veg: "veg", price: 210, rating: 4.5, eta: "20-30 min", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80" },
  { restId: 8, name: "Paneer Tikka", cat: "veg", veg: "veg", price: 220, rating: 4.4, eta: "20-30 min", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80" },
  { restId: 8, name: "Veg Fried Rice", cat: "south", veg: "veg", price: 160, rating: 4.2, eta: "20-30 min", img: "https://images.unsplash.com/photo-1512058560366-cd242955a6d0?w=800&q=80" },
  { restId: 8, name: "Veg Noodles", cat: "veg", veg: "veg", price: 160, rating: 4.2, eta: "20-30 min", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80" },
  { restId: 8, name: "Gobi Manchurian", cat: "veg", veg: "veg", price: 150, rating: 4.3, eta: "20-30 min", img: "https://images.unsplash.com/photo-1512485600893-b0800041f1bc?w=800&q=80" },
  { restId: 8, name: "Veg Biryani", cat: "biryani", veg: "veg", price: 180, rating: 4.3, eta: "20-30 min", img: "https://images.unsplash.com/photo-1633945274405-b6c3107b320v?w=800&q=80" },
  { restId: 8, name: "Butter Naan", cat: "veg", veg: "veg", price: 45, rating: 4.0, eta: "20-30 min", img: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?w=800&q=80" },
  { restId: 8, name: "Lassi", cat: "drinks", veg: "veg", price: 70, rating: 4.1, eta: "15-25 min", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80" },
  { restId: 8, name: "Gulab Jamun", cat: "desserts", veg: "veg", price: 70, rating: 4.3, eta: "15-25 min", img: "https://images.unsplash.com/photo-1591016832264-071a7ca337bf?w=800&q=80" },
  // R9
  { restId: 9, name: "Special Chicken Biryani", cat: "biryani", veg: "nonveg", price: 240, rating: 4.6, eta: "25-35 min", img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80" },
  { restId: 9, name: "Family Pack Biryani", cat: "biryani", veg: "nonveg", price: 520, rating: 4.5, eta: "30-40 min", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80" },
  { restId: 9, name: "Veg Biryani", cat: "biryani", veg: "veg", price: 180, rating: 4.2, eta: "25-35 min", img: "https://images.unsplash.com/photo-1633945274405-b6c3107b320v?w=800&q=80" },
  { restId: 9, name: "Chicken Curry", cat: "south", veg: "nonveg", price: 230, rating: 4.4, eta: "25-35 min", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80" },
  { restId: 9, name: "Paneer Curry", cat: "veg", veg: "veg", price: 200, rating: 4.2, eta: "25-35 min", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80" },
  { restId: 9, name: "Jeera Rice", cat: "veg", veg: "veg", price: 110, rating: 4.1, eta: "25-35 min", img: "https://images.unsplash.com/photo-1512058560366-cd242955a6d0?w=800&q=80" },
  { restId: 9, name: "Coke (500ml)", cat: "drinks", veg: "veg", price: 40, rating: 4.0, eta: "15-25 min", img: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80" },
  { restId: 9, name: "Ice Cream", cat: "desserts", veg: "veg", price: 90, rating: 4.1, eta: "15-25 min", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80" },
  { restId: 9, name: "Chicken 65", cat: "south", veg: "nonveg", price: 180, rating: 4.3, eta: "20-30 min", img: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80" }
];

async function seed() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await connection.query(`USE \`${process.env.DB_NAME}\`;`);

    console.log('Database created/selected');

    // Drop and create tables
    const tableQueries = `
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS food_items;
      DROP TABLE IF EXISTS restaurants;
      DROP TABLE IF EXISTS users;

      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255)
      );

      CREATE TABLE restaurants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        area VARCHAR(100),
        addr VARCHAR(255),
        rating FLOAT,
        eta VARCHAR(50),
        img VARCHAR(255),
        tag VARCHAR(50)
      );

      CREATE TABLE food_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        restaurant_id INT,
        name VARCHAR(100),
        cat VARCHAR(50),
        veg VARCHAR(50),
        price INT,
        rating FLOAT,
        eta VARCHAR(50),
        img VARCHAR(255),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      );

      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        items JSON,
        total_price INT,
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await connection.query(tableQueries);
    console.log('Tables created');

    // Insert dummy data
    for (const r of restaurants) {
      await connection.execute(
        'INSERT INTO restaurants (id, name, area, addr, rating, eta, img, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [r.id, r.name, r.area, r.addr, r.rating, r.eta, r.img, r.tag]
      );
    }
    
    for (const i of items) {
      await connection.execute(
        'INSERT INTO food_items (restaurant_id, name, cat, veg, price, rating, eta, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [i.restId, i.name, i.cat, i.veg, i.price, i.rating, i.eta, i.img]
      );
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
}

seed();
