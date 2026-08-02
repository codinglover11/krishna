import React, { useState } from 'react';

const FALLBACK_SHOE_IMAGE = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';

export const Image = ({
  src,
  alt = 'Krishna Footwear Product',
  width,
  height,
  className = '',
  style = {},
  fallbackSrc = FALLBACK_SHOE_IMAGE,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  // Apply Cloudinary f_auto,q_auto transformations if URL contains cloudinary
  const getOptimizedSrc = (url) => {
    if (!url) return fallbackSrc;
    if (url.includes('res.cloudinary.com') && !url.includes('f_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    return url;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={getOptimizedSrc(imgSrc)}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={handleError}
      className={className}
      style={{
        objectFit: 'cover',
        ...style
      }}
      {...props}
    />
  );
};

export default Image;
