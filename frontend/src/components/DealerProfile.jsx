import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Globe,
  Link2,
  MessageCircle,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Fixed hero image — same banner shown on every dealer's page        */
/* ------------------------------------------------------------------ */
const HERO_IMAGE = "/images/dealer-hero.jpeg";

/* ------------------------------------------------------------------ */
/*  Sample dealer data — replace with a real fetch using dealerId      */
/*  (e.g. from your API / database) once you wire up the backend.      */
/* ------------------------------------------------------------------ */
const sampleDealer = {
  name: "Rajesh Kumar Rolling Shutters",
  tagline: "Quality You Can See, Reliability You Can Trust.",
  since: "1998",
  profilePic: "/images/dealer-1.jpg",
  mobile: "+91 8439860719",
  email: "rajesh@example.com",
  website: "www.rajeshshutters.com",
  address: "123, Civil Lines Road",
  city: "Bareilly, Uttar Pradesh",
  social: {
    instagram: "rajesh_rolling_shutter",
    facebook: "rajeshrollingshutter",
    linkedin: "rajesh-rolling-shutters",
  },
  catalog: [
    "/images/catalog/shutter-1.jpg",
    "/images/catalog/shutter-2.jpg",
    "/images/catalog/shutter-3.jpg",
    "/images/catalog/shutter-4.jpg",
    "/images/catalog/shutter-5.jpg",
    "/images/catalog/shutter-6.jpg",
  ],
};

export default function DealerProfile() {
  const { dealerId } = useParams(); // will be used once dealer data comes from an API
  const [selectedImage, setSelectedImage] = useState(null);

  const dealer = sampleDealer; // TODO: replace with fetched dealer using dealerId
  const whatsappNumber = dealer.mobile.replace(/[^\d]/g, "");

  return (
    <main className="bg-white min-h-screen">
      {/* ---------------------------------------------------------- */}
      {/* Hero — full-bleed installation photo with tagline overlay  */}
      {/* ---------------------------------------------------------- */}
      <section className="relative h-[380px] sm:h-[440px] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Rolling shutter installation"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        <div className="relative h-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8">
          <p className="text-white text-2xl sm:text-3xl font-black leading-snug max-w-sm drop-shadow-md">
            {dealer.tagline}
          </p>

          {/* Logo + name card, overlapping the base of the hero */}
          <div className="flex items-center gap-4">
            <img
              src={dealer.profilePic}
              alt={dealer.name}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-4 border-amber-500 shadow-lg flex-shrink-0"
            />
            <div>
              <h1 className="text-white text-xl sm:text-2xl font-black leading-tight">{dealer.name}</h1>
              <p className="text-amber-400 text-sm font-semibold">
                Serving customers since {dealer.since}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Follow On — social strip                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-slate-50 border-b border-slate-200 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-3">
          <span className="bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full">
            Follow On
          </span>

          {dealer.social.instagram && (
            <a
              href={`https://instagram.com/${dealer.social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-amber-600 transition"
            >
              <Link2 size={16} /> {dealer.social.instagram}
            </a>
          )}
          {dealer.social.facebook && (
            <a
              href={`https://facebook.com/${dealer.social.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-amber-600 transition"
            >
              <Link2 size={16} /> {dealer.social.facebook}
            </a>
          )}
          {dealer.social.linkedin && (
            <a
              href={`https://linkedin.com/company/${dealer.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-amber-600 transition"
            >
              <Link2 size={16} /> {dealer.social.linkedin}
            </a>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Contact bar — address / phone / email / website             */}
      {/* ---------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <MapPin size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Address</p>
              <p className="text-sm text-slate-800 font-medium">{dealer.address}, {dealer.city}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4">
            <Phone size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Phone</p>
              <a href={`tel:${dealer.mobile}`} className="text-sm text-slate-800 font-medium hover:text-amber-600">
                {dealer.mobile}
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

          <div className="flex items-start gap-3 p-4">
            <Globe size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs uppercase text-slate-400 font-semibold">Website</p>
              <p className="text-sm text-slate-800 font-medium">{dealer.website}</p>
            </div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <a
            href={`tel:${dealer.mobile}`}
            className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition"
          >
            <Phone size={18} /> Call Dealer
          </a>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-500 transition"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/* Product Catalog                                             */}
      {/* ---------------------------------------------------------- */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Product Catalog</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {dealer.catalog.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(src)}
              className="aspect-square overflow-hidden rounded-lg border border-slate-200 hover:border-amber-500 transition"
            >
              <img
                src={src}
                alt={`Catalog item ${idx + 1}`}
                className="h-full w-full object-cover hover:scale-105 transition duration-300"
              />
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-5 right-5 text-white bg-slate-800 rounded-full p-2 hover:bg-slate-700"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            <X size={22} />
          </button>
          <img
            src={selectedImage}
            alt="Catalog preview"
            className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
