'use client'

import { useState } from 'react'

export function useMobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen((v) => !v)
  const close = () => setIsOpen(false)

  return { isOpen, toggle, close }
}
