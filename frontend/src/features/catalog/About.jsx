import React from 'react';

export default function About() {
  return (
    <section id="about" className="care-section">
      <div><p className="eyebrow">From our workshop to your doorstep</p><h2>Good work starts with a conversation.</h2></div>
      <div><p>Every space is different. Tell us what you need, and we’ll help you choose a shutter that suits your space and budget.</p>
        <ol className="care-steps">
          <li><span>01</span><div><h3>Tell us about your space</h3><p>Share a few measurements, or ask us where to start.</p></div></li>
          <li><span>02</span><div><h3>Find the right fit</h3><p>Explore manual, gear-operated, and motorized options.</p></div></li>
          <li><span>03</span><div><h3>Plan the next step together</h3><p>Discuss the quote and installation with your fabricator.</p></div></li>
        </ol>
      </div>
    </section>
  );
}
