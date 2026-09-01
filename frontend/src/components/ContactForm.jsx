import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    width: "",
    height: "",
    shutterType: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: null, message: "" });
  const [loading, setLoading] = useState(false);
  const [showShutterPopup, setShowShutterPopup] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleShutterSelect = (type) => {
    setFormData({
      ...formData,
      shutterType: type,
    });
    setShowShutterPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus({
        type: "error",
        message: "Name and Phone number are required fields.",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          type: "success",
          message: data.message || "Quote request submitted successfully!",
        });
        setFormData({
          name: "",
          phone: "",
          width: "",
          height: "",
          shutterType: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.message || "Failed to submit quote request.",
        });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setStatus({
        type: "error",
        message:
          "Server error! Please check if backend is running on port 5001.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="contact-form" className="space-y-3 max-w-md mx-auto">
      {status.message && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 text-xs font-semibold ${
            status.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-200">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-200">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 00000 00000"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-200">
            Width (in ft)
          </label>
          <input
            type="number"
            name="width"
            value={formData.width}
            onChange={handleChange}
            placeholder="e.g. 10"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-200">
            Height (in ft)
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="e.g. 8"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-slate-200">
          Shutter Type
        </label>
        <button
          type="button"
          onClick={() => setShowShutterPopup(true)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-left text-white focus:outline-none focus:border-amber-500 transition hover:border-amber-500 cursor-pointer"
        >
          {formData.shutterType ? formData.shutterType : "Select Shutter Type"}
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1 text-slate-200">
          Requirements / Project Specs
        </label>
        <textarea
          name="message"
          rows="3"
          value={formData.message}
          onChange={handleChange}
          placeholder="Describe your requirement..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500 transition resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 text-slate-950 font-black py-2.5 rounded-lg hover:bg-amber-400 transition text-sm flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send size={16} /> Submit Quote Request
          </>
        )}
      </button>

      {showShutterPopup && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowShutterPopup(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-4 w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-white mb-3">
              Select Shutter Type
            </h3>
            <div className="space-y-2">
              {["Manual", "Gear", "Motorized"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleShutterSelect(type)}
                  className={`w-full text-left p-2 text-sm rounded-lg border transition cursor-pointer ${
                    formData.shutterType === type
                      ? "bg-amber-500 border-amber-500 text-slate-950 font-bold"
                      : "bg-slate-800 border-slate-700 text-white hover:border-amber-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowShutterPopup(false)}
              className="w-full mt-3 p-2 text-sm rounded-lg border border-slate-700 text-slate-300 hover:border-amber-500 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </form>
  );
}