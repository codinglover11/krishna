import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';

export const Home = () => {
  // Fetch Featured Products
  const { data: featuredProducts, isLoading: loadFeatured } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getFeaturedProducts(5),
    retry: false
  });

  // Fetch Best Sellers for "More from the Shelf"
  const { data: bestSellers, isLoading: loadBest } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => productService.getBestSellers(4),
    retry: false
  });

  // Fetch Categories to get their uploaded images
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    retry: false
  });

  // Helper to find category by slug
  const getCat = (slug) => categories?.find(c => c.slug.toLowerCase() === slug.toLowerCase()) || {};


  return (
    <div>
      {/* Hero Section */}
      <section className="hero wrap" id="jutti">
        <div className="hero-top">
          <div>
            <p className="eyebrow">Mens · Ladies · Kids — one counter</p>
            <h1>Fresh on the Shelf,<br/><span>ready to walk out.</span></h1>
            <p className="lede">This week's picks — juttis, sneakers, flats, straight from the store floor.</p>
          </div>
          <div className="pill-row">
            <Link to="/products?category=jutti" className="pill">Jutti</Link>
            <Link to="/products?category=men" className="pill">Men</Link>
            <Link to="/products?category=women" className="pill">Women</Link>
            <Link to="/products?category=kids" className="pill">Kids</Link>
          </div>
        </div>

        <div className="hero-shelf">
          <div className="shelf-grid">
            {loadFeatured ? (
               Array(5).fill(0).map((_, i) => (
                 <div key={i} className={`skeleton ${i === 0 ? 'feature' : ''}`} style={{ minHeight: '190px' }}></div>
               ))
            ) : (
               featuredProducts?.slice(0, 5).map((prod, index) => (
                 <ProductCard key={prod.id} product={prod} feature={index === 0} />
               ))
            )}
          </div>
        </div>
      </section>

      <div className="stitch"></div>

      {/* Categories Strip */}
      <section className="categories wrap">
        <div className="cat-head">
          <h2>Pick a Corner of the Shop</h2>
          <p className="eyebrow">Same shop, four worlds of footwear</p>
        </div>
        <div className="cat-grid">
          <Link to="/products?category=jutti" className="cat-card jutti">
            {getCat('jutti').image_url ? (
              <img src={getCat('jutti').image_url} alt="Jutti" className="cat-icon" style={{ objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <svg className="cat-icon" viewBox="0 0 64 64" fill="none"><path d="M6 36c-1-8 6-14 17-16 8-1 16-3 22 2 4 3 5 8 3 12 6-2 12 1 13 6 1 4-3 7-8 7H12c-3 0-5-2-6-4z" fill="#F3ECDC"/></svg>
            )}
            <div><h3>Jutti</h3><p>{getCat('jutti').description || 'Hand-stitched, festive, the shoe the shop is named for.'}</p></div>
            <span className="go">Browse Juttis →</span>
          </Link>

          <Link to="/products?category=men" className="cat-card men">
            {getCat('men').image_url ? (
              <img src={getCat('men').image_url} alt="Men" className="cat-icon" style={{ objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <svg className="cat-icon" viewBox="0 0 64 64" fill="none"><path d="M6 40c-1-10 6-18 20-20 12-2 24-4 30 2 5 5 6 12 4 16-1 3-4 4-8 4H12c-4 0-6-2-6-6z" fill="#F3ECDC"/></svg>
            )}
            <div><h3>Men</h3><p>{getCat('men').description || 'Sneakers for the commute, formals for the interview.'}</p></div>
            <span className="go">Browse Men's →</span>
          </Link>

          <Link to="/products?category=women" className="cat-card women">
            {getCat('women').image_url ? (
              <img src={getCat('women').image_url} alt="Women" className="cat-icon" style={{ objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <svg className="cat-icon" viewBox="0 0 64 64" fill="none"><path d="M8 34c-1-8 6-13 18-14l24-2c6 0 9 5 8 10l-2 10H14c-4 0-5-2-6-4z" fill="#F3ECDC"/></svg>
            )}
            <div><h3>Women</h3><p>{getCat('women').description || 'Flats for the metro, heels for the shaadi season.'}</p></div>
            <span className="go">Browse Women's →</span>
          </Link>

          <Link to="/products?category=kids" className="cat-card kids">
            {getCat('kids').image_url ? (
              <img src={getCat('kids').image_url} alt="Kids" className="cat-icon" style={{ objectFit: 'cover', borderRadius: '12px' }} />
            ) : (
              <svg className="cat-icon" viewBox="0 0 64 64" fill="none"><path d="M8 36c-1-8 6-14 17-15 8-1 17-2 22 3 3 3 4 8 3 11l-1 5H13c-3 0-4-2-5-4z" fill="#F3ECDC"/></svg>
            )}
            <div><h3>Kids</h3><p>{getCat('kids').description || 'First walkers, and school shoes that survive recess.'}</p></div>
            <span className="go">Browse Kids' →</span>
          </Link>
        </div>
      </section>

      {/* Brand Story */}
      <section className="story wrap">
        <div className="story-grid">
          <div>
            <span className="quote-mark">"</span>
            <h2>Every family has a cobbler they trust.</h2>
          </div>
          <div>
            <p>We'd like to be that for you. Not a warehouse, not an algorithm guessing your size — a shop where someone remembers that your son's feet grew two sizes since Diwali, and that your mother-in-law only wears a low heel now.</p>
            <p>We stock what a household actually needs across a year: school shoes in June, wedding footwear through winter, monsoon-ready sandals when the sky turns. Mens, ladies, kids — one counter, one bill, no separate trip across the market.</p>
            <p className="signoff">— The counter at Sawariya Foot Collection</p>
          </div>
        </div>
      </section>

      <div className="stitch"></div>

      {/* More from the Shelf */}
      <section className="shelf-section wrap">
        <div className="shelf-head">
          <h2>More from the Shelf</h2>
          <Link to="/products">See everything in stock →</Link>
        </div>
        <div className="product-grid">
          {loadBest ? (
             Array(4).fill(0).map((_, i) => (
               <div key={i} className="skeleton" style={{ minHeight: '260px' }}></div>
             ))
          ) : (
             bestSellers?.slice(0, 4).map((prod) => (
               <ProductCard key={prod.id} product={prod} />
             ))
          )}
        </div>
      </section>

      {/* Testimonial */}
      <section className="testimonial-wrap wrap">
        <div className="note">
          <p className="hi">"Sawariya se hi lete hain — pichhle teen saal se. Size hamesha sahi milta hai, aur ladke ko naya shoe chahiye toh yeh log yaad rakhte hain ki pichli baar kya diya tha."</p>
          <p className="en">"We've been buying from Sawariya for three years now. The size always fits, and when my son needs new shoes, they remember what we bought him last time."</p>
          <p className="who">Neelam Sharma <span>— regular customer, Sector 21</span></p>
        </div>
      </section>
    </div>
  );
};

export default Home;
