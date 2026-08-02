import React from 'react';

export const Terms = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px', width: '100%', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '24px' }}>
        Terms & Conditions
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Last Updated: July 26, 2026
      </p>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            1. Terms Acceptance
          </h3>
          <p>
            By accessing or browsing this website, you agree to comply with these terms, our privacy policies, and all applicable digital commercial regulations.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            2. Customer Account Responsibility
          </h3>
          <p>
            When creating an account profile, you are responsible for maintaining the privacy of login tokens and password strings. You agree to immediately flag any suspicious or unauthorized logins of your account profile.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            3. E-Commerce Purchases & Pricing
          </h3>
          <p>
            All products listed are subject to stock availability. We reserve the right to correct pricing errors, alter product descriptions, or reject orders due to inventory discrepancies before shipping items.
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            4. Limitation of Liability
          </h3>
          <p>
            Krishna Footwear is not liable for indirect, incidental, or consequential losses stemming from delayed shipments, website downtime, database connection disruptions, or errors in product specifications.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Terms;
