import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import productService from '../services/productService';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';

export const Home = () => {
  // Fetch Active Banners (real database)
  const { data: banners } = useQuery({
    queryKey: ['publicBanners'],
    queryFn: async () => {
      const res = await api.get('/banners');
      return res.data.data;
    },
    retry: false
  });

  // Fetch Categories (real database)
  const { data: categories, isLoading: loadCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    retry: false
  });

  // Fetch Featured Products (real database)
  const { data: featuredProducts, isLoading: loadFeatured } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productService.getFeaturedProducts(4),
    retry: false
  });

  // Fetch New Arrivals (real database)
  const { data: newArrivals, isLoading: loadNew } = useQuery({
    queryKey: ['newArrivals'],
    queryFn: () => productService.getNewArrivals(4),
    retry: false
  });

  // Fetch Best Sellers (real database)
  const { data: bestSellers, isLoading: loadBest } = useQuery({
    queryKey: ['bestSellers'],
    queryFn: () => productService.getBestSellers(4),
    retry: false
  });

  const activeBanner = banners && banners.length > 0 ? banners[0] : null;
  const hasProducts = (featuredProducts?.length || 0) > 0 || (newArrivals?.length || 0) > 0 || (bestSellers?.length || 0) > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', paddingBottom: '80px' }}>
      
      {/* Hero Banner (Dynamic active banner from PostgreSQL if available) */}
      <section style={{
        backgroundImage: activeBanner?.image_url ? `linear-gradient(rgba(15,23,42,0.7), rgba(15,23,42,0.8)), url(${activeBanner.image_url})` : 'linear-gradient(135deg, var(--primary-color) 0%, hsl(215, 80%, 10%) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'var(--text-light)',
        padding: '110px 24px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 2 }}>
          <span style={{ color: 'var(--secondary-color)', fontSize: '0.875rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {activeBanner?.subtitle || 'Established Quality'}
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', margin: 0, color: 'white' }}>
            {activeBanner?.title || 'Walk with Unmatched Comfort & Elegance'}
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto' }}>
            {activeBanner?.description || 'Discover our premium footwear range crafted from top-tier materials. Perfectly styled for every walk of life.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
            <Link to={activeBanner?.link_url || '/products'} className="btn btn-secondary">
              Shop Collection <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </Link>
            <Link to="/about" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Selling Props */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-low)' }}>
            <div style={{ padding: '12px', backgroundColor: 'hsla(30, 90%, 55%, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--secondary-color)' }}><Award size={24} /></div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 8px' }}>Premium Leather</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Individually inspected hand-picked hide materials ensuring extreme durability and timeless shine.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-low)' }}>
            <div style={{ padding: '12px', backgroundColor: 'hsla(215, 80%, 20%, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}><ShieldCheck size={24} /></div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 8px' }}>Guaranteed Warranty</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Shop with confidence. All products include premium manufacturer warranties covering stitch & sole wear.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '24px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-low)' }}>
            <div style={{ padding: '12px', backgroundColor: 'hsla(140, 70%, 40%, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}><TrendingUp size={24} /></div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 8px' }}>Ergonomic Comfort</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Specially balanced orthotic sole architecture built to reduce walking impact stress on your feet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span style={{ color: 'var(--secondary-color)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Categories</span>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '4px 0 0' }}>Explore by Category</h2>
          </div>
          <Link to="/categories" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loadCategories ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ height: '180px', borderRadius: 'var(--radius-lg)', backgroundColor: '#e2e8f0' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {categories?.slice(0, 4).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span style={{ color: 'var(--secondary-color)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Selected Collection</span>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '4px 0 0' }}>Featured Footwear</h2>
          </div>
          <Link to="/products" style={{ color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Shop All <ArrowRight size={16} />
          </Link>
        </div>

        {loadFeatured ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {featuredProducts?.map((prod) => <ProductCard key={prod.id} product={prod} />)}
          </div>
        )}
      </section>

    </div>
  );
};

export default Home;
