import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

const HERO_IMAGE = "/images/dealer-hero.jpeg";

export default function DealerProfile() {
  const { dealerId } = useParams();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealerProfile = async () => {
      try {
        const res = await fetch(`/api/dealers/${dealerId}`);
        const data = await res.json();
        if (data.success) {
          setDealer(data.dealer);
        }
      } catch (err) {
        console.error("Error fetching dealer profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      fetchDealerProfile();
    }
  }, [dealerId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading dealer profile...</div>;
  }

  if (!dealer) {
    return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Dealer not found.</div>;
  }

  const whatsappNumber = dealer.phone ? dealer.phone.replace(/[^\d]/g, "") : "";

  return (
    <main className="bg-white min-h-screen">
      {/* Hero section */}
      <section className="relative h-[380px] sm:h-[440px] overflow-hidden">
        <img src={HERO_IMAGE} alt="Installation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="relative h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8">
          <p className="text-white text-2xl sm:text-3xl font-black max-w-sm drop-shadow-md">
            {dealer.companyName} - Rolling Shutters & Metal Fabrication Experts
          </p>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl border-4 border-amber-400 shadow-lg">
              {dealer.companyName?.charAt(0)}
            </div>
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-black">{dealer.companyName}</h1>
              <p className="text-amber-400 text-sm font-semibold">Owner: {dealer.name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <MapPin size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Address</p>
              <p className="text-sm text-slate-800 font-medium">{dealer.address}, Area: {dealer.area}, {dealer.city}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4">
            <Phone size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Phone</p>
              <a href={`tel:${dealer.phone}`} className="text-sm text-slate-800 font-medium hover:text-amber-600">
                {dealer.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4">
            <Mail size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Email</p>
              <a href={`mailto:${dealer.email}`} className="text-sm text-slate-800 font-medium hover:text-amber-600 break-all">
                {dealer.email}
              </a>
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <a href={`tel:${dealer.phone}`} className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition">
            <Phone size={18} /> Call Dealer
          </a>
          {whatsappNumber && (
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-500 transition">
              <MessageCircle size={18} /> WhatsApp
            </a>
          )}
        </div>
      </section>
    </main>
  );
}