"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/photos", label: "Photos" },
  { href: "/contact", label: "Contact" },
]

export default function NavBar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="w-full px-8 py-5 flex items-center justify-between bg-[var(--nav-bg)] relative z-50">
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-2xl font-semibold tracking-tight text-[var(--nav-text)]"
        onClick={() => setOpen(false)}
      >
        Bryan Lim
      </Link>

      {/* Desktop nav — hidden on mobile */}
      <ul className="hidden md:flex items-center gap-8">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`text-sm transition-all duration-200 px-3 py-1.5 rounded ${
                pathname === href
                  ? "text-[var(--nav-text)] font-medium bg-black/20"
                  : "text-[var(--nav-muted)] hover:text-[var(--nav-text)] hover:bg-black/15"
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Hamburger button — mobile only */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <span className={`block w-6 h-0.5 bg-[var(--nav-text)] transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
        <span className={`block w-6 h-0.5 bg-[var(--nav-text)] transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-0.5 bg-[var(--nav-text)] transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[var(--nav-bg)] border-t border-black/10 shadow-md">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-8 py-4 text-sm transition-colors ${
                pathname === href
                  ? "text-[var(--nav-text)] font-medium bg-black/10"
                  : "text-[var(--nav-muted)] hover:text-[var(--nav-text)] hover:bg-black/05"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
