import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import GallerySection from "@/components/GallerySection"
import VideoSection from "@/components/VideoSection"
import FormPlaceholder from "@/components/FormPlaceholder"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <VideoSection />
        <FormPlaceholder />
      </main>
      <Footer />
    </>
  )
}
