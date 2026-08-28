import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Estimator from './components/Estimator';
import Specifications from './components/Specifications';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header Navigation */}
      <Navbar />

      <main>
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. About Section */}
        <About />

        {/* 4. Services Section */}
        <Services />

        {/* 5. Calculate Price (Estimator) */}
        <Estimator />

        {/* 6. Specifications Chart (Calculate ke theek niche) */}
        <Specifications />

        {/* 7. Contact Form Section */}
        <ContactForm />
      </main>

      {/* 8. Footer Section */}
      <Footer />
    </div>
  );
}