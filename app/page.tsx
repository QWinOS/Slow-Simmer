import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import GallerySection from "@/components/GallerySection"
import VideoSection from "@/components/VideoSection"
import { RegistrationForm } from "@/components/RegistrationForm"
import { RegistrationProvider } from "@/components/RegistrationProvider"
import { PaymentSection } from "@/components/PaymentSection"
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
        <RegistrationForm />
        <PaymentSection />
      </main>
      <Footer />
    </RegistrationProvider>
  )
}
