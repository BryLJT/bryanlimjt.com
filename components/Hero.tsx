import Image from "next/image"

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-8 pt-20 pb-16">
      {/* Photo + name row */}
      <div className="flex items-center gap-8">
        <div className="relative w-28 h-28 rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
          {/* Replace src with your actual photo path */}
          <div className="absolute inset-0 bg-stone-300" />
          {/* <Image src="/images/headshot.jpg" alt="Bryan Lim" fill className="object-cover" /> */}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-[var(--foreground)] leading-tight">
          Nice to meet you, I&apos;m Bryan Lim
        </h1>
      </div>

      {/* Bio */}
      <p className="mt-8 max-w-2xl text-[var(--text-muted)] text-lg leading-relaxed">
        I&apos;m a builder at heart — working at the intersection of business and technology.
        Incoming NUS Business student, currently at PwC&apos;s Risk & AI team. I build AI agents,
        tools, and products that solve real problems.
      </p>
    </section>
  )
}
