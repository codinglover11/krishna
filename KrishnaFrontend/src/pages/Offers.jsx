import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Percent, Calendar, ShieldAlert } from 'lucide-react';
import productService from '../services/productService';

export const Offers = () => {
  // Fetch active offers/promotions from backend
  const { data: offers, isLoading, error } = useQuery({
    queryKey: ['offers'],
    queryFn: () => productService.getOffers(),
    retry: false
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', width: '100%', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '12px' }}>
        Promotional Offers & Discounts
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '48px' }}>
        Unlock premium savings on top-tier footwear using exclusive discount vouchers.
      </p>

      {/* Grid of Offers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        
        {/* Permanent/Static Standard Offers for Fallback */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '2px dashed var(--secondary-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-low)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 12px',
            backgroundColor: 'hsla(30, 90%, 55%, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--secondary-color)',
            fontWeight: '700',
            fontSize: '0.875rem'
          }}>
            WELCOME20
          </div>
          <div style={{ color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={24} />
            <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>First Order Discount</span>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Get 20% Off Your First Purchase</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.5' }}>
            Enter promo code **WELCOME20** during checkout to redeem. Applicable on all products in stock.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Calendar size={14} />
            <span>Valid for new registration profiles only.</span>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: 'var(--shadow-low)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 12px',
            backgroundColor: 'hsla(215, 80%, 20%, 0.1)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--primary-color)',
            fontWeight: '700',
            fontSize: '0.875rem'
          }}>
            FESTIVE10
          </div>
          <div style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent size={24} />
            <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>Festive Reduction</span>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Extra 10% Off All Leather Boots</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.5' }}>
            Save more on premium stitched leather boots. Apply coupon **FESTIVE10** at order confirmation.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            <Calendar size={14} />
            <span>Expires August 31, 2026.</span>
          </div>
        </div>

      </div>

      {/* Dynamic Offers from Backend API */}
      <section style={{ marginTop: '64px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '24px' }}>
          Seasonal Store Campaigns
        </h2>

        {isLoading && <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-lg)' }}></div>}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <ShieldAlert size={20} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Campaign server is offline. Waiting to fetch additional dynamic coupons from database.
            </span>
          </div>
        )}

        {!isLoading && !error && offers && offers.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>No other campaigns running currently.</p>
        )}

        {!isLoading && !error && offers && offers.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {offers.map((offer) => (
              <div key={offer.id} style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>{offer.title}</span>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>{offer.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Offers;
