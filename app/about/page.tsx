export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-20">
      <h1 className="font-display text-4xl font-semibold text-[var(--foreground)] mb-10">
        About me
      </h1>

      <div className="max-w-2xl space-y-6 text-[var(--text-muted)] text-lg leading-relaxed">
        <p>
          I&apos;m Bryan — a builder at the intersection of business and technology, based in Singapore.
          Incoming NUS Business student (BAIS — Business Artificial Intelligence Systems), currently
          interning at PwC&apos;s Risk Services + AI division.
        </p>
        <p>
          Before tech, I spent two years doing research under NUS&apos;s Department of Microbiology and
          Immunology — working on cancer DNA repair mechanisms and SARS-CoV-2 protein interactions.
          That research background shapes how I think: rigorously, from first principles.
        </p>
        <p>
          These days I build AI agents, tools, and products. I care deeply about learning effectively —
          not just learning a lot — and about working with people who push me to think harder.
        </p>
        <p>
          I believe now (while young) is the time to sprint. Learn, do, fail, try again.
        </p>
      </div>
    </div>
  )
}
