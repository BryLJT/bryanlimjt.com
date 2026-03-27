import Image from "next/image"

export default function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-8 pt-12 pb-20 md:pt-20 md:pb-36">
      {/* Photo + name — stacks vertically on mobile, side-by-side on md+ */}
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
        <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden bg-stone-200 flex-shrink-0">
          <Image
            src="/images/headshot.jpeg"
            alt="Bryan Lim"
            fill
            sizes="(max-width: 768px) 160px, 208px"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] leading-tight text-center md:text-left">
          Nice to meet you,<br />I&apos;m Bryan Lim
        </h1>
      </div>

      {/* Bio */}
      <p className="mt-8 max-w-2xl text-[var(--text-muted)] text-base md:text-lg leading-relaxed text-center md:text-left">
        I&apos;m a builder at heart — working at the intersection of business and technology.
        Incoming NUS Business student, currently at PwC&apos;s Risk Services & AI team. I build cloud
        architecture, AI agents, and solutions to real problems.
      </p>
    </section>
  )
}
