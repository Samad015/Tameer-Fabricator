import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./context/ThemeContext";
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
import MyWorkshop from './components/MyWorkshop'; // Workshop profile page

export default function App() {
  return (
    <ThemeProvider>
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

          {/* Dedicated Dealer Workshop Profile Page */}
          <Route path="/my-workshop" element={<MyWorkshop />} />

          {/* Public Customer View Routes (Optional general search) */}
          <Route path="/search-dealers" element={<DealerDashboard />} />
          <Route path="/dealer/:dealerId" element={<DealerProfile />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
      </div>
    </AuthProvider>
    </ThemeProvider>
  );
}