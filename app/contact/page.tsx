import SchedulingButton from "@/components/SchedulingButton"

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — contact info */}
        <div>
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

          <div className="mt-12">
            <a
              href="/Bryan_Lim_Resume.pdf"
              download="Bryan_Lim_Resume.pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              Download Resume ↓
            </a>
          </div>
        </div>

        {/* Right — schedule a chat */}
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--foreground)] mb-4">
            Schedule a chat
          </h2>
          <div
            className="rounded-xl p-6"
            style={{ border: "1px solid color-mix(in srgb, var(--foreground) 15%, transparent)" }}
          >
            <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
              Pick a time that works for you — 30 minutes, no agenda required.
            </p>
            <SchedulingButton />
          </div>
        </div>
      </div>
    </div>
  )
}
