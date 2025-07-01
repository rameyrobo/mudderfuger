'use client'

import { useEffect } from 'react'

export default function SnipcartStyleLoader() {
  useEffect(() => {
    const snipcartCSS = document.createElement('link')
    snipcartCSS.rel = 'stylesheet'
    snipcartCSS.href = 'https://cdn.snipcart.com/themes/v3.6.1/default/snipcart.css'
    snipcartCSS.media = 'all'

    snipcartCSS.onload = () => {
      const overrideCSS = document.createElement('link')
      overrideCSS.rel = 'stylesheet'
      overrideCSS.href = '/snipcart-overrides.css'
      document.head.appendChild(overrideCSS)
    }

    document.head.appendChild(snipcartCSS)
  }, [])

  return null
}