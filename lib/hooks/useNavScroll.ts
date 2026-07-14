'use client'

import { useEffect, useState } from 'react'

export function useNavScroll() {
  const [navStyle, setNavStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    let last = window.scrollY

    const onScroll = () => {
      const sy = window.scrollY
      setNavStyle({
        transform: sy > last && sy > 120 ? 'translateY(-100%)' : 'translateY(0)',
        background:
          sy > 40
            ? 'rgba(247,246,243,.96)'
            : 'rgba(247,246,243,.88)',
      })
      last = sy
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return navStyle
}
