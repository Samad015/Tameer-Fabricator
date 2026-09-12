import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Estimator from './components/Estimator';
import Specifications from './components/Specifications';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

import { AuthCard, LoginPage, SignupPage, VerifyOtp, CompleteProfilePage } from './components/AuthPages';
import DealerDashboard from './components/DealerSearch';
import DealerProfile from './components/DealerDetail';

export default function App() {
  return (
    <AuthProvider>
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

          {/* Auth & Subscription Flow Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          {/* Public & Customer View Routes */}
          <Route path="/dashboard" element={<DealerDashboard />} />
          <Route path="/dealer/:dealerId" element={<DealerProfile />} />
        </Routes>

        <Footer />
      </div>
    </AuthProvider>
  );
}