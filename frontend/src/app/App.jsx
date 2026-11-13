import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeContext.jsx';
import { AuthProvider } from '../features/auth/AuthContext.jsx';

import Navbar from '../components/layout/Navbar.jsx';
import Hero from '../features/catalog/Hero.jsx';
import About from '../features/catalog/About.jsx';
import Services from '../features/catalog/Services.jsx';
import Estimator from '../features/quotes/Estimator.jsx';
import Specifications from '../features/catalog/Specifications.jsx';
import ContactForm from '../features/quotes/ContactForm.jsx';
import Footer from '../components/layout/Footer.jsx';

import {
  LoginPage,
  SignupPage,
  VerifyOtp,
  CompleteProfilePage,
  ForgotPasswordPage
} from '../features/auth/AuthPages.jsx';

import DealerDashboard from '../features/dealers/DealerSearch.jsx';
import DealerProfile from '../features/dealers/DealerDetail.jsx';
import MyWorkshop from '../features/workshop/MyWorkshop.jsx';

function ScrollToAnchor(){
 const {pathname,hash}=useLocation();
 useEffect(()=>{if(hash){const frame=requestAnimationFrame(()=>document.getElementById(hash.slice(1))?.scrollIntoView());return ()=>cancelAnimationFrame(frame);}window.scrollTo(0,0);},[pathname,hash]);
 return null;
}
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="tameer-app min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
          <Navbar />
          <ScrollToAnchor />



          <Routes>
            <Route
              path="/"
              element={
                <main className="friendly-home">
                  <Hero />
                  <Services />
                  <Estimator />
                  <About />
                  <section className="contact-section">
                    <div><p className="eyebrow">We’re here to help</p><h2>What are you working on?</h2><p>Leave your details and tell us a little about your project. Not sure about measurements? You can add those later.</p></div>
                    <ContactForm />
                  </section>
                  <Specifications />
                </main>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Dealer Routes */}
            <Route path="/my-workshop" element={<MyWorkshop />} />
            <Route path="/dashboard" element={<DealerDashboard />} />
            <Route path="/dealer/:dealerId" element={<DealerProfile />} />
            <Route path="*" element={<main className="mx-auto max-w-3xl px-6 py-24"><h1>Page not found</h1><p className="mt-6">Let’s get you back to your project.</p><a className="warm-button mt-6" href="/">Back to home →</a></main>} />
          </Routes>

          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}