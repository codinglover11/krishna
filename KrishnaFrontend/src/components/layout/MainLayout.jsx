import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAuthAction } from '../../hooks/useAuthAction';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { ToastContainer } from '../common/Toast';
import { toast } from '../../stores/toastStore';
import { WhatsAppOrderModal } from '../common/WhatsAppOrderModal';

export const MainLayout = () => {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const runWithAuth = useAuthAction();
  const navigate = useNavigate();

  const { items: cartItems, fetchCart } = useCartStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  const [pulseCart, setPulseCart] = useState(false);
  const [pulseWish, setPulseWish] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  // Trigger pulse animations
  useEffect(() => {
    if (cartItems.length > 0) {
      setPulseCart(true);
      const t = setTimeout(() => setPulseCart(false), 350);
      return () => clearTimeout(t);
    }
  }, [cartItems]);

  useEffect(() => {
    if (wishlistItems.length > 0) {
      setPulseWish(true);
      const t = setTimeout(() => setPulseWish(false), 350);
      return () => clearTimeout(t);
    }
  }, [wishlistItems]);

  const handleCartClick = () => {
    runWithAuth(() => {
      navigate('/cart');
    });
  };

  const handleWishlistClick = () => {
    runWithAuth(() => {
      navigate('/wishlist');
    });
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>


      {/* Header */}
      <header>
        <nav className="wrap">
          <Link to="/" className="brand">
            <svg viewBox="0 0 100 100" fill="none">
              <path d="M12 58 Q10 72 26 76 L64 76 Q80 76 84 62 Q87 50 74 40 Q60 29 48 34 Q38 22 22 26 Q10 29 8 42 Q6 50 12 58 Z"
                stroke="#221B15" strokeWidth="3.4" strokeDasharray="5 4.5" strokeLinecap="round" />
            </svg>
            <span className="brand-text">
              <span className="name">Sawariya Foot Collection</span>
              <span className="sub">Footwear</span>
            </span>
          </Link>

          <div className="nav-links">
            <NavLink to="/products?category=jutti" className={({ isActive }) => isActive ? 'active' : ''}>Jutti</NavLink>
            <NavLink to="/products?category=men" className={({ isActive }) => isActive ? 'active' : ''}>Men</NavLink>
            <NavLink to="/products?category=women" className={({ isActive }) => isActive ? 'active' : ''}>Women</NavLink>
            <NavLink to="/products?category=kids" className={({ isActive }) => isActive ? 'active' : ''}>Kids</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
            <a href="#" className="sale" onClick={(e) => { e.preventDefault(); toast.info('Sale offers are locked for now. Work in progress!'); }}>Sale</a>
          </div>

          <div className="nav-actions">
            <button className="nav-icon-btn" onClick={() => runWithAuth(() => navigate('/profile'))} aria-label="Profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="#221B15" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="nav-label">{isAuthenticated ? (user?.name ? user.name.split(' ')[0] : 'Profile') : 'Login'}</span>
            </button>
            <button className="nav-icon-btn" onClick={handleWishlistClick} aria-label="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="#221B15" strokeWidth="2">
                <path d="M12 21s-7.5-4.6-10-9C.4 8.4 2 4 6 4c2.2 0 3.7 1.2 6 4 2.3-2.8 3.8-4 6-4 4 0 5.6 4.4 4 8-2.5 4.4-10 9-10 9Z" />
              </svg>
              <span className="nav-label">Wishlist</span>
              <span className={`count-badge ${pulseWish ? 'pulse' : ''}`}>{wishlistItems.length}</span>
            </button>
            <button className="nav-icon-btn" onClick={handleCartClick} aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="#221B15" strokeWidth="2">
                <path d="M6 8h12l-1 12H7L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
              </svg>
              <span className="nav-label">Cart</span>
              <span className={`count-badge ${pulseCart ? 'pulse' : ''}`}>{cartCount}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap foot-grid">
          <div>
            <Link to="/" className="brand" style={{ color: 'inherit' }}>
              <svg viewBox="0 0 100 100" fill="none" style={{ width: '36px', height: '36px' }}>
                <path d="M12 58 Q10 72 26 76 L64 76 Q80 76 84 62 Q87 50 74 40 Q60 29 48 34 Q38 22 22 26 Q10 29 8 42 Q6 50 12 58 Z"
                  stroke="#D8B37A" strokeWidth="3.4" strokeDasharray="5 4.5" strokeLinecap="round" />
              </svg>
              <span className="brand-text">
                <span className="name" style={{ color: '#F3ECDC' }}>Sawariya Foot Collection</span>
                <span className="sub">Footwear</span>
              </span>
            </Link>
            <p style={{ marginTop: '16px' }}>Mens, ladies & kids footwear — one shop, every occasion.</p>
            <a href="#" className="whatsapp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                <path d="M17 14.2c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.3-.6.9-.8 1-.1.2-.3.2-.6.1-.8-.4-1.6-.9-2.3-1.5-.6-.6-1.1-1.3-1.5-2.1-.1-.2 0-.4.1-.6l.4-.5c.1-.2.2-.3.1-.5-.1-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.1 2.1-.6 3.4.7 1.9 2.7 4.6 5.5 5.6 1.7.6 2.6.4 3.3-.1.6-.4 1-1.1 1.1-1.8.1-.1.1-.3 0-.4z" />
              </svg>
              WhatsApp the shop
            </a>
          </div>
          <div>
            <h5>Shop</h5>
            <div className="foot-links">
              <Link to="/products?category=jutti">Juttis</Link>
              <Link to="/products?category=men">Men's Footwear</Link>
              <Link to="/products?category=women">Women's Footwear</Link>
              <Link to="/products?category=kids">Kids' Footwear</Link>
            </div>
          </div>
          <div>
            <h5>Shop Hours</h5>
            <p>Mon - Sat<br />8:30 am - 10:00 pm</p>
            <p>Sunday<br />8:30 am - 10:00 pm</p>
          </div>
          <div>
            <h5>Visit the Counter</h5>
            <p>VQ94+P96, Swarn Path, Sector II, Varun Path,<br />Mansarovar Sector 4, Jaipur, Rajasthan 302020</p>
            <p>+91 9079322115</p>
            <p>@sawariyacollection</p>
          </div>
        </div>
        <div className="wrap foot-bottom">
          <span>© {new Date().getFullYear()} Sawariya Foot Collection. All feet welcome.</span>
          <span>Designed for the shop, not off a shelf.</span>
        </div>
      </footer>

      {/* Global Modals & Toasts */}
      <ToastContainer />
      <WhatsAppOrderModal />
    </div>
  );
};

export default MainLayout;
