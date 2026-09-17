import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Estimator from './components/Estimator';
import Specifications from './components/Specifications';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

import {
  LoginPage,
  SignupPage,
  VerifyOtp,
  CompleteProfilePage,
  ForgotPasswordPage
} from './components/AuthPages';

import DealerDashboard from './components/DealerSearch';
import DealerProfile from './components/DealerDetail';
import MyWorkshop from './components/MyWorkshop';

// Only redirects to Home on actual Page Reload (F5) or Tab Re-open
function InitialLoadRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const navEntries = performance.getEntriesByType('navigation');
    const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';
    const isNewSession = !sessionStorage.getItem('app_session');

    sessionStorage.setItem('app_session', 'true');

    if ((isReload || isNewSession) && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
          <Navbar />

          <InitialLoadRedirect />

          <Routes>
            <Route
              path="/"
              element={
                <main>
                  <Hero />
                  <Services />
                  <Estimator />
                  <Specifications />
                  <About />
                  <ContactForm />
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
          </Routes>

          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}