export default function Contact() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-20">
      <h1 className="font-display text-4xl font-semibold text-[var(--foreground)] mb-4">
        Say hello
      </h1>
      <p className="text-[var(--text-muted)] text-lg mb-12 max-w-xl leading-relaxed">
        Whether you&apos;re a recruiter, a potential collaborator, or just want to talk — I&apos;m always
        happy to chat.
      </p>

      <div className="space-y-6">
        <a
          href="mailto:bryanlimjt@gmail.com"
          className="flex items-center gap-4 group"
        >
          <span className="text-sm text-[var(--text-muted)] w-20">Email</span>
          <span className="text-[var(--foreground)] group-hover:underline">bryanlimjt@gmail.com</span>
        </a>
        <a
          href="https://linkedin.com/in/bryanlimjt"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 group"
        >
          <span className="text-sm text-[var(--text-muted)] w-20">LinkedIn</span>
          <span className="text-[var(--foreground)] group-hover:underline">linkedin.com/in/bryanlimjt</span>
        </a>
        <a
          href="https://github.com/BryLJT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 group"
        >
          <span className="text-sm text-[var(--text-muted)] w-20">GitHub</span>
          <span className="text-[var(--foreground)] group-hover:underline">github.com/BryLJT</span>
        </a>
      </div>
    </div>
  )
}
