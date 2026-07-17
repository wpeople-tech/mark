'use client'

import { useRouter } from 'next/navigation'
import { useMagneticButton } from '@/lib/hooks/useMagneticButton'
import { useNavScroll } from '@/lib/hooks/useNavScroll'
import { useMobileNav } from '@/lib/hooks/useMobileNav'

interface NavProps {
  onCtaClick?: () => void
}

export function Nav({ onCtaClick }: NavProps) {
  const router = useRouter()
  const navStyle = useNavScroll()
  const { isOpen, toggle, close } = useMobileNav()
  const {
    ref: ctaRef,
    style: ctaStyle,
    handleMouseMove: ctaMove,
    handleMouseLeave: ctaLeave,
  } = useMagneticButton()

  const handleCtaClick = () => {
    close()
    onCtaClick?.()
  }

  const handleAnchor = (id: string) => {
    close()
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 58,
        behavior: 'smooth',
      })
    }
  }

  const linkClass =
    'text-[13px] text-muted transition-colors duration-150 hover:text-ink cursor-pointer'
  const mobileLinkClass =
    'text-[24px] font-medium text-paper hover:text-term-blue transition-colors'

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-10 h-[58px]"
        style={{
          background: 'rgba(247,246,243,.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '.5px solid rgba(229,227,220,.7)',
          transition: 'transform .4s cubic-bezier(.16,1,.3,1)',
          ...navStyle,
        }}
      >
        <div className="flex items-center gap-[10px]">
          <div className="size-7 rounded-[7px] bg-ink flex items-center justify-center text-[13px] font-bold text-paper">
            M
          </div>
          <span className="text-[14px] font-bold tracking-[-.02em] text-ink">
            MARK{' '}
            <span className="font-normal text-muted text-[11px] tracking-[.07em] uppercase ml-[5px]">
              Intelligence
            </span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="items-center gap-8 hidden md:flex">
          <button onClick={() => handleAnchor('demo')} className={linkClass}>
            How it works
          </button>
          <button onClick={() => handleAnchor('features')} className={linkClass}>
            Features
          </button>
          <button onClick={() => { close(); router.push('/skills') }} className={linkClass}>
            Skills
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            ref={ctaRef}
            onClick={handleCtaClick}
            onMouseMove={ctaMove}
            onMouseLeave={ctaLeave}
            className="text-[12px] font-semibold px-5 py-[9px] rounded-pill bg-ink text-paper border-none flex items-center gap-[7px] tracking-[.01em] transition-opacity duration-150 hover:opacity-85 hidden md:flex"
            style={{ ...ctaStyle }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            Add to Chrome — free
          </button>

          {/* Hamburger */}
          <button
            onClick={toggle}
            className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer bg-transparent border-none"
            aria-label="Toggle menu"
          >
            <span
              className="block h-[2px] rounded-sm bg-ink transition-all duration-300"
              style={{
                width: 22,
                transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0)',
              }}
            />
            <span
              className="block h-[2px] rounded-sm bg-ink transition-all duration-300"
              style={{
                width: 22,
                opacity: isOpen ? 0 : 1,
              }}
            />
            <span
              className="block h-[2px] rounded-sm bg-ink transition-all duration-300"
              style={{
                width: 22,
                transform: isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'rotate(0)',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-99 flex flex-col items-center justify-center gap-10 bg-ink md:hidden"
          style={{ animation: 'fadeIn .25s ease both' }}
        >
          <button
            onClick={() => handleAnchor('demo')}
            className={mobileLinkClass}
          >
            How it works
          </button>
          <button
            onClick={() => handleAnchor('features')}
            className={mobileLinkClass}
          >
            Features
          </button>
          <button
            onClick={() => { close(); router.push('/skills') }}
            className={mobileLinkClass}
          >
            Skills
          </button>
          <button
            onClick={() => handleAnchor('token')}
            className={mobileLinkClass}
          >
            
          </button>
          <button
            onClick={handleCtaClick}
            className="text-[16px] font-semibold px-8 py-3 rounded-pill bg-paper text-ink border-none mt-4"
          >
            Add to Chrome — free
          </button>
        </div>
      )}
    </>
  )
}
