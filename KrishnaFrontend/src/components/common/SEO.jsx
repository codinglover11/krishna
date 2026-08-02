import React, { useEffect } from 'react';

export const SEO = ({
  title = 'Krishna Footwear | Handcrafted Premium Leather Shoes',
  description = 'Shop handcrafted, ergonomic leather footwear engineered for superior comfort, durability, and timeless style.',
  url = window.location.href,
  image = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
  type = 'website',
  productData = null
}) => {
  useEffect(() => {
    // 1. Page Title
    document.title = title.includes('Krishna Footwear') ? title : `${title} | Krishna Footwear`;

    // 2. Helper to set or update meta tag
    const setMetaTag = (attr, attrValue, content) => {
      let element = document.querySelector(`meta[${attr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:url', url);
    setMetaTag('property', 'og:type', type);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);

    // 3. Schema.org JSON-LD Structured Data for Products
    let scriptElement = document.getElementById('json-ld-product');
    if (productData) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'json-ld-product';
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }

      const jsonLd = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productData.name,
        image: productData.image_url ? [productData.image_url] : [image],
        description: productData.description || description,
        sku: productData.sku,
        brand: {
          '@type': 'Brand',
          name: productData.brand || 'Krishna Footwear'
        },
        offers: {
          '@type': 'Offer',
          url,
          priceCurrency: 'INR',
          price: productData.discount_price || productData.price,
          availability: 'https://schema.org/InStock'
        }
      };

      scriptElement.textContent = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, url, image, type, productData]);

  return null;
};

export default SEO;
