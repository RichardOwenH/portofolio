
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Workflow 02: ordinary navigation links enhanced as a mobile disclosure.
   * Native anchors retain fragments/history and CSS owns motion preferences.
   */
  const header = select('.site-header-v2')
  const nav = select('#primary-navigation')
  const navToggle = select('.nav-toggle-v2')
  if (header && nav && navToggle) {
    const desktop = window.matchMedia('(min-width: 48rem)')
    const navLinks = [...nav.querySelectorAll('a[href^="#"]')]
    const updateOffset = () => {
      const gap = parseFloat(getComputedStyle(document.documentElement).fontSize)
      document.documentElement.style.setProperty('--nav-offset-v2', (header.getBoundingClientRect().height + gap) + 'px')
    }
    const setMenuOpen = (open, restoreFocus = false) => {
      navToggle.setAttribute('aria-expanded', String(open))
      nav.hidden = !desktop.matches && !open
      updateOffset()
      if (restoreFocus) navToggle.focus({ preventScroll: true })
    }
    const syncViewport = () => {
      const focusWasInNav = nav.contains(document.activeElement)
      const focusWasToggle = document.activeElement === navToggle
      navToggle.hidden = desktop.matches
      setMenuOpen(false)
      if (!desktop.matches && focusWasInNav) navToggle.focus({ preventScroll: true })
      if (desktop.matches && focusWasToggle) navLinks[0].focus({ preventScroll: true })
    }
    header.classList.add('nav-ready-v2')
    navToggle.addEventListener('click', () => setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true'))
    // Workflow 09: a tall open disclosure must not cover focus in page content.
    header.addEventListener('focusout', (event) => {
      if (!desktop.matches && event.relatedTarget && !header.contains(event.relatedTarget)) {
        setMenuOpen(false)
      }
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        event.preventDefault()
        setMenuOpen(false, true)
      }
    })
    desktop.addEventListener('change', syncViewport)
    syncViewport()
    if ('ResizeObserver' in window) new ResizeObserver(updateOffset).observe(header)
    window.addEventListener('resize', updateOffset)

    // Focus the destination, so selecting a link never leaves focus hidden
    // inside the closed disclosure. Native default scrolling still runs.
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        const target = document.getElementById(decodeURIComponent(link.hash.slice(1)))
        if (!target) return
        setMenuOpen(false)
        const temporaryTabindex = !target.hasAttribute('tabindex')
        if (temporaryTabindex) {
          target.setAttribute('tabindex', '-1')
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
        }
        target.focus({ preventScroll: true })
      })
    })

    // The unmapped hero/skills regions deliberately show no current nav link.
    const updateCurrentSection = () => {
      // Sample inside the shared anchor clearance, avoiding fractional-pixel boundaries.
      const clearance = 2 * parseFloat(getComputedStyle(document.documentElement).fontSize)
      const position = header.getBoundingClientRect().height + clearance
      navLinks.forEach(link => {
        const section = document.getElementById(link.hash.slice(1))
        const bounds = section.getBoundingClientRect()
        if (bounds.top <= position && bounds.bottom > position) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
    }
    window.addEventListener('load', updateCurrentSection)
    window.addEventListener('resize', updateCurrentSection)
    document.addEventListener('scroll', updateCurrentSection, { passive: true })
  }

})()