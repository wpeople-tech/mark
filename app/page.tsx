'use client'

import { useCallback, useState } from 'react'
import { Nav } from '@/components/landing/sections/Nav'
import { HeroSection } from '@/components/landing/sections/HeroSection'
import { TickerSection } from '@/components/landing/sections/TickerSection'
import { DemoSection } from '@/components/landing/sections/DemoSection'
import { HowItWorksSection } from '@/components/landing/sections/HowItWorksSection'
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection'
import { TokenSection } from '@/components/landing/sections/TokenSection'
import { Footer } from '@/components/landing/sections/Footer'
import { Toast } from '@/components/landing/ui/Toast'

export default function Home() {
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = useCallback(() => setToastVisible(true), [])
  const hideToast = useCallback(() => setToastVisible(false), [])

  const scrollToDemo = useCallback(() => {
    const el = document.getElementById('demo')
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 58,
        behavior: 'smooth',
      })
    }
  }, [])

  return (
    <>
      <Nav onCtaClick={showToast} />
      <HeroSection onCtaClick={showToast} onScrollToDemo={scrollToDemo} />
      <TickerSection />
      <DemoSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TokenSection />
      <Footer />
      <Toast
        visible={toastVisible}
        message="Coming to Chrome Web Store soon"
        onClose={hideToast}
      />
    </>
  )
}
