import React from 'react';

export const PrivacyPolicy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px', width: '100%', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '24px' }}>
        Privacy Policy
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Last Updated: July 26, 2026
      </p>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            1. Information We Collect
          </h3>
          <p>
            We collect personal information that you choose to provide us when registering, purchasing products, subscribing to marketing newsletters, or submitting contact inquiries. This data includes your name, shipping address, email address, phone numbers, and profile details.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            2. How We Use Your Data
          </h3>
          <p>
            Your information is processed to manage your shopping cart, fulfill orders, authenticate security sessions via JSON Web Tokens, send tracking confirmations, resolve support inquiries, and optimize user experience. We never lease or sell user credentials to third-party brokers.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            3. Cookies & Caching
          </h3>
          <p>
            We use essential security cookies (including HTTP-Only Refresh cookies) to maintain session authorizations. We also utilize local storage and memory stores to preserve cart selections during browsing sequences.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            4. Security Measures
          </h3>
          <p>
            Sensitive payload channels are guarded via standard transport layer security (HTTPS). Hashing algorithms (bcrypt) are utilized to secure user authentication credentials stored in our databases.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
