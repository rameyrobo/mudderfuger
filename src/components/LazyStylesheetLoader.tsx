'use client';

import { useEffect } from 'react';

export default function LazyStylesheetLoader() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = '/snipcart-overrides.css';
    link.fetchPriority = 'low';

    link.onload = () => {
      // Switch rel from preload to stylesheet once loaded
      link.rel = 'stylesheet';
    };

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return null;
}