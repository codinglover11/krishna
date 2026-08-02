import React, { createContext, useState, useEffect } from "react";
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_OFFERS,
  INITIAL_BANNERS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  REPORT_DATA,
} from "../coonstants/constants";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  // Authentication State (Simulated)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("krishna_admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Database States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [banners, setBanners] = useState(INITIAL_BANNERS);
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [activities, setActivities] = useState(REPORT_DATA.recentActivity);

  // Notification Alerts State
  const [alerts, setAlerts] = useState([]);

  // Auto-clear notification alert
  const triggerAlert = (type, message) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 4000);
  };

  // Auth Operations
  const login = (email, password) => {
    // Basic mock authentication
    if (email === "admin@krishna.com" && password === "admin123") {
      const user = { name: "Krishna Kumar", email: "admin@krishna.com", role: "Super Admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" };
      setCurrentUser(user);
      localStorage.setItem("krishna_admin_user", JSON.stringify(user));
      triggerAlert("success", "Successfully logged in as Super Admin!");
      return true;
    }
    triggerAlert("error", "Invalid email or password!");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("krishna_admin_user");
    triggerAlert("success", "Logged out successfully!");
  };

  const updateProfile = (name, email, avatar) => {
    const updated = { ...currentUser, name, email, avatar };
    setCurrentUser(updated);
    localStorage.setItem("krishna_admin_user", JSON.stringify(updated));
    triggerAlert("success", "Profile updated successfully!");
  };

  // Product CRUD
  const addProduct = (product) => {
    const newProduct = {
      id: "p" + (products.length + 1),
      sales: 0,
      rating: 5.0,
      ...product,
    };
    setProducts((prev) => [newProduct, ...prev]);
    // Log Activity
    addActivity(`Product "${product.name}" was added to inventory.`);
    triggerAlert("success", `Product "${product.name}" added successfully!`);
  };

  const editProduct = (id, updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p))
    );
    addActivity(`Product "${updatedProduct.name}" details were edited.`);
    triggerAlert("success", "Product updated successfully!");
  };

  const deleteProduct = (id) => {
    const p = products.find((x) => x.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (p) {
      addActivity(`Product "${p.name}" was deleted.`);
      triggerAlert("success", `Product "${p.name}" deleted successfully.`);
    }
  };

  // Category CRUD
  const addCategory = (category) => {
    const newCat = {
      id: "c" + (categories.length + 1),
      count: 0,
      ...category,
    };
    setCategories((prev) => [...prev, newCat]);
    addActivity(`New category "${category.name}" was created.`);
    triggerAlert("success", `Category "${category.name}" created!`);
  };

  const editCategory = (id, name, description) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description } : c))
    );
    triggerAlert("success", "Category updated!");
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    triggerAlert("success", "Category deleted.");
  };

  // Order Operations
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    addActivity(`Order ${orderId} status updated to ${newStatus}.`);
    triggerAlert("success", `Order ${orderId} is now ${newStatus}!`);
  };

  // Coupon CRUD
  const addCoupon = (coupon) => {
    const newCoupon = {
      id: "cp" + (coupons.length + 1),
      uses: 0,
      active: true,
      ...coupon,
    };
    setCoupons((prev) => [...prev, newCoupon]);
    triggerAlert("success", `Coupon code ${coupon.code} created!`);
  };

  const toggleCouponStatus = (id) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    const c = coupons.find((x) => x.id === id);
    triggerAlert("success", `Coupon ${c?.code} state changed.`);
  };

  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    triggerAlert("success", "Coupon deleted.");
  };

  // Offer CRUD
  const addOffer = (offer) => {
    const newOffer = {
      id: "of" + (offers.length + 1),
      active: true,
      ...offer,
    };
    setOffers((prev) => [...prev, newOffer]);
    triggerAlert("success", `Offer "${offer.title}" added!`);
  };

  const toggleOfferStatus = (id) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o))
    );
  };

  const deleteOffer = (id) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    triggerAlert("success", "Offer removed.");
  };

  // Banner CRUD
  const addBanner = (banner) => {
    const newBanner = {
      id: "b" + (banners.length + 1),
      active: true,
      ...banner,
    };
    setBanners((prev) => [...prev, newBanner]);
    triggerAlert("success", "Homepage banner added!");
  };

  const toggleBannerStatus = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  const deleteBanner = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    triggerAlert("success", "Banner deleted.");
  };

  // Review Operations
  const updateReviewStatus = (id, newStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    triggerAlert("success", `Review status changed to ${newStatus}.`);
  };

  // Activity Log Helper
  const addActivity = (text) => {
    const newAct = {
      id: "act" + Date.now(),
      text,
      time: "Just now",
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        login,
        logout,
        updateProfile,
        products,
        addProduct,
        editProduct,
        deleteProduct,
        categories,
        addCategory,
        editCategory,
        deleteCategory,
        orders,
        updateOrderStatus,
        coupons,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        offers,
        addOffer,
        toggleOfferStatus,
        deleteOffer,
        banners,
        addBanner,
        toggleBannerStatus,
        deleteBanner,
        reviews,
        updateReviewStatus,
        settings,
        updateSettings: setSettings,
        activities,
        addActivity,
        alerts,
        triggerAlert,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
