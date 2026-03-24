import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full px-8 py-8 mt-auto bg-[var(--nav-bg)]">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <p className="text-sm text-[var(--nav-muted)]">
          © {new Date().getFullYear()} Bryan Lim
        </p>
        <div className="flex items-center gap-6">
          <a
            href="mailto:your@email.com"
            className="text-sm text-[var(--nav-muted)] hover:text-[var(--nav-text)] transition-colors"
          >
            Email
          </a>
          <a
            href="https://linkedin.com/in/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--nav-muted)] hover:text-[var(--nav-text)] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--nav-muted)] hover:text-[var(--nav-text)] transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
