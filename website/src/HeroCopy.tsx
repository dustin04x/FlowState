import { useEffect, useState } from 'react'

export function HeroCopy() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className={`hero-copy ${mounted ? 'revealed' : ''}`}>
      <h1 id="hero-title" className={mounted ? 'revealed' : ''}>
        One session.<br />One thing at a time.
      </h1>
      <p className={mounted ? 'revealed' : ''}>
        FlowState is a small desktop timer for getting into work, taking a break, and coming back without the extra machinery.
      </p>
      <a
        className="primary-link"
        href="https://github.com/dustin04x/FlowState/releases/download/v1.0.2/FlowState-1.0.2-x64.exe"
      >
        Download for Windows
        <span>v1.0.2 · unsigned</span>
      </a>
      <p className="other-platforms">
        Also available for <a href="#downloads">macOS and Linux</a>.
      </p>
    </div>
  )
}
