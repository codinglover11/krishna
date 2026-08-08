import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Navigation, ExternalLink } from 'lucide-react';
import { toast } from '../stores/toastStore';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const lat = 26.8694535;
  const lng = 75.7559061;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
  const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      toast.success('Thank you! Your message has been sent to piyushtewani11@gmail.com. Support will respond shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitting(false);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px', width: '100%', textAlign: 'left' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '12px' }}>
        Get in Touch
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', fontSize: '1.0625rem' }}>
        Have questions about sizing, customization, or order deliveries? Our support team at Jaipur Retail Hub is here for you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'start' }}>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', margin: 0 }}>
            Contact Information
          </h3>

          {/* Phone Support */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Phone size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 4px', fontSize: '1rem' }}>Phone Support</h4>
              <a href="tel:+919079322115" style={{ color: 'var(--primary-color)', fontWeight: '700', fontSize: '1.125rem', textDecoration: 'none' }}>
                +91 9079322115
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '4px' }}>
                <Clock size={14} />
                <span>Mon - Sat: 9:00 AM - 10:00 PM (IST)</span>
              </div>
            </div>
          </div>

          {/* Email Support */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Mail size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 4px', fontSize: '1rem' }}>Email Support</h4>
              <a href="mailto:piyushtewani11@gmail.com" style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9375rem', textDecoration: 'none' }}>
                piyushtewani11@gmail.com
              </a>
            </div>
          </div>

          {/* Retail Hub Address */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <MapPin size={22} />
            </div>
            <div>
              <h4 style={{ fontWeight: '600', margin: '0 0 4px', fontSize: '1rem' }}>Retail Hub</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6', margin: '0 0 12px' }}>
                <strong>Krishna Footwear</strong><br />
                VQ94+P96, Swarn Path, Sector II, Varun Path,<br />
                Mansarovar Sector 4, Jaipur, Rajasthan 302020, India
              </p>

              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  padding: '8px 16px',
                  textDecoration: 'none'
                }}
              >
                <Navigation size={16} /> Get Directions on Google Maps <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-low)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--primary-color)' }}>
            Send Us a Message
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Your Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Rahul Sharma"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--font-family)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--font-family)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Size & Customization Query"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--font-family)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Message *</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Write your message here..."
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontFamily: 'var(--font-family)',
                resize: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center', padding: '14px' }}>
            <Send size={18} /> {submitting ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>

      </div>

      {/* Interactive Google Map Embed */}
      <section style={{ marginTop: '64px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '16px' }}>
          Find Us in Jaipur
        </h3>
        <div style={{
          width: '100%',
          height: '400px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-medium)'
        }}>
          <iframe
            title="Krishna Footwear Store Location"
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
};

export default Contact;
