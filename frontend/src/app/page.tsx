'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import BenefitsSection from '@/components/BenefitsSection';
import AdminControlSection from '@/components/AdminControlSection';
import PricingSection from '@/components/PricingSection';

export default function Home() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <BenefitsSection />
        <AdminControlSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
