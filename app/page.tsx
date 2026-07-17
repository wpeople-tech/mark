'use client'

import { useCallback, useState } from 'react'
import { Nav } from '@/components/landing/sections/Nav'
import { HeroSection } from '@/components/landing/sections/HeroSection'
import { TickerSection } from '@/components/landing/sections/TickerSection'
import { DemoSection } from '@/components/landing/sections/DemoSection'
import { HowItWorksSection } from '@/components/landing/sections/HowItWorksSection'
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection'
import { SkillsSection } from '@/components/landing/sections/SkillsSection'
import { TokenSection } from '@/components/landing/sections/TokenSection'
import { Footer } from '@/components/landing/sections/Footer'
import { InstallGuide } from '@/components/landing/ui/InstallGuide'

function downloadZip() {
  const a = document.createElement('a')
  a.href = '/mark-extension.zip'
  a.download = 'mark-extension.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export default function Home() {
  const [guideVisible, setGuideVisible] = useState(false)

  const handleCta = useCallback(() => {
    downloadZip()
    setGuideVisible(true)
  }, [])

  const hideGuide = useCallback(() => setGuideVisible(false), [])

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
      <Nav onCtaClick={handleCta} />
      <HeroSection onCtaClick={handleCta} onScrollToDemo={scrollToDemo} />
      <TickerSection />
      <DemoSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SkillsSection />
      {/* <TokenSection /> */}
      <Footer />
      <InstallGuide visible={guideVisible} onClose={hideGuide} />
    </>
  )
}
