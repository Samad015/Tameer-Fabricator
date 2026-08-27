import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  User,
  Ruler,
} from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    width: "",
    height: "",
    message: "",
  });

  const [status, setStatus] = useState({
    type: null,
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus({
        type: "error",
        message: "Please fill in all required fields (*)",
      });
      return;
    }

    setLoading(true);

    setStatus({
      type: null,
      message: "",
    });

    try {
      const response = await fetch("http://localhost:5001/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();

      let data = {};

      try {
        if (text) {
          data = JSON.parse(text);
        }
      } catch (jsonError) {
        console.error("Invalid JSON response:", text);
      }

      if (!response.ok) {
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      if (data.success) {
        setStatus({
          type: "success",
          message: data.message || "Quote request submitted successfully!",
        });

        setFormData({
          name: "",
          phone: "",
          width: "",
          height: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to send request. Please try again.",
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);

      setStatus({
        type: "error",
        message:
          error.message ||
          "Server error! Please check if backend server is running.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-2xl mx-auto">
        {/* Form Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="px-5 sm:px-8 pt-7 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Send size={20} className="text-amber-400" />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Request a Free Quote
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Get a quick quotation for your project.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 space-y-6"
          >
            {/* Status */}
            {status.message && (
              <div
                className={`p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
                  status.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={20} className="shrink-0" />
                ) : (
                  <AlertCircle size={20} className="shrink-0" />
                )}

                <span>{status.message}</span>
              </div>
            )}

            {/* Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
                  <User size={16} className="text-amber-400" />
                  Full Name
                  <span className="text-amber-400">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-2">
                  <Phone size={16} className="text-amber-400" />
                  Phone Number
                  <span className="text-amber-400">*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                  className="w-full h-12 px-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-3">
                <Ruler size={16} className="text-amber-400" />
                Project Dimensions
                <span className="text-xs font-normal text-slate-500">
                  (Optional)
                </span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Width */}
                <div className="relative">
                  <input
                    type="number"
                    name="width"
                    min="0"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="Width"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    ft
                  </span>
                </div>

                {/* Height */}
                <div className="relative">
                  <input
                    type="number"
                    name="height"
                    min="0"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    ft
                  </span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Requirements / Project Details
                <span className="text-xs font-normal text-slate-500 ml-2">
                  (Optional)
                </span>
              </label>

              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your requirement..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Send size={19} />
                  Submit Quote Request
                </>
              )}
            </button>

            {/* Footer */}
            <div className="pt-1 text-center">
              <p className="text-xs text-slate-500">
                We'll contact you shortly regarding your quotation.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}