"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="w-full px-8 py-5 flex items-center justify-between bg-[var(--nav-bg)]">
      <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-[var(--nav-text)]">
        Bryan Lim
      </Link>
      <ul className="flex items-center gap-8">
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
    </nav>
  )
}
