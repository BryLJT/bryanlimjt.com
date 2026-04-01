import HomeHeroSection from "@/components/HomeHeroSection"
import Hero from "@/components/Hero"
import CertificationsCarousel from "@/components/CertificationsCarousel"
import GlobeWrapper from "@/components/GlobeWrapper"

export default function Home() {
  return (
    <>
      {/* Hero — full-width so scroll-driven background color reaches edge to edge */}
      <HomeHeroSection>
        <Hero />
        <CertificationsCarousel />
      </HomeHeroSection>

      {/* Globe — full-bleed dark section, runs to footer */}
      <GlobeWrapper />
    </>
  )
}
