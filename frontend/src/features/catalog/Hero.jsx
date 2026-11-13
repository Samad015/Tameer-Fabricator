import React from 'react';
import {ArrowRight} from 'lucide-react';
export default function Hero(){return <section className="welcome-hero">
 <div className="welcome-copy"><p className="eyebrow">Made for your everyday</p><h1>A stronger shutter.<br/>A little more<br/>peace of mind.</h1><p className="welcome-description">Rolling shutters for your shop, garage, or workspace. We’ll help you find the right fit.</p><div className="welcome-actions"><a className="warm-button" href="#contact-form">Request a callback <ArrowRight size={20}/></a><a className="quiet-link" href="#estimator">Get a price estimate ↗</a></div><p className="welcome-note">Made to measure. Installed with care.</p></div>
 <figure className="shutter-scene" aria-label="Illustration of a made-to-measure rolling shutter"><figcaption>a space worth protecting.</figcaption><div className="shutter-frame"><div className="shutter-slats"><span className="shutter-handle"/></div></div><span className="scene-caption">BUILT AROUND YOUR SPACE</span></figure>
 </section>;}
