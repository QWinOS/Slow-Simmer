import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import GallerySection from "@/components/GallerySection"
import VideoSection from "@/components/VideoSection"
import MembershipSection from "@/components/MembershipSection"
import { RegistrationProvider } from "@/components/RegistrationProvider"
import RegistrationFlowLazy from "@/components/RegistrationFlowLazy"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <RegistrationProvider>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <VideoSection />
        <MembershipSection />
        <RegistrationFlowLazy />
      </main>
      <Footer />
    </RegistrationProvider>
  )
}
