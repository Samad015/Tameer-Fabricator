import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const scene = useRef(null);

  useEffect(() => {
    const element = scene.current;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let frame = 0;

    function update() {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      const travel = Math.min(height, window.innerHeight) * 0.8;
      const progress = Math.max(0, Math.min(1, (Math.min(element.offsetTop, window.innerHeight * 0.28) - top) / travel));
      element.style.setProperty('--shutter-offset', `${-86 * progress}%`);
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    function stop() {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    function syncPreference() {
      stop();
      if (motion.matches) {
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        update();
      }
    }

    syncPreference();
    motion.addEventListener('change', syncPreference);
    return () => {
      stop();
      motion.removeEventListener('change', syncPreference);
    };
  }, []);

  return (
    <section className="welcome-hero">
      <div className="welcome-copy">
        <p className="eyebrow">Made for your everyday</p>
        <h1 className="workshop-headline">
          {['A stronger shutter.', 'A little more', 'peace of mind.'].map((line) => (
            <span className="headline-row" key={line}><span>{line} </span></span>
          ))}
        </h1>
        <p className="welcome-description">
          Rolling shutters for your shop, garage, or workspace. We’ll help you find the right fit.
        </p>
        <div className="welcome-actions">
          <a className="warm-button" href="#contact-form">Request a callback <ArrowRight size={20} /></a>
          <a className="quiet-link" href="#estimator">Get a price estimate ↗</a>
        </div>
        <p className="welcome-note">Made to measure. Installed with care.</p>
      </div>
      <figure ref={scene} className="shutter-scene" aria-label="Illustration of a made-to-measure rolling shutter">
        <figcaption>a space worth protecting.</figcaption>
        <div className="shutter-frame">
          <div className="shutter-travel">
            <div className="shutter-slats"><span className="shutter-handle" /></div>
          </div>
        </div>
        <span className="scene-caption">BUILT AROUND YOUR SPACE</span>
      </figure>
    </section>
  );
}
