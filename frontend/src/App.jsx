import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Estimator from './components/Estimator';
import Specifications from './components/Specifications';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import { LoginPage, SignupPage } from './components/AuthPages';

export default function App() {
  // 'home' | 'login' | 'signup'
  const [page, setPage] = useState('home');

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Navbar always stays on top, regardless of page */}
      <Navbar onNavigate={setPage} />

      {page === 'login' && <LoginPage onNavigate={setPage} />}
      {page === 'signup' && <SignupPage onNavigate={setPage} />}

      {page === 'home' && (
        <main>
          {/* 1. Hero Section */}
          <Hero />

          {/* 2. Services Section */}
          <Services />

          {/* 3. Calculate Price (Estimator) */}
          <Estimator />


          {/* 4. Specifications Chart (Calculate ke theek niche) */}
          <Specifications />

          {/* 5. About Section */}
          <About />

          {/* 6. Contact Form Section */}
          <ContactForm />
        </main>
      )}

      {/* Footer only on home page */}
      {page === 'home' && <Footer />}
    </div>
  );
}