import Features from "../components/landing/Features";
import HowToUse from "../components/landing/HowToUse";
import WhyUseIt from "../components/landing/WhyUseIt";
import Cta from "../components/landing/Cta";
import Footer from "../components/landing/Footer";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Background from "../components/landing/Background";

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="relative">
        <Background />

        <Navbar />

        <Hero />
      </section>

      <Features />

      <HowToUse />

      <WhyUseIt />

      <Cta />

      <Footer />
    </main>
  );
}
