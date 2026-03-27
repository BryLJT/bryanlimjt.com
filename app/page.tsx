import HomeHeroSection from "@/components/HomeHeroSection"
import GlobeWrapper from "@/components/GlobeWrapper"

export default function Home() {
  return (
    <>
      {/* Hero — full-width so scroll-driven background color reaches edge to edge */}
      <HomeHeroSection />

      {/* Globe — full-bleed dark section, runs to footer */}
      <GlobeWrapper />
    </>
  )
}
