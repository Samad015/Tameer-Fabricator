import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Estimator from './components/Estimator';
import Specifications from './components/Specifications';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import { AuthCard, LoginPage, SignupPage, VerifyOtp } from './components/AuthPages';
import DealerDashboard from './components/DealerDashboard';
import DealerProfile from './components/DealerProfile';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
      <Navbar />

      <Routes>
        <Route path="/" element={
          <main>
            <Hero />
            <Services />
            <Estimator />
            <Specifications />
            <About />
            <ContactForm />
          </main>
        } />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Dashboard & Profile Routes */}
        <Route path="/dashboard" element={<DealerDashboard />} />
        <Route path="/dealer/:dealerId" element={<DealerProfile />} />
      </Routes>

      <Footer />
    </div>
  );
}