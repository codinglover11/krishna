import React, { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAuthAction } from '../../hooks/useAuthAction';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { ToastContainer } from '../common/Toast';
import { WhatsAppOrderModal } from '../common/WhatsAppOrderModal';
import logoSvg from '../../assets/react.svg'; // Reuse react.svg for logo or render custom

export const MainLayout = () => {
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const runWithAuth = useAuthAction();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { items: cartItems, fetchCart } = useCartStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

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

  const handleProfileClick = () => {
    runWithAuth(() => {
      navigate('/profile');
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      {/* Top Banner Offer */}
      <div style={{
        backgroundColor: 'var(--primary-color)',
        color: 'var(--text-light)',
        textAlign: 'center',
        padding: '8px 16px',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}>
        ✨ Special Festive Sale: Get up to 30% Off on Premium Leather Footwear!
      </div>

      {/* Header / Navbar */}
      <header className="glass-header" style={{
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary-color)' }}>
            <img src={logoSvg} alt="Krishna Footwear Logo" style={{ height: '32px' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Krishna Footwear</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Home</NavLink>
            <NavLink to="/products" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Browse Shoes</NavLink>
            <NavLink to="/offers" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Offers</NavLink>
            <NavLink to="/about" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="desktop-only" style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '240px',
            width: '100%'
          }}>
            <input
              type="text"
              placeholder="Search footwear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--font-family)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--bg-muted)'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          </form>

          {/* User Icons Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={handleWishlistClick} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }} title="Wishlist">
              <Heart size={22} />
              {isAuthenticated && wishlistItems.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--secondary-color)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-full)',
                  minWidth: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}>
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <button onClick={handleCartClick} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', position: 'relative' }} title="Shopping Cart">
              <ShoppingBag size={22} />
              {isAuthenticated && cartItems.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--secondary-color)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-full)',
                  minWidth: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}>
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
            <button onClick={handleProfileClick} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="My Account">
              <User size={22} />
            </button>
            {isAuthenticated && (
              <button onClick={logout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Logout">
                <LogOut size={22} />
              </button>
            )}

            {/* Mobile Menu Icon */}
            <button
              className="mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'none' }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-only-drawer" style={{
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="navbar-link">Home</NavLink>
            <NavLink to="/products" onClick={() => setMobileMenuOpen(false)} className="navbar-link">Browse Shoes</NavLink>
            <NavLink to="/offers" onClick={() => setMobileMenuOpen(false)} className="navbar-link">Offers</NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className="navbar-link">About</NavLink>
            <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className="navbar-link">Contact</NavLink>
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginTop: '8px' }}>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  outline: 'none'
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            </form>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--primary-color)',
        color: 'var(--text-light)',
        borderTop: '4px solid var(--secondary-color)',
        padding: '48px 24px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '32px'
        }}>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '16px', color: 'var(--secondary-color)' }}>Krishna Footwear</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              Crafting premium quality leather boots, formal shoes, and sportswear for retail customers. Built for durability and style.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Shop</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li><Link to="/products" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Men's Collection</Link></li>
              <li><Link to="/products" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Women's Collection</Link></li>
              <li><Link to="/products" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Sports Footwear</Link></li>
              <li><Link to="/offers" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Discount Codes</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Support & Policies</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
              <li><Link to="/privacy" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Terms & Conditions</Link></li>
              <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Support Desk</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px' }}>Retail Hub</h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <strong>Krishna Footwear</strong><br />
              Varun Path Mansarowar Near Sharma Sweets,<br />
              Jaipur Rajasthan, 302020, India<br />
              <strong style={{ color: 'var(--secondary-color)' }}>Phone:</strong> +91 9079322115<br />
              <strong style={{ color: 'var(--secondary-color)' }}>Email:</strong> piyushtewani11@gmail.com
            </p>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '24px',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'rgba(255,255,255,0.5)'
        }}>
          © {new Date().getFullYear()} Krishna Footwear. All Rights Reserved. Built with Premium Quality Standards.
        </div>
      </footer>

      {/* Global Toast Render */}
      <ToastContainer />

      {/* Global WhatsApp Order Modal */}
      <WhatsAppOrderModal />

      {/* Inline styles for responsive layout controls */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-only { display: flex !important; }
        }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
