import React from 'react'
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Service from './components/Service';
import Contact from './components/Contact';
import Footer from './components/Footer';

function LandingPage() {
  return (
    <div>
     <Navbar/>
     <Hero/>
     <About/>
     <Service/>
     <Contact/>
     <Footer/>
    </div>
  );
}

export default LandingPage;