import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroCopy } from './HeroCopy'

ReactDOM.createRoot(document.getElementById('hero-copy')!).render(<HeroCopy />)

// Reveal static sections as they enter the viewport (smooth scroll + fade-up).
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12 }
)
document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => observer.observe(el))
