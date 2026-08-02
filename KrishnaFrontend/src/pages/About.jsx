import React from 'react';
import { ShieldCheck, Heart, Sparkles, Footprints } from 'lucide-react';

export const About = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '64px' }}>
      
      {/* Introduction */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Our Heritage
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--primary-color)', margin: '8px 0 24px' }}>
            The Story Behind Krishna Footwear
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: '1.7', marginBottom: '16px' }}>
            For decades, Krishna Footwear has stood as a symbol of fine craftsmanship and unmatched comfort. What began as a local workshop has evolved into a state-of-the-art manufacturing standard, delivering premium leather shoes, official formal wear, and sports trainers.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', lineHeight: '1.7' }}>
            We believe that every shoe tells a story of quality. Our artisans meticulously inspect every cut of leather, double-stitch every seam, and test every sole to ensure you receive a product that lasts a lifetime.
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--primary-color)',
          borderRadius: 'var(--radius-lg)',
          height: '360px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--text-light)',
          padding: '40px',
          textAlign: 'center',
          gap: '16px',
          boxShadow: 'var(--shadow-high)'
        }}>
          <Footprints size={64} style={{ color: 'var(--secondary-color)' }} />
          <h3 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>Crafted for Comfort</h3>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem', lineHeight: '1.5' }}>
            "A shoe is not only design, but it is part of your body language. It walks with you, stands with you, and supports your aspirations."
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', textAlign: 'center' }}>
          Our Core Pillars
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
          
          <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: 'var(--secondary-color)', marginBottom: '16px' }}><ShieldCheck size={32} /></div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Supreme Quality</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              We source raw components from sustainable certified tanneries. Only top-grain leather enters our line.
            </p>
          </div>

          <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: 'var(--primary-color)', marginBottom: '16px' }}><Sparkles size={32} /></div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Modern Design</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Blending classic Italian patterns with contemporary trends, bringing style to boardrooms and casual dinners.
            </p>
          </div>

          <div style={{ padding: '32px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: 'var(--success)', marginBottom: '16px' }}><Heart size={32} /></div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Feet Health First</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Featuring shock-absorbent cushioning and flexible arch supports that align with human orthotic structure.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
